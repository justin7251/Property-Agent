export function reportErrorStatus(message) {
  if (message.includes('Missing bearer token')) return 401;
  if (message.includes('Forbidden')) return 403;

  if (
    message.includes('Invalid `from` date') ||
    message.includes('Invalid `to` date') ||
    message.includes('Invalid date range') ||
    message.includes('Date range too large')
  ) {
    return 400;
  }

  if (
    message.includes('Firebase Admin credentials not configured') ||
    message.includes('Could not load the default credentials')
  ) {
    return 500;
  }

  return 500;
}
