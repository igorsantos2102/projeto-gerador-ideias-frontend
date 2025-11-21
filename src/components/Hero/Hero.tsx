import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroVideo from '../../assets/CriaitorAssets/fundo-landingPage.mp4';

export const Hero: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (value: string) => {
    const input = document.createElement("input");
    input.type = "email";
    input.value = value;
    return input.checkValidity();
  };

  const handleStart = () => {
    if (!email.trim()) {
      setError("Por favor, digite um e-mail.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    setError("");
    navigate(`/register?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center bg-[#F9F9FB] text-[#1E1E1E] px-8 pt-24 pb-24">
      {/* === TÍTULO === */}
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
        Transforme palavras em <br />
        {" "}
        <span
          className="
            font-bold
            bg-linear-to-r from-purple-500 to-blue-600
            bg-clip-text text-transparent
          "
        >
          ideias brilhantes
        </span>
      </h1>

      {/* === DESCRIÇÃO === */}
      <p className="text-lg text-gray-500 font-normal leading-relaxed max-w-2xl mb-12">
        Escolha um tema, descreva o que você precisa e deixe o Criaitor gerar ideias para você.
        Organize tudo em cards, explore ideias da comunidade, marque favoritos e converse com a Aiko para lapidar seus próximos passos.
      </p>

      {/* === INPUT + BOTÃO === */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="relative w-full sm:max-w-2xl bg-white rounded-full border border-gray-200 shadow-sm">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu email"
            className="w-full pl-8 pr-40 py-4 bg-transparent text-gray-800 text-base outline-none rounded-full placeholder:text-gray-400 caret-gray-700"
          />
          <button
            onClick={handleStart}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-[#335CFF] hover:bg-blue-700 text-white px-8 py-3 h-auto text-base font-semibold rounded-full shadow transition-all duration-200"
          >
            Começar Agora
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium mt-3">{error}</p>
        )}
      </div>

      <div className="relative w-full max-w-5xl mx-auto mt-12 sm:mt-24 px-2 sm:px-0">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200 relative bg-black">
          <video
            className="w-full h-auto object-cover"
            autoPlay
            loop
            muted
            playsInline
            src={heroVideo}
          >
            Seu navegador não suporta a tag de vídeo.
          </video>
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
};
