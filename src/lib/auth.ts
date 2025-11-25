import { authService } from "@/services/authService";
import { getRefreshToken, clearAuthTokens } from "./api";
import { useNavigate } from "react-router-dom";

export async function handleLogout() {
  try {
    const refreshToken = getRefreshToken();
    await authService.logout(refreshToken || undefined);
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  } finally {
    clearAuthTokens();
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

export function useLogout(): () => Promise<void> {
  const navigate = useNavigate();

  return async () => {
    try {
      const refreshToken = getRefreshToken();
      await authService.logout(refreshToken || undefined);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      clearAuthTokens();
      localStorage.removeItem("user");
      navigate("/login");
    }
  };
}

