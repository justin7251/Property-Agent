import { applicationDefault, cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

function hasLocalAdcFile(): boolean {
  const home = homedir();
  const candidates = [
    join(home, '.config', 'gcloud', 'application_default_credentials.json'),
    join(home, 'AppData', 'Roaming', 'gcloud', 'application_default_credentials.json'),
  ];
  return candidates.some((path) => existsSync(path));
}

function buildCredential() {
  const serviceAccountJson = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };
    return cert({
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, '\n'),
    });
  }

  // Local dev guard: fail fast with a clear message when no admin credential source exists.
  if (process.env.NODE_ENV !== 'production') {
    const hasEnvPath = !!process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!hasEnvPath && !hasLocalAdcFile()) {
      throw new Error(
        'Firebase Admin credentials not configured for server routes. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON in .env, ' +
        'or run `gcloud auth application-default login`, or set GOOGLE_APPLICATION_CREDENTIALS to a service-account key path.'
      );
    }
  }

  return applicationDefault();
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  return initializeApp({
    credential: buildCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

export function adminDb() {
  return getFirestore(getAdminApp());
}
