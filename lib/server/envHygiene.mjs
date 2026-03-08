const SECRET_HINTS = ['secret', 'private', 'token', 'password', 'apikey', 'api_key', 'client_secret'];
const ALLOWED_PUBLIC_PREFIXES = [
  'NEXT_PUBLIC_FIREBASE_',
];
const ALLOWED_PUBLIC_EXACT = new Set(['NEXT_PUBLIC_APP_URL']);

function normalizeKey(input) {
  return typeof input === 'string' ? input.trim() : '';
}

export function parseEnvKeys(envText) {
  const keys = [];
  const lines = typeof envText === 'string' ? envText.split(/\r?\n/) : [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    keys.push(trimmed.slice(0, eq).trim());
  }
  return keys;
}

export function findPublicSecretExposure(keys) {
  const rows = Array.isArray(keys) ? keys : [];
  const flagged = [];
  for (const raw of rows) {
    const key = normalizeKey(raw);
    if (!key.startsWith('NEXT_PUBLIC_')) continue;
    if (ALLOWED_PUBLIC_EXACT.has(key)) continue;
    if (ALLOWED_PUBLIC_PREFIXES.some((prefix) => key.startsWith(prefix))) continue;
    const lowered = key.toLowerCase();
    if (SECRET_HINTS.some((hint) => lowered.includes(hint))) {
      flagged.push(key);
    }
  }
  return flagged;
}
