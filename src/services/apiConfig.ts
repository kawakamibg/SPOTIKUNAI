const RENDER_API_URL = 'https://spotikunai.onrender.com';

export function resolveApiBaseUrl(): string {
  return RENDER_API_URL;
}

export const API_BASE_URL = resolveApiBaseUrl();