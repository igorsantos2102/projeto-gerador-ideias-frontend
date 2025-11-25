import React from "react";
import { Link } from "react-router-dom";

export const LoginFooter: React.FC = () => {
  return (
    <div className="text-center mt-8 space-y-4">
      {/* Link de criação de conta */}
      <p className="text-sm text-gray-600">
        Não tem conta?{" "}
        <Link
          to="/register"
          className="text-[#7A3FFF] font-medium hover:underline transition"
        >
          Criar uma conta
        </Link>
      </p>

      <div className="w-full border-t border-gray-200 my-4"></div>

      {/* Link de voltar */}
      <Link
        to="/"
        className="block text-sm text-gray-500 hover:text-gray-700 transition"
      >
        Voltar para página inicial
      </Link>
    </div>
  );
};
