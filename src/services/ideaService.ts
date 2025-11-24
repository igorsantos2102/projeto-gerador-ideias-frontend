import { apiFetch } from "@/lib/api";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { emitHistoryRefreshRequest } from "@/events/historyEvents";


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
}

function mapResponseToIdea(response: IdeaApiResponse): Idea {
  return {
    id: String(response.id),
    theme: response.theme,
    content: response.content,
    timestamp: new Date(response.createdAt || Date.now()),
    isFavorite: response.isFavorite ?? false,
    responseTime: response.executionTimeMs,
    context: response.context || "",
    author: (response as any).userName?.trim() || (response as any).author?.trim() || undefined,
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
      throw new Error((await response.text()) || "Erro ao gerar ideia");
    }

    const responseData = await response.json();
    const newIdea = mapResponseToIdea(responseData);

  
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

  
    emitHistoryRefreshRequest({ idea: newIdea });

    return newIdea;
  },

  
   
  async toggleFavorite(ideaId: string, isFavorite: boolean): Promise<void> {
    const method = isFavorite ? "POST" : "DELETE";
    const res = await apiFetch(`/api/ideas/${ideaId}/favorite`, { method });

    if (!res.ok) {
      throw new Error((await res.text()) || "Erro ao atualizar favorito");
    }

    emitHistoryRefreshRequest();
  },

  async getFavorites(): Promise<Idea[]> {
    const res = await apiFetch("/api/ideas/favorites")
    if (!res.ok) throw new Error("Erro ao buscar favoritos")
    return await res.json()
  },

  /**
   * Busca todas as ideias criadas pelo usuário logado, de forma paginada.
   */
  async getMyIdeas(page: number, size: number): Promise<PageResponse<Idea>> {
    const res = await apiFetch(`/api/ideas/my-ideas?page=${page}&size=${size}`);
    if (!res.ok) {
      const errorText = await res.text();
      // Lança um erro com a mensagem do backend para facilitar a depuração
      throw new Error(`Erro ao carregar minhas ideias: ${errorText}`);
    }
    
    const pageData: PageResponse<IdeaApiResponse> = await res.json();

    return {
      ...pageData,
      content: pageData.content.map(mapResponseToIdea),
    };
  }
}
