/**
 * Small browser-facing client for our own Technology Intelligence API.
 * In production Nginx forwards /api requests to the separate Node service.
 */
export async function apiRequest(path, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_TRENDS_API_BASE || '';
  const { timeout = 40_000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || `API returned HTTP ${response.status}.`);
    }

    return payload;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
