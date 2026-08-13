const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

// ── Token helpers ─────────────────────────────────
export function getToken(): string | null {
  return localStorage.getItem('agroflow_token')
}

export function setToken(token: string): void {
  localStorage.setItem('agroflow_token', token)
}

export function removeToken(): void {
  localStorage.removeItem('agroflow_token')
}

export function getUser() {
  const user = localStorage.getItem('agroflow_user')
  return user ? JSON.parse(user) : null
}

export function setUser(user: object): void {
  localStorage.setItem('agroflow_user', JSON.stringify(user))
}

export function removeUser(): void {
  localStorage.removeItem('agroflow_user')
}

// ── Base fetch with auth header and timeout ───────────────────
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000) // 15 second timeout

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Something went wrong')
    }

    return data
  } catch (error: any) {
    clearTimeout(timeout)
    
    // Handle timeout
    if (error.name === 'AbortError') {
      throw new Error('Something went wrong. Please try again.')
    }
    
    // Handle network errors
    if (!navigator.onLine || error.message === 'Failed to fetch' || error.message === 'NetworkError') {
      throw new Error('No internet connection. Please check your network and try again.')
    }
    
    // Re-throw if already user-friendly
    if (error.message && !error.message.includes('fetch') && !error.message.includes('NetworkError')) {
      throw error
    }
    
    throw new Error('Something went wrong. Please try again.')
  }
}

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
      })
      setToken(data.token)
      setUser(data.user)
      return data
    } catch (error: any) {
      // Check if it's a network error
      if (error.message === 'No internet connection. Please check your network and try again.') {
        throw error
      }
      // Re-throw other errors
      throw error
    }
  },

  logout: () => {
    removeToken()
    removeUser()
  },

  me: () => apiFetch('/auth/me'),
}

// ── Users ─────────────────────────────────────────
export const usersAPI = {
  getAll: () => apiFetch('/users'),

  getOne: (id: string) => apiFetch(`/users/${id}`),

  add: (data: {
    name:      string
    email:     string
    password:  string
    role:      string
    phone?:    string
    location?: string
  }) => apiFetch('/users', {
    method: 'POST',
    body:   JSON.stringify(data),
  }),

  updateStatus: (id: string, status: 'active' | 'suspended') =>
    apiFetch(`/users/${id}/status`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    }),
}

// ── Farmers ───────────────────────────────────────
export const farmersAPI = {
  getAll: () => apiFetch('/farmers'),

  getOne: (id: string) => apiFetch(`/farmers/${id}`),

  updateStatus: (id: string, status: 'active' | 'suspended') =>
    apiFetch(`/farmers/${id}/status`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    }),
}

// ── Fields ────────────────────────────────────────
export const fieldsAPI = {
  getAll: () => apiFetch('/fields'),

  getOne: (id: string) => apiFetch(`/fields/${id}`),

  update: (id: string, data: {
    ndvi?:           number
    soilMoisture?:   number
    lastIrrigation?: string
    status?:         string
  }) => apiFetch(`/fields/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify(data),
  }),
}

// ── Alerts ────────────────────────────────────────
export const alertsAPI = {
  getAll: () => apiFetch('/alerts'),

  resolve: (id: string) =>
    apiFetch(`/alerts/${id}/resolve`, { method: 'PATCH' }),

  unresolve: (id: string) =>
    apiFetch(`/alerts/${id}/unresolve`, { method: 'PATCH' }),
}


// ── Constants ─────────────────────────────────────
export const crops     = ['Maize', 'Cassava', 'Tomato', 'Pepper']
export const locations = [
  'Oba-Ile', 'Ijapo Estate', 'Oke-Aro', 'Arakale', 'Isolo',
  'Oda', 'Oke-Ogba', 'Ijomu', 'Ayedun', 'Alagbaka',
]

// ── Content ───────────────────────────────────────
export const contentAPI = {
  getAll: () => apiFetch('/content'),

  seed: () => apiFetch('/content/seed', { method: 'POST' }),

  upload: (formData: FormData) => {
    const token = getToken()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    return fetch(`${BASE_URL}/content/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      signal: controller.signal,
    })
      .then(async res => {
        clearTimeout(timeout)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        return data
      })
      .catch((error: any) => {
        clearTimeout(timeout)
        if (error.name === 'AbortError') {
          throw new Error('Something went wrong. Please try again.')
        }
        if (!navigator.onLine || error.message === 'Failed to fetch') {
          throw new Error('No internet connection. Please check your network and try again.')
        }
        throw error
      })
  },
}

export const adminAPI = {
  getStats:      () => apiFetch('/admin/stats'),
  getListings:   () => apiFetch('/admin/listings'),
  deleteListing: (id: string) => apiFetch(`/admin/listings/${id}`, { method: 'DELETE' }),
  getOrders:     () => apiFetch('/admin/orders'),
  broadcast:     (title: string, body: string, url?: string) =>
    apiFetch('/push/broadcast', {
      method: 'POST',
      body:   JSON.stringify({ title, body, url }),
    }),
}