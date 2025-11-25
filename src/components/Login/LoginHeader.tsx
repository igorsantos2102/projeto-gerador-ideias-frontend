import React from "react";

export const LoginHeader: React.FC = () => {
  return (
    <div className="text-left mb-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">
        Bem-vindo de volta
      </h1>
      <p className="text-gray-500 text-sm">
        Faça login para continuar gerando ideias criativas
      </p>
    </div>
  );
};