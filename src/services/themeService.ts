import { apiFetch } from "@/lib/api"; 

export interface Theme {
  id?: number;
  name: string;
}

export const themeService = {
  async getAll(): Promise<Theme[]> {
    const res = await apiFetch("/api/themes", { method: "GET" });
    if (!res.ok) throw new Error("Erro ao buscar temas");
    return res.json();
  },

  async getById(id: number): Promise<Theme> {
    const res = await apiFetch(`/api/themes/${id}`, { method: "GET" });
    if (!res.ok) throw new Error("Erro ao buscar tema por ID");
    return res.json();
  },

  async create(theme: Theme): Promise<Theme> {
    const res = await apiFetch("/api/themes", {
      method: "POST",
      body: JSON.stringify(theme),
    });
    if (!res.ok) throw new Error("Erro ao criar tema");
    return res.json();
  },

  async update(id: number, theme: Theme): Promise<Theme> {
    const res = await apiFetch(`/api/themes/${id}`, {
      method: "PUT",
      body: JSON.stringify(theme),
    });
    if (!res.ok) throw new Error("Erro ao atualizar tema");
    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await apiFetch(`/api/themes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar tema");
  },
};
