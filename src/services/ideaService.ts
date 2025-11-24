import { apiFetch } from "@/lib/api";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { emitHistoryRefreshRequest } from "@/events/historyEvents";
import { pushIdeaToCache } from "@/hooks/useIdeas";
import { updateFavoriteCache } from "@/pages/History/favoritesCache";

type IdeaApiResponse = {
  id: string | number;
  theme: string;
  content: string;
  createdAt?: string;
  executionTimeMs?: number;
  context?: string;
  isFavorite?: boolean;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

function mapResponseToIdea(response: IdeaApiResponse): Idea {
  return {
    id: String(response.id),
    theme: response.theme,
    content: response.content,
    timestamp: new Date(response.createdAt || Date.now()),
    isFavorite: response.isFavorite ?? false,
    responseTime: response.executionTimeMs,
    context: response.context || "",
    author:
      (response as any).userName?.trim() ||
      (response as any).author?.trim() ||
      undefined,
  };
}

// MAPA DE CATEGORIA PARA ID DO BACKEND
const CATEGORY_TO_THEME_ID: Record<string, number> = {
  tecnologia: 1,
  educacao: 2,
  marketing: 3,
  viagem: 4,
  saude: 5,
  negocio: 6,
  estudos: 7,
  // ajuste conforme seu backend
};

// Converte YYYY-MM-DD → YYYY-MM-DDT00:00:00 ou T23:59:59
const toDateTime = (date: string, isEnd = false) => {
  if (!date) return "";
  return isEnd ? `${date}T23:59:59` : `${date}T00:00:00`;
};

export const ideaService = {
  async generateIdea(
    themeId: number,
    context: string,
    skipCache: boolean = false
  ): Promise<Idea> {
    const url = new URL("/api/ideas/generate", window.location.origin);
    if (skipCache) url.searchParams.set("skipCache", "true");

    const response = await apiFetch(url.pathname + url.search, {
      method: "POST",
      body: JSON.stringify({ theme: themeId, context }),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Erro ao gerar ideia");
    }

    const responseData = await response.json();
    const newIdea = mapResponseToIdea(responseData);

    pushIdeaToCache(newIdea);
    emitHistoryRefreshRequest({ idea: newIdea });

    return newIdea;
  },

  async generateSurpriseIdea(): Promise<Idea> {
    const response = await apiFetch("/api/ideas/surprise-me", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Erro ao gerar ideia surpresa");
    }

    const responseData = await response.json();
    const newIdea = mapResponseToIdea(responseData);

    pushIdeaToCache(newIdea);
    emitHistoryRefreshRequest({ idea: newIdea });

    return newIdea;
  },

  async toggleFavorite(ideaId: string, isFavorite: boolean): Promise<void> {
    const method = isFavorite ? "POST" : "DELETE";
    const res = await apiFetch(`/api/ideas/${ideaId}/favorite`, { method });

    if (!res.ok) {
      throw new Error((await res.text()) || "Erro ao atualizar favorito");
    }

    updateFavoriteCache(ideaId, isFavorite);
    emitHistoryRefreshRequest();
  },

  async getFavorites(): Promise<Idea[]> {
    const res = await apiFetch("/api/ideas/favorites");
    if (!res.ok) throw new Error("Erro ao buscar favoritos");
    return await res.json();
  },

  /**
   * Busca todas as ideias do usuário (com filtros e paginação)
   */
 async getMyIdeas(
  page: number,
  size: number,
  filters?: { category?: string; startDate?: string; endDate?: string; theme?: number }
): Promise<PageResponse<Idea>> {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("size", String(size));

    // MAPEA CATEGORIA → themeId (o backend exige isso)
    if (filters?.category) {
      const themeId = CATEGORY_TO_THEME_ID[filters.category];
      if (themeId) params.set("theme", String(themeId));
    }

    // Datas convertidas para LocalDateTime
    if (filters?.startDate)
      params.set("startDate", toDateTime(filters.startDate));
    if (filters?.endDate)
      params.set("endDate", toDateTime(filters.endDate, true));

    const res = await apiFetch(`/api/ideas/my-ideas?${params.toString()}`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erro ao carregar minhas ideias: ${errorText}`);
    }

    const pageData: PageResponse<IdeaApiResponse> = await res.json();

    return {
      ...pageData,
      content: pageData.content.map(mapResponseToIdea),
    };
  },
};
