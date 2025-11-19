import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import criaitorIconLightMode from "@/assets/CriaitorAssets/LOGO FUNDO BRANCO - SEM FUNDO.png";
import criaitorIconDarkMode from "@/assets/CriaitorAssets/LOGO FUNDO PRETO - SEM FUNDO.png";


export type BrandProps = Readonly<{
  className?: string;
  onClick?: () => void;
}>;

export const Brand: React.FC<BrandProps> = ({ onClick }) => {
  const { darkMode } = useTheme();

  const navigate = useNavigate();

  const iconVariant = 
    darkMode
      ?  criaitorIconDarkMode
      : criaitorIconLightMode

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    navigate("/");
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 cursor-pointer bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded transition"
      aria-label="Voltar para a página inicial"
    >
      <img
        src={iconVariant}
        alt="Logo do Criaitor"
        className="h-6 w-auto object-contain"
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </button>
  );
};

export default Brand;
