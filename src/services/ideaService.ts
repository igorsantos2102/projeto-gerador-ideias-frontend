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
  userName?: string;
  author?: string;
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
      response.userName?.trim() ||
      response.author?.trim() ||
      "Participante desconhecido",
  };
}

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
      throw new Error(await response.text());
    }

    const data = await response.json();
    const idea = mapResponseToIdea(data);

    pushIdeaToCache(idea);
    emitHistoryRefreshRequest({ idea });

    return idea;
  },

  async generateSurpriseIdea(): Promise<Idea> {
    const response = await apiFetch("/api/ideas/surprise-me", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    const idea = mapResponseToIdea(data);

    pushIdeaToCache(idea);
    emitHistoryRefreshRequest({ idea });

    return idea;
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const method = isFavorite ? "POST" : "DELETE";
    const res = await apiFetch(`/api/ideas/${id}/favorite`, { method });

    if (!res.ok) throw new Error(await res.text());

    updateFavoriteCache(id, isFavorite);
    emitHistoryRefreshRequest();
  },

  async getFavorites(): Promise<Idea[]> {
    const res = await apiFetch("/api/ideas/favorites");

    if (!res.ok) throw new Error("Erro ao buscar favoritos");

    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map(mapResponseToIdea);
    }
    return (data?.content ?? []).map(mapResponseToIdea);
  },

  async getMyIdeas(page: number, size: number): Promise<PageResponse<Idea>> {
    const res = await apiFetch(`/api/ideas/my-ideas?page=${page}&size=${size}`);

    if (!res.ok) throw new Error(await res.text());

    const raw = await res.json();

    return {
      ...raw,
      content: raw.content.map(mapResponseToIdea),
    };
  },

  /** ✅ Endpoint correto para a página de comunidade */
  async getCommunityIdeas({
    category = "",
    startDate,
    endDate,
    page = 0,
    size = 6,
  }: {
    category?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Idea>> {
    const params = new URLSearchParams();

    params.set("page", String(page));
    params.set("size", String(size));

    if (category) params.set("theme", category);
    if (startDate) params.set("startDate", `${startDate}T00:00:00`);
    if (endDate) params.set("endDate", `${endDate}T23:59:59`);

    const res = await apiFetch(`/api/ideas/history?${params.toString()}`);

    if (!res.ok) throw new Error("Erro ao buscar comunidade");

    const raw = await res.json();

    return {
      ...raw,
      content: raw.content.map(mapResponseToIdea),
    };
  },
};
