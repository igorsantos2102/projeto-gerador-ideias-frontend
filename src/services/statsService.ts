import { apiFetch } from "@/lib/api";

export type DashboardStats = {
  totalIdeas: number;
  totalFavorites: number;
  averageResponseTime: number;
};

export const statsService = {
  async getStats(): Promise<DashboardStats> {
    const results = await Promise.allSettled([
      apiFetch("/api/ideas/generation-stats", { cache: 'no-store' }),
      apiFetch("/api/ideas/favorites/count", { cache: 'no-store' }),
      apiFetch("/api/users/me/stats", { cache: 'no-store' }),
    ]);

    let averageResponseTime = 0;
    if (results[0].status === "fulfilled" && results[0].value.ok) {
      const data = await results[0].value.json();
      averageResponseTime = data.averageGenerationTimeMs ?? 0;
    } else {
      console.error("Falha ao buscar o tempo médio.");
    }

    let totalFavorites = 0;
    if (results[1].status === "fulfilled" && results[1].value.ok) {
      const data = await results[1].value.json();
      totalFavorites = data.count ?? 0;
    } else {
      console.error("Falha ao buscar os favoritos.");
    }

    let totalIdeas = 0;
    if (results[2].status === "fulfilled" && results[2].value.ok) {
      const data = await results[2].value.json();
      totalIdeas = data.generatedIdeasCount ?? 0;
    } else {
      console.error("Falha ao buscar estatísticas do usuário (total de ideias). O endpoint /api/users/me/stats pode não existir.");
    }

    return {
      totalIdeas,
      totalFavorites,
      averageResponseTime,
    };
  },
};