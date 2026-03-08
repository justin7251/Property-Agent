const ALLOWED_INQUIRY_STATUS = new Set(['new', 'approved', 'rejected', 'contacted', 'converted']);

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalString(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidIsoDate(value) {
  if (!value) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function parseIdempotencyKey(payload, headerKey) {
  const fromPayload = normalizeOptionalString(payload?.idempotencyKey);
  const fromHeader = normalizeOptionalString(headerKey);
  const key = fromPayload || fromHeader;
  if (!key) return null;
  if (key.length > 120) {
    throw new Error('Idempotency key is too long.');
  }
  return key;
}

function parseCreateInquiryPayload(payload) {
  const row = payload && typeof payload === 'object' ? payload : {};
  const clientName = normalizeString(row.clientName);
  const clientEmail = normalizeString(row.clientEmail).toLowerCase();
  const propertyId = normalizeString(row.propertyId);
  const propertyTitle = normalizeString(row.propertyTitle);
  const agentId = normalizeString(row.agentId);
  const message = normalizeString(row.message);
  const date = normalizeOptionalString(row.date);

  if (!clientName) throw new Error('clientName is required.');
  if (!clientEmail || !isValidEmail(clientEmail)) throw new Error('clientEmail must be a valid email.');
  if (!propertyId) throw new Error('propertyId is required.');
  if (!propertyTitle) throw new Error('propertyTitle is required.');
  if (!agentId) throw new Error('agentId is required.');
  if (!message) throw new Error('message is required.');
  if (date && !isValidIsoDate(date)) throw new Error('date must be a valid date string.');

  return {
    clientName,
    clientEmail,
    propertyId,
    propertyTitle,
    agentId,
    message,
    date,
  };
}

function nowIso() {
  return new Date().toISOString();
}

export async function processInquiryCreate({ actor, payload, idempotencyKey, deps }) {
  const input = parseCreateInquiryPayload(payload);
  const dedupeKey = parseIdempotencyKey(payload, idempotencyKey);
  if (dedupeKey) {
    const existing = await deps.readIdempotentResponse(actor.companyId, 'inquiries_create', dedupeKey);
    if (existing) return existing;
  }

  const property = await deps.getDoc('properties', input.propertyId);
  if (!property.exists) throw new Error('Property not found.');
  if (!actor.isPlatformSuperadmin && property.data.companyId !== actor.companyId) {
    throw new Error('Cross-company property reference is forbidden.');
  }

  const agent = await deps.getDoc('agents', input.agentId);
  if (!agent.exists) throw new Error('Agent not found.');
  if (!actor.isPlatformSuperadmin && agent.data.companyId !== actor.companyId) {
    throw new Error('Cross-company agent reference is forbidden.');
  }

  const now = nowIso();
  const status = 'new';
  if (!ALLOWED_INQUIRY_STATUS.has(status)) {
    throw new Error('Invalid inquiry status.');
  }
  const inquiryDate = input.date || now;
  const inquiry = {
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    propertyId: input.propertyId,
    propertyTitle: input.propertyTitle,
    agentId: input.agentId,
    status,
    message: input.message,
    date: inquiryDate,
    companyId: actor.companyId,
    createdAt: now,
    updatedAt: now,
    updatedBy: actor.userId,
    source: 'api_create',
    statusHistory: [{ from: status, to: status, at: now, by: actor.userId }],
  };
  const created = await deps.addDoc('inquiries', inquiry);
  const result = {
    ok: true,
    inquiryId: created.id,
    status,
    createdAt: now,
  };

  if (dedupeKey) {
    await deps.writeIdempotentResponse(actor.companyId, actor.userId, 'inquiries_create', dedupeKey, 200, result);
  }
  return { status: 200, payload: result };
}
