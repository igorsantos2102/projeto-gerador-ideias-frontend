export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

export async function getUserRole(): Promise<'ADMIN' | 'USER' | null> {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return null

    const decoded = decodeJWT(token)
    if (!decoded) return 'USER'

    if (decoded.authorities) {
      const authorities = Array.isArray(decoded.authorities)
        ? decoded.authorities
        : [decoded.authorities]

      const hasAdminRole = authorities.some((auth: string) =>
        auth.includes('ADMIN') || auth === 'ROLE_ADMIN'
      )

      if (hasAdminRole) return 'ADMIN'
    }

    return 'USER'
  } catch (error) {
    return 'USER'
  }
}

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return false

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    try {
      const response = await fetch('/api/chat/admin/logs?size=1', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      return response.status === 200
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      return false
    }
  } catch (error) {
    return false
  }
}

