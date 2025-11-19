const ACCESS_TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getAccessToken(): string | null {
  try {
    return globalThis?.localStorage?.getItem(ACCESS_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function getRefreshToken(): string | null {
  try {
    return globalThis?.localStorage?.getItem(REFRESH_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setAccessToken(token: string) {
  try {
    globalThis?.localStorage?.setItem(ACCESS_TOKEN_KEY, token)
  } catch {}
}

export function setRefreshToken(token: string) {
  try {
    globalThis?.localStorage?.setItem(REFRESH_TOKEN_KEY, token)
  } catch {}
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  setAccessToken(accessToken)
  setRefreshToken(refreshToken)
}

export function clearAuthTokens() {
  try {
    globalThis?.localStorage?.removeItem(ACCESS_TOKEN_KEY)
    globalThis?.localStorage?.removeItem(REFRESH_TOKEN_KEY)
  } catch {}
}

export function getAuthToken(): string | null {
  return getAccessToken()
}

export function setAuthToken(token: string) {
  setAccessToken(token)
}

export function clearAuthToken() {
  clearAuthTokens()
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null
}

let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearAuthTokens()
        return null
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        clearAuthTokens()
        return null
      }

      const data = await response.json()
      setAuthTokens(data.accessToken, data.refreshToken)
      return data.accessToken
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      clearAuthTokens()
      return null
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

function redirectToLoginIfNeeded(): void {
  const location = globalThis.location
  if (!location) {
    return
  }

  const pathname = location.pathname
  if (pathname === '/login' || pathname === '/register') {
    return
  }

  location.href = '/login'
}

async function retryRequestWithFreshToken(
  input: string,
  init: RequestInit | undefined,
  headers: Headers,
  originalResponse: Response,
): Promise<Response> {
  const newToken = await refreshAccessToken()

  if (!newToken) {
    clearAuthTokens()
    redirectToLoginIfNeeded()
    return originalResponse
  }

  headers.set('Authorization', `Bearer ${newToken}`)
  const retryResponse = await fetch(input, { ...init, headers, credentials: 'include' })

  if (retryResponse.status === 401 || retryResponse.status === 403) {
    clearAuthTokens()
    redirectToLoginIfNeeded()
  }

  return retryResponse
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {})
  let token = getAccessToken()
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  } else {
    console.warn('[apiFetch] No token found for request:', input)
  }
  
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  
  if (!headers.has('Content-Type') && init?.method && ['POST', 'PUT', 'PATCH'].includes(init.method)) {
    headers.set('Content-Type', 'application/json')
  }

  let response = await fetch(input, { ...init, headers, credentials: 'include' })
  
  if (response.status === 401 || response.status === 403) {
    if (token) {
      response = await retryRequestWithFreshToken(input, init, headers, response)
    } else if (response.status === 401) {
      redirectToLoginIfNeeded()
    } else {
      console.error('[apiFetch] 403 Forbidden for:', input, 'No token present')
    }
  }

  return response
}

