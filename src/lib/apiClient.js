// src/lib/apiClient.js
import { getLocalAuth, setAccessToken as setLocalAccessToken, clearLocalAuth } from './localAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

let isRefreshing = false;
let refreshPromise = null;
const queuedRequests = [];

/**
 * callQueuedRequests runs queued requests after refresh completes.
 */
function callQueuedRequests(success) {
  while (queuedRequests.length) {
    const cb = queuedRequests.shift();
    try { cb(); } catch (e) { /* ignore */ }
  }
}

/**
 * refreshAccessToken - use refresh token to get a new access token
 */
async function refreshAccessToken() {
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
export async function apiFetch(input, init, retry = true) {
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
    // queue this request until refresh completes
    return new Promise((resolve, reject) => {
      queuedRequests.push(async () => {
        try {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            reject(res);
            return;
          }
          // re-create headers with new access token
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

      // start refresh if not already running
      if (!isRefreshing) {
        refreshAccessToken().catch(() => { });
      }
    });
  }

  return res;
}

import { leagueService } from '@/services/leagueService';

export const leagueApiClient = {
  joinLeague: async (leagueId, userId) => {
    // In a real application, this would be an API call to your backend
    // For now, we'll use the mock leagueService
    return leagueService.joinLeague(leagueId, userId);
  },
  getAllLeagues: async () => {
    return leagueService.getAllLeagues();
  },
  getLeagueById: async (id) => {
    return leagueService.getLeagueById(id);
  },
};