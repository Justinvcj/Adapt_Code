/**
 * Thin fetch client that talks to the FastAPI backend.
 *
 * - `credentials: 'include'` so the httpOnly `adaptcode_session` cookie flows.
 * - If `NEXT_PUBLIC_API_URL` is unset the client is "offline": every call
 *   throws `ApiOffline` and callers fall back to local / mock behaviour.
 * - Non-2xx responses throw `ApiError` carrying status + server-side detail.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
export const API_ENABLED = Boolean(API_BASE);

export class ApiOffline extends Error {
  constructor() {
    super('Backend not configured (NEXT_PUBLIC_API_URL is unset).');
    this.name = 'ApiOffline';
  }
}

export class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown, message?: string) {
    super(message ?? (typeof detail === 'string' ? detail : `Request failed with status ${status}`));
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

type FetchOpts = Omit<RequestInit, 'headers'> & {
  json?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  if (!API_ENABLED) throw new ApiOffline();

  const { json, headers = {}, body, ...init } = opts;
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : body,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    const detail = (data && typeof data === 'object' && 'detail' in data)
      ? (data as { detail: unknown }).detail
      : data;
    throw new ApiError(res.status, detail);
  }

  return data as T;
}

export const api = {
  get:  <T>(path: string, opts?: FetchOpts) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, json?: unknown, opts?: FetchOpts) => request<T>(path, { ...opts, method: 'POST', json }),
  patch:<T>(path: string, json?: unknown, opts?: FetchOpts) => request<T>(path, { ...opts, method: 'PATCH', json }),
  del:  <T>(path: string, opts?: FetchOpts) => request<T>(path, { ...opts, method: 'DELETE' }),
};

// ---- typed call surface ----

export type ApiUser = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: string | null;
  is_pro: boolean;
  created_at: string;
};

export const authAPI = {
  me:       () => api.get<{ status: string; user: ApiUser }>('/api/auth/me'),
  login:    (email: string, password: string) => api.post<unknown>('/api/auth/login', { email, password }),
  register: (email: string, password: string, display_name?: string) =>
    api.post<unknown>('/api/auth/register', { email, password, display_name }),
  logout:   () => api.post<unknown>('/api/auth/logout'),
};

export type SubmitRequest = { problem_id: string; code: string; language: string };
export type SubmitResponse = {
  event_id: string;
  verdict: 'accepted' | 'wrong_answer' | 'runtime_error' | 'compile_error' | 'tle';
  runtime_ms: number | null;
  mastery_delta?: number;
  concept?: string;
  explanation?: string;
};

export const problemsAPI = {
  start:  (problem_id: string) => api.post<{ status: string }>('/api/start', { problem_id }),
  submit: (req: SubmitRequest) => api.post<SubmitResponse>('/api/submit', req),
  next:   () => api.get<{ problem_id: string }>('/api/next-problem'),
};
