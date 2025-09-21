const ORIGIN = (process.env.NEXT_PUBLIC_API_ORIGIN || '').replace(/\/$/, '');
export const API_BASE = ORIGIN && ORIGIN !== 'internal' && ORIGIN !== 'self' ? `${ORIGIN}/api` : '/api';

async function request(path: string, options: RequestInit = {}) {
  const headers: any = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (typeof window !== 'undefined') {
    let token = localStorage.getItem('ecommerce_auth_token') || localStorage.getItem('auth_token') || localStorage.getItem('admin-token');
    if (token) {
      try { const parsed = JSON.parse(token); if (typeof parsed === 'string') token = parsed; } catch {}
      token = token.replace(/^"+|"+$/g, '');
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, cache: 'no-store', credentials: 'include' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const http = {
  get: (p: string) => request(p),
  post: (p: string, body?: any) => request(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: (p: string, body?: any) => request(p, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: (p: string) => request(p, { method: 'DELETE' }),
};
