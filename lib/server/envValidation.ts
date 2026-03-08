import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

let validated = false;

function hasLocalAdcFile(): boolean {
  const home = homedir();
  const candidates = [
    join(home, '.config', 'gcloud', 'application_default_credentials.json'),
    join(home, 'AppData', 'Roaming', 'gcloud', 'application_default_credentials.json'),
  ];
  return candidates.some((path) => existsSync(path));
}

function requiredPublicFirebaseVars(): string[] {
  return [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];
}

export function validateAppEnv(): void {
  if (validated) return;
  validated = true;

  const missingPublic = requiredPublicFirebaseVars().filter((key) => {
    const value = process.env[key];
    return !value || !value.trim();
  });
  if (missingPublic.length > 0) {
    throw new Error(
      `Missing required Firebase client env vars: ${missingPublic.join(', ')}. ` +
      'Add them to .env and restart the dev server.'
    );
  }

  const hasInlineAdmin = !!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  const hasAdminPath = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const hasAdc = hasLocalAdcFile();
  if (!hasInlineAdmin && !hasAdminPath && !hasAdc) {
    // Do not block app startup because reports have client fallback in local dev.
    console.warn(
      '[env] Firebase Admin credentials not detected. ' +
      'Server report endpoints will fail until configured. ' +
      'Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS, ' +
      'or run `gcloud auth application-default login`.'
    );
  }
}
