const sanitizeApiUrl = (url: string | undefined, fallback: string): string => {
  const normalized = (url || '').trim().replace(/\/+$/, '');

  if (!normalized) {
    return fallback;
  }

  return normalized;
};

export const PUBLISHERS_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_PUBLISHERS_API,
  'https://publisher-api.classinnews.com'
);

export const ADMIN_API_URL = sanitizeApiUrl(
  process.env.NEXT_PUBLIC_ADMIN_API_URL,
  'https://admin-api.classinnews.com'
);
