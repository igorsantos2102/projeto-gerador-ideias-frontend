import { apiFetch } from "@/lib/api";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import {
  ideaService,
  mapResponseToIdea,
  type IdeaApiResponse,
} from "./ideaService";

export const favoriteService = {
  async getFavorites(page = 0, size = 20): Promise<Idea[]> {
    try {
      const response = await apiFetch(`/api/ideas/favorites?page=${page}&size=${size}`);
      const data = await response.json();

      if (Array.isArray(data?.content)) {
        return data.content.map((apiIdea: IdeaApiResponse) => {
          return { ...mapResponseToIdea(apiIdea), isFavorite: true };
        });
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      return [];
    }
  },

  async removeFavorite(id: string): Promise<void> {
    // Reutiliza a lógica centralizada que já emite o evento de refresh
    return ideaService.toggleFavorite(id, false);
  }
};
