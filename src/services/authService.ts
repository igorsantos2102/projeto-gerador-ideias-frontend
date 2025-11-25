import axios from "axios";
const API_URL = "/api/auth";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  uuid?: string;
  name?: string;
  email?: string;
  id?: number;
  createdAt?: string;
}

export const authService = {
  register: async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/refresh`, {
      refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await axios.post(
        `${API_URL}/logout`,
        refreshToken ? { refreshToken } : {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
          },
        }
      );
    } catch (error) {
      // Ignora erros no logout (token pode já estar expirado)
      console.warn("Erro ao fazer logout no servidor:", error);
    }
  },
};
