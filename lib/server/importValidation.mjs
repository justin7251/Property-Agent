function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeEmail(value) {
  return normalizeString(value).toLowerCase();
}

export function parseImportEnvelope(payload, maxRows = 200) {
  if (!isObject(payload)) {
    throw new Error('Payload must be an object.');
  }
  const rows = Array.isArray(payload.rows) ? payload.rows : null;
  if (!rows) {
    throw new Error('`rows` must be an array.');
  }
  if (rows.length === 0) {
    throw new Error('`rows` cannot be empty.');
  }
  if (rows.length > maxRows) {
    throw new Error(`` + '`rows` exceeds max batch size ' + maxRows + '.');
  }
  const idempotencyKey = normalizeString(payload.idempotencyKey);
  return { rows, idempotencyKey: idempotencyKey || null };
}

export function sanitizePropertyPatch(input) {
  if (!isObject(input)) return { ok: false, error: 'Patch must be an object.' };
  const out = {};
  const allow = new Set([
    'title',
    'address',
    'price',
    'priceUnit',
    'status',
    'type',
    'bedrooms',
    'bathrooms',
    'sqft',
    'agentId',
    'landlordId',
    'images',
  ]);
  for (const [key, value] of Object.entries(input)) {
    if (!allow.has(key)) return { ok: false, error: `Unsupported field: ${key}.` };
    if (key === 'images') {
      if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
        return { ok: false, error: 'images must be a string array.' };
      }
      out.images = value;
      continue;
    }
    if (key === 'price' || key === 'bedrooms' || key === 'bathrooms' || key === 'sqft') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        return { ok: false, error: `${key} must be a non-negative number.` };
      }
      out[key] = value;
      continue;
    }
    const normalized = normalizeString(value);
    if (!normalized) return { ok: false, error: `${key} is invalid.` };
    out[key] = normalized;
  }
  if (Object.keys(out).length === 0) {
    return { ok: false, error: 'Patch is empty.' };
  }
  return { ok: true, value: out };
}

export function sanitizeUserPatch(input) {
  if (!isObject(input)) return { ok: false, error: 'Patch must be an object.' };
  const out = {};
  const keys = Object.keys(input);
  for (const key of keys) {
    if (key === 'role' || key === 'companyId' || key === 'uid' || key === 'isPlatformSuperadmin') {
      return { ok: false, error: `Forbidden field in patch: ${key}.` };
    }
    if (key !== 'name' && key !== 'email' && key !== 'permissions') {
      return { ok: false, error: `Unsupported field: ${key}.` };
    }
  }
  if ('name' in input) {
    const name = normalizeString(input.name);
    if (!name) return { ok: false, error: 'name is invalid.' };
    out.name = name;
  }
  if ('email' in input) {
    const email = normalizeEmail(input.email);
    if (!email || !email.includes('@')) return { ok: false, error: 'email is invalid.' };
    out.email = email;
  }
  if ('permissions' in input) {
    if (!isObject(input.permissions)) return { ok: false, error: 'permissions must be an object.' };
    const perms = {};
    for (const [key, value] of Object.entries(input.permissions)) {
      if (typeof value !== 'boolean') return { ok: false, error: `permissions.${key} must be boolean.` };
      perms[key] = value;
    }
    out.permissions = perms;
  }
  if (Object.keys(out).length === 0) return { ok: false, error: 'Patch is empty.' };
  return { ok: true, value: out };
}

export function parseCompanyRole(value) {
  if (value === 'owner' || value === 'admin' || value === 'team_lead' || value === 'agent' || value === 'landlord' || value === 'contractor') {
    return value;
  }
  return null;
}

export function sanitizePropertyImportRow(row) {
  const patch = sanitizePropertyPatch(row);
  if (!patch.ok) return patch;
  const value = patch.value;
  const required = ['title', 'address', 'price', 'priceUnit', 'status', 'type', 'bedrooms', 'bathrooms', 'sqft', 'agentId', 'landlordId'];
  for (const key of required) {
    if (!(key in value)) return { ok: false, error: `Missing required field: ${key}.` };
  }
  if (!('images' in value)) value.images = [];
  if (!('createdAt' in value)) value.createdAt = new Date().toISOString();
  return { ok: true, value };
}

export function sanitizeUserImportRow(row) {
  if (!isObject(row)) return { ok: false, error: 'Row must be an object.' };
  const name = normalizeString(row.name);
  const email = normalizeEmail(row.email);
  if (!name) return { ok: false, error: 'name is required.' };
  if (!email || !email.includes('@')) return { ok: false, error: 'email is invalid.' };
  const role = parseCompanyRole(row.role || 'agent');
  if (!role) return { ok: false, error: 'role is invalid.' };
  const uid = normalizeString(row.uid || row.id);
  return {
    ok: true,
    value: {
      uid: uid || null,
      name,
      email,
      role,
    },
  };
}
