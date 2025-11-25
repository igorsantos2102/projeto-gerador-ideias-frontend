import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "@/services/authService";
import { TextField } from "@/components/common/TextField";
import { PasswordToggle } from "@/components/common/PasswordToggle";
import { setAuthTokens } from "@/lib/api";
import { prefetchIdeas } from "@/hooks/useIdeas";

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const emailFromURL = queryParams.get("email") || "";

  const [form, setForm] = useState({
    name: "",
    email: emailFromURL,
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [validations, setValidations] = useState({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    hasLength: false,
  });

  useEffect(() => {
    if (emailFromURL) {
      setForm((prev) => ({ ...prev, email: emailFromURL }));
    }
  }, [emailFromURL]);

  useEffect(() => {
    const { password } = form;
    setValidations({
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      hasLength: password.length >= 8 && password.length <= 20,
    });
  }, [form.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStrongPassword = (password: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStrongPassword(form.password)) {
      setError(
        "A senha deve ter no mínimo 8 caracteres e conter pelo menos: uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const registerData = await authService.register(
        form.name,
        form.email,
        form.password,
        form.confirmPassword
      );

      if (registerData?.accessToken && registerData?.refreshToken) {
        setAuthTokens(registerData.accessToken, registerData.refreshToken);
      } else {
        throw new Error("Falha ao obter tokens após registro. Tente fazer login manualmente.");
      }

      if (registerData?.name || registerData?.email) {
        const userData = {
          uuid: registerData.uuid,
          name: registerData.name,
          email: registerData.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      void prefetchIdeas().catch((err) =>
        console.warn("Não foi possível pré-carregar o histórico", err)
      );

      navigate("/generator", { replace: true });

    } catch (error: any) {
      console.error("Erro ao cadastrar ou logar:", error.response || error.message);

      if (error.response?.status === 409) {
        setError("Este e-mail já está em uso.");
      } else if (error.response?.status === 400) {
        const backendError =
          error.response.data?.message ||
          error.response.data?.errors?.[0] ||
          "Erro de validação nos dados.";
        setError(backendError);
      } else if (error.message && error.message.includes("Falha ao obter tokens")) {
         setError(error.message);
         navigate("/login");
      } else {
        setError("Falha ao realizar cadastro. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRule = (valid: boolean, text: string) => (
    <li
      className={`flex items-center gap-2 text-sm transition-all duration-200 ${
        valid ? "text-green-600" : "text-red-500"
      }`}
    >
      {valid ? (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {text}
    </li>
  );

  return (
    <section className="w-full flex flex-col items-center justify-center py-28 px-6">
      <div className="w-full max-w-lg">
        <h2 className="text-[2rem] font-semibold text-center text-gray-900 mb-2">
          Crie sua conta
        </h2>
        <p className="text-center text-gray-500 mb-10">
          Comece a gerar ideias criativas agora mesmo
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Nome */}
          <TextField
            label="Nome Completo"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Seu nome"
          />

          {/* Email */}
          <TextField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Seu email"
          />

          {/* Senha */}
          <div className="relative">
            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <PasswordToggle
              visible={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
              className="top-12"
            />
            <ul className="mt-3 space-y-1 pl-1">
              {renderRule(validations.hasUpper, "1 letra maiúscula (A–Z)")}
              {renderRule(validations.hasLower, "1 letra minúscula (a–z)")}
              {renderRule(validations.hasNumber, "1 número (0–9)")}
              {renderRule(validations.hasSpecial, "1 caractere especial (@, #, $, etc.)")}
              {renderRule(validations.hasLength, "Tamanho entre 8 e 20 caracteres")}
            </ul>
          </div>

          {/* Confirmar senha */}
          <div className="relative">
            <TextField
              label="Confirmar Senha"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirme sua senha"
            />
            <PasswordToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              className="top-12"
            />
          </div>

          {/* Mensagem de erro */}
          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-2 rounded-md font-semibold text-white bg-linear-to-r from-[#9C6FFF] to-[#335CFF]
                       shadow-[0_4px_12px_rgba(51,92,255,0.3)] hover:shadow-[0_8px_20px_rgba(51,92,255,0.45)]
                       transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Cadastrando..." : "Criar Conta"}
          </button>
        </form>

        {/* Ações extras */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Já possui uma conta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-indigo-600 hover:underline font-medium"
          >
            Faça login
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Voltar à página inicial
          </button>
        </div>
      </div>
    </section>
  );
};