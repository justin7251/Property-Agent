import { NextRequest, NextResponse } from 'next/server';
import { assertCanPerform, type PolicyAction } from '../auth/policy';
import type { TenantContext } from '../auth/tenantContext';
import { checkRateLimit } from './rateLimit.mjs';
import { requireServerAuthContext, type ServerAuthContext } from './requestAuth';

type FieldRule<T> = {
  required?: boolean;
  parse: (value: unknown) => T;
  message: string;
};

type SchemaShape = Record<string, FieldRule<unknown>>;
type RateLimitOptions = {
  routeKey: string;
  limit: number;
  windowMs: number;
  actor?: TenantContext | null;
};

export class SecurityError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function resolveRequestIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return (request.headers.get('x-real-ip') || '').trim() || 'unknown';
}

export function parseString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function parseEmail(value: unknown): string {
  const email = parseString(value).toLowerCase();
  if (!email || !email.includes('@')) return '';
  return email;
}

export async function readJsonBody<T>(request: NextRequest): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new SecurityError(400, 'bad_request', 'Invalid JSON payload.');
  }
}

export async function requireBearerAuth(request: NextRequest): Promise<ServerAuthContext> {
  try {
    return await requireServerAuthContext(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized request.';
    if (message.includes('Missing bearer token')) {
      throw new SecurityError(401, 'auth_missing', 'Missing bearer token.');
    }
    throw new SecurityError(401, 'auth_invalid', 'Authentication failed.');
  }
}

export function requirePermission(actor: TenantContext, action: PolicyAction): void {
  try {
    assertCanPerform(actor, action);
  } catch {
    throw new SecurityError(403, 'forbidden', `Forbidden: missing permission for ${action}.`);
  }
}

export function requireTenantScope(actor: TenantContext, resourceCompanyId: string, reason: string): void {
  if (!actor.isPlatformSuperadmin && resourceCompanyId !== actor.companyId) {
    throw new SecurityError(403, 'cross_tenant_forbidden', reason);
  }
}

export function validateRequestSchema<T extends SchemaShape>(payload: unknown, schema: T): {
  [K in keyof T]: ReturnType<T[K]['parse']>;
} {
  if (!payload || typeof payload !== 'object') {
    throw new SecurityError(400, 'bad_request', 'Request body must be an object.');
  }
  const input = payload as Record<string, unknown>;
  const parsed: Record<string, unknown> = {};

  for (const key of Object.keys(schema)) {
    const rule = schema[key];
    const value = input[key];
    const next = rule.parse(value);
    const missing =
      next === '' ||
      next === null ||
      next === undefined ||
      (Array.isArray(next) && next.length === 0);
    if (rule.required && missing) {
      throw new SecurityError(400, 'validation_error', rule.message);
    }
    parsed[key] = next;
  }

  return parsed as {
    [K in keyof T]: ReturnType<T[K]['parse']>;
  };
}

export function getRequestIdempotencyKey(request: NextRequest, payload?: Record<string, unknown>): string | null {
  const headerValue = parseString(request.headers.get('idempotency-key'));
  const bodyValue = parseString(payload?.idempotencyKey);
  const key = bodyValue || headerValue;
  if (!key) return null;
  if (key.length > 120) {
    throw new SecurityError(400, 'validation_error', 'Idempotency key is too long.');
  }
  return key;
}

export function enforceRateLimit(request: NextRequest, options: RateLimitOptions): void {
  const actorId = options.actor?.userId ? `uid:${options.actor.userId}` : '';
  const identity = actorId || `ip:${resolveRequestIp(request)}`;
  const key = `${options.routeKey}:${identity}`;
  const result = checkRateLimit({ key, limit: options.limit, windowMs: options.windowMs });
  if (!result.allowed) {
    throw new SecurityError(429, 'rate_limited', 'Too many requests. Please retry later.');
  }
}

export function securityErrorResponse(error: unknown, fallbackMessage: string): NextResponse {
  const knownSecurity = error instanceof SecurityError ? error : null;
  const knownObject =
    !knownSecurity &&
    error &&
    typeof error === 'object' &&
    typeof (error as { status?: unknown }).status === 'number' &&
    typeof (error as { code?: unknown }).code === 'string'
      ? (error as { status: number; code: string; message?: string })
      : null;
  const status = knownSecurity?.status || knownObject?.status || 400;
  const code = knownSecurity?.code || knownObject?.code || 'bad_request';
  const message = knownSecurity?.message || knownObject?.message || (error instanceof Error ? error.message : fallbackMessage);
  return NextResponse.json(
    {
      ok: false,
      error: message,
      code,
    },
    { status }
  );
}
