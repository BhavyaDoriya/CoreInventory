import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh })
        localStorage.setItem('access_token', data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  me: () => api.get('/auth/me/'),
  logout: () => { localStorage.clear() },
}

// ── Dashboard ─────────────────────────────────────────
export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/'),
}

// ── Stock / Products ──────────────────────────────────
export const stockAPI = {
  getProducts: () => api.get('/stock/products/'),
  getProduct: (id) => api.get(`/stock/products/${id}/`),
  createProduct: (data) => api.post('/stock/products/', data),
  updateProduct: (id, data) => api.patch(`/stock/products/${id}/`, data),
  getStockEntries: () => api.get('/stock/entries/'),
  updateStock: (id, data) => api.patch(`/stock/entries/${id}/`, data),
}

// ── Receipts ──────────────────────────────────────────
export const receiptsAPI = {
  getAll: (params) => api.get('/receipts/', { params }),
  getOne: (id) => api.get(`/receipts/${id}/`),
  create: (data) => api.post('/receipts/', data),
  validate: (id) => api.post(`/receipts/${id}/validate/`),
  cancel: (id) => api.post(`/receipts/${id}/cancel/`),
}

// ── Deliveries ────────────────────────────────────────
export const deliveriesAPI = {
  getAll: (params) => api.get('/deliveries/', { params }),
  getOne: (id) => api.get(`/deliveries/${id}/`),
  create: (data) => api.post('/deliveries/', data),
  validate: (id) => api.post(`/deliveries/${id}/validate/`),
  cancel: (id) => api.post(`/deliveries/${id}/cancel/`),
}

// ── Move History ──────────────────────────────────────
export const movesAPI = {
  getAll: (params) => api.get('/moves/', { params }),
  getOne: (id) => api.get(`/moves/${id}/`),
}

export default api