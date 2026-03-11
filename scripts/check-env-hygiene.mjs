import fs from 'node:fs';
import path from 'node:path';
import { findPublicSecretExposure, parseEnvKeys } from '../lib/server/envHygiene.mjs';

const root = process.cwd();
const files = ['.env.example', '.env'];
let failed = false;

for (const file of files) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  const keys = parseEnvKeys(content);
  const flagged = findPublicSecretExposure(keys);
  if (flagged.length === 0) continue;
  failed = true;
  console.error(`[env-hygiene] ${file}: NEXT_PUBLIC secrets detected:`);
  for (const key of flagged) {
    console.error(` - ${key}`);
  }
}

if (failed) {
  console.error('[env-hygiene] Move secret keys to server-only env vars (without NEXT_PUBLIC_).');
  process.exit(1);
}

console.log('[env-hygiene] OK');
