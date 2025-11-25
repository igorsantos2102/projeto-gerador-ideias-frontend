import React from "react";
import { Link, useNavigate } from "react-router-dom";
import creaitorIcon from "@/assets/CriaitorAssets/LOGO FUNDO BRANCO - SEM FUNDO.png";

interface NavbarProps {
  hideActions?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ hideActions = false }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-[#F9F9FB] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-10 md:py-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:flex-nowrap md:justify-between">
          {/* Logo + brand */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded transition"
            aria-label="Voltar para a página inicial"
          >
            <img
              src={creaitorIcon}
              alt="Logo do Criaitor"
              className="h-7 w-auto object-contain"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </button>

          {!hideActions && (
            <div
              className="
                flex flex-shrink-0 items-center gap-3
              "
            >
              <Link
                to="/login"
                className="
                  text-gray-800 font-medium text-[15px]
                  hover:text-blue-600 transition
                "
              >
                Log In
              </Link>

              <button
                onClick={() => navigate("/register")}
                className="
                  bg-[#335CFF] text-white text-[15px] font-semibold
                  px-7 py-2.5 rounded-full hover:bg-blue-700 transition
                "
              >
                Começar Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
