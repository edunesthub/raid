// src/lib/localAuth.js

const ACCESS_KEY = 'raid_access_token';
const REFRESH_KEY = 'raid_refresh_token';
const USER_KEY = 'raid_user';

export function getLocalAuth() {
  try {
    const accessToken = localStorage.getItem(ACCESS_KEY);
    const refreshToken = localStorage.getItem(REFRESH_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    return {
      accessToken,
      refreshToken,
      user: userJson ? JSON.parse(userJson) : null,
    };
  } catch {
    return null;
  }
}

export function setLocalAuth({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setAccessToken(token) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function setRefreshToken(token) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearLocalAuth() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}