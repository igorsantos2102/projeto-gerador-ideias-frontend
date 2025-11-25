import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { setAuthTokens } from "@/lib/api";
import { TextField } from "@/components/common/TextField";
import { PasswordToggle } from "@/components/common/PasswordToggle";
import { prefetchIdeas } from "@/hooks/useIdeas";

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // <-- Novo estado
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // Limpa mensagens antigas

    try {
      const data = await authService.login(email, password);

      if (data?.accessToken && data?.refreshToken) {
        setAuthTokens(data.accessToken, data.refreshToken);
      } else {
        throw new Error("Resposta de login inválida");
      }

      if (data?.name || data?.email) {
        const userData = {
          uuid: data.uuid,
          name: data.name,
          email: data.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      void prefetchIdeas().catch((err) =>
        console.warn("Não foi possível pré-carregar o histórico", err)
      );

      navigate("/generator");
    } catch (error: any) {
      console.error("Erro ao logar:", error?.response?.data || error?.message);
      setErrorMessage("Falha ao fazer login. Verifique suas credenciais."); // <-- Atualiza o estado
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Campo de email */}
      <TextField
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Digite seu email"
      />

      {/* Campo de senha */}
      <div className="relative">
        <TextField
          label="Senha"
          type={showPassword ? "text" : "password"}
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Digite sua senha"
        />
        <PasswordToggle
          visible={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          className="top-12"
        />
      </div>

      {/* Mensagem de erro */}
      {errorMessage && (
        <p className="text-red-500 text-sm text-center -mt-2">
          {errorMessage}
        </p>
      )}

      {/* Botão de login */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg font-semibold text-white 
                   bg-linear-to-r from-[#9C6FFF] to-[#335CFF]
                   shadow-md hover:shadow-lg transform transition-all 
                   hover:-translate-y-0.5 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Fazer Login"}
      </button>
    </form>
  );
};
