import { ideaService } from '@/services/ideaService'

const FAVORITES_CACHE_TTL = Number(import.meta.env.VITE_FAVORITES_CACHE_TTL ?? 20_000)

export type FavoriteIdsCache = {
  ids: Set<string>
  fetchedAt: number
}

let favoriteIdsCache: FavoriteIdsCache | null = null
let inFlightPromise: Promise<Set<string>> | null = null

export function resetFavoritesCache() {
  favoriteIdsCache = null
  inFlightPromise = null
}

/**
 * Garante:
 * - nenhuma chamada concorrente
 * - cancela corretamente chamadas antigas após reset
 */
export async function fetchFavoriteIds(): Promise<Set<string>> {
  const now = Date.now()

  // Cache válido → retorna direto
  if (favoriteIdsCache && now - favoriteIdsCache.fetchedAt < FAVORITES_CACHE_TTL) {
    return favoriteIdsCache.ids
  }

  // Já tem chamada em andamento → espera ela
  if (inFlightPromise) {
    return inFlightPromise
  }

  // Começa nova chamada
  inFlightPromise = (async () => {
    const favorites = await ideaService.getFavorites()

    const ids = new Set(favorites.map((f) => f.id))

    // Se o cache foi resetado DURANTE a chamada:
    if (!inFlightPromise) {
      return ids
    }

    favoriteIdsCache = {
      ids,
      fetchedAt: Date.now(),
    }

    inFlightPromise = null
    return ids
  })()

  return inFlightPromise
}

/* Usado apenas quando favorito é alterado pela página (opcional) */
export function updateFavoriteCache(id: string, isFavorite: boolean) {
  if (!favoriteIdsCache) return

  const updated = new Set(favoriteIdsCache.ids)
  if (isFavorite) updated.add(id)
  else updated.delete(id)

  favoriteIdsCache = {
    ids: updated,
    fetchedAt: Date.now(),
  }
}
