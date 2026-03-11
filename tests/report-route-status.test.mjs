import test from 'node:test';
import assert from 'node:assert/strict';
import { reportErrorStatus } from '../lib/server/reportErrorStatus.mjs';

test('reportErrorStatus returns 401 for missing bearer token', () => {
  assert.equal(reportErrorStatus('Missing bearer token.'), 401);
});

test('reportErrorStatus returns 403 for forbidden access', () => {
  assert.equal(reportErrorStatus('Forbidden: missing permission for report.read.'), 403);
});

test('reportErrorStatus returns 500 for admin credentials failures', () => {
  assert.equal(
    reportErrorStatus('Could not load the default credentials. Browse to https://cloud.google.com/docs/authentication/getting-started for more information.'),
    500
  );
  assert.equal(
    reportErrorStatus('Firebase Admin credentials not configured for server routes.'),
    500
  );
});

test('reportErrorStatus returns 400 for date filter validation errors', () => {
  assert.equal(reportErrorStatus('Invalid `from` date. Use ISO format.'), 400);
  assert.equal(reportErrorStatus('Invalid `to` date. Use ISO format.'), 400);
  assert.equal(reportErrorStatus('Invalid date range: `from` must be before `to`.'), 400);
  assert.equal(reportErrorStatus('Date range too large. Maximum is 366 days.'), 400);
});
