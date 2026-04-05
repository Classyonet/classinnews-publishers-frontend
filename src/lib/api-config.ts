const sanitizeApiUrl = (
  url: string | undefined,
  fallback: string,
  allowedHosts: readonly string[]
): string => {
  const normalized = (url || '').trim().replace(/\/+$/, '');

  if (!normalized) {
    return fallback;
  }

  if (process.env.NODE_ENV !== 'production') {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);

    if (
      parsed.protocol === 'https:' &&
      allowedHosts.includes(parsed.hostname.toLowerCase())
    ) {
      return normalized;
    }
  } catch {
    // Fall through to the known-good production domain below.
  }

  return fallback;
};

export const PUBLISHERS_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_PUBLISHERS_API,
  'https://publisher-api.classinnews.com',
  ['publisher-api.classinnews.com']
);

export const ADMIN_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_ADMIN_API_URL,
  'https://admin-api.classinnews.com',
  ['admin-api.classinnews.com']
);
