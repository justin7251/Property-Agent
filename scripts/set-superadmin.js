#!/usr/bin/env node
'use strict';

const admin = require('firebase-admin');

function parseArgs(argv) {
  const args = {
    uid: '',
    grant: false,
    revoke: false,
    projectId: process.env.FIREBASE_PROJECT_ID || '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--uid' && argv[i + 1]) {
      args.uid = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--project' && argv[i + 1]) {
      args.projectId = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === '--grant') {
      args.grant = true;
      continue;
    }
    if (arg === '--revoke') {
      args.revoke = true;
      continue;
    }
  }

  return args;
}

function printUsageAndExit(message) {
  if (message) {
    console.error(message);
  }
  console.log(
    [
      'Usage:',
      '  node scripts/set-superadmin.js --grant --uid <UID> [--project <PROJECT_ID>]',
      '  node scripts/set-superadmin.js --revoke --uid <UID> [--project <PROJECT_ID>]',
      '',
      'Auth:',
      '  Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path.',
    ].join('\n')
  );
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.uid) {
    printUsageAndExit('Missing required --uid.');
  }
  if (args.grant === args.revoke) {
    printUsageAndExit('Choose exactly one of --grant or --revoke.');
  }

  const projectId = args.projectId || undefined;
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });

  const auth = admin.auth();
  const db = admin.firestore();
  const userRecord = await auth.getUser(args.uid);
  const existingClaims = userRecord.customClaims || {};
  const isGrant = args.grant;
  const nextClaims = { ...existingClaims, superadmin: isGrant };

  if (!isGrant) {
    delete nextClaims.superadmin;
  }

  await auth.setCustomUserClaims(args.uid, nextClaims);

  const role = isGrant ? 'superadmin' : 'agent';
  await db.collection('users').doc(args.uid).set(
    {
      uid: args.uid,
      email: userRecord.email || '',
      name: userRecord.displayName || '',
      role,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  console.log(
    `${isGrant ? 'Granted' : 'Revoked'} superadmin for ${args.uid}` +
      `${projectId ? ` in project ${projectId}` : ''}.`
  );
}

main().catch((error) => {
  console.error('Failed to update superadmin claim:', error.message);
  process.exit(1);
});
