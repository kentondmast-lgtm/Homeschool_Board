const KEY = 'hb_admin_credentials';

export function getAuthHeader() {
  const token = localStorage.getItem(KEY);
  return token ? `Basic ${token}` : null;
}

export function storeCredentials(username, password) {
  localStorage.setItem(KEY, btoa(`${username}:${password}`));
}

export function clearCredentials() {
  localStorage.removeItem(KEY);
}

export async function verifyCredentials(username, password) {
  const res = await fetch('/api/whoami', {
    headers: { Authorization: `Basic ${btoa(`${username}:${password}`)}` },
  });
  return res.ok;
}
