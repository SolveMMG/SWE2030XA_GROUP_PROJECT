import axios from 'axios';

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api') + '/v1';

const api = axios.create({ baseURL: BASE_URL });

// Attach Bearer token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401 (once per request)
let refreshing = false;
let waitQueue = [];

function drainQueue(err, token) {
  waitQueue.forEach((cb) => (err ? cb.reject(err) : cb.resolve(token)));
  waitQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status !== 401 || original._retry) return Promise.reject(err);

    if (refreshing) {
      return new Promise((resolve, reject) => waitQueue.push({ resolve, reject })).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    refreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      refreshing = false;
      return Promise.reject(err);
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      drainQueue(null, data.token);
      original.headers.Authorization = `Bearer ${data.token}`;
      return api(original);
    } catch (refreshErr) {
      drainQueue(refreshErr, null);
      localStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshErr);
    } finally {
      refreshing = false;
    }
  }
);

export default api;
