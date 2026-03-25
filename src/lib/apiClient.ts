// src/lib/apiClient.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;
const queuedRequests: Array<() => void> = [];

/**
 * callQueuedRequests runs queued requests after refresh completes.
 */
function callQueuedRequests(success: boolean) {
  while (queuedRequests.length) {
    const cb = queuedRequests.shift();
    if (cb) {
      try { cb(); } catch (e) { /* ignore */ }
    }
  }
}

// Mocks for local auth - these should be imported from somewhere if real
const getLocalAuth = () => {
  if (typeof window === 'undefined') return null;
  const auth = localStorage.getItem('auth');
  return auth ? JSON.parse(auth) : null;
};
const clearLocalAuth = () => {
  if (typeof window !== 'undefined') localStorage.removeItem('auth');
};
const setLocalAccessToken = (token: string) => {
  if (typeof window === 'undefined') return;
  const auth = getLocalAuth() || {};
  localStorage.setItem('auth', JSON.stringify({ ...auth, accessToken: token }));
};

/**
 * refreshAccessToken - use refresh token to get a new access token
 */
async function refreshAccessToken(): Promise<boolean> {
  const auth = getLocalAuth();
  if (!auth?.refreshToken) return false;

  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });
      if (!res.ok) {
        clearLocalAuth();
        return false;
      }
      const data = await res.json();
      if (!data?.accessToken) {
        clearLocalAuth();
        return false;
      }
      setLocalAccessToken(data.accessToken);
      return true;
    } catch (e) {
      clearLocalAuth();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  const result = await refreshPromise;
  callQueuedRequests(result);
  return result;
}

/**
 * apiFetch - wrapper around fetch that injects access token and attempts refresh on 401.
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit, retry: boolean = true): Promise<Response> {
  const auth = getLocalAuth();
  const headers = new Headers(init?.headers || {});
  headers.set('Accept', 'application/json');

  if (auth?.accessToken) headers.set('Authorization', `Bearer ${auth.accessToken}`);

  const res = await fetch(`${API_URL}${String(input).startsWith('/') ? '' : ''}${input}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  // If 401 and we have a refresh token, try to refresh then retry once
  if (res.status === 401 && retry) {
    return new Promise((resolve, reject) => {
      queuedRequests.push(async () => {
        try {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            reject(res);
            return;
          }
          const auth2 = getLocalAuth();
          const headers2 = new Headers(init?.headers || {});
          headers2.set('Accept', 'application/json');
          if (auth2?.accessToken) headers2.set('Authorization', `Bearer ${auth2.accessToken}`);

          const retried = await fetch(`${API_URL}${String(input).startsWith('/') ? '' : ''}${input}`, {
            ...init,
            headers: headers2,
            credentials: 'include',
          });
          resolve(retried);
        } catch (err) {
          reject(err);
        }
      });

      if (!isRefreshing) {
        refreshAccessToken().catch(() => { });
      }
    });
  }

  return res;
}
