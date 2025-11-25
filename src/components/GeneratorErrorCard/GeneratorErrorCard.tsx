import React from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import { useTheme } from "@/hooks/useTheme";

type GeneratorErrorCardProps = {
    error: string;
    errorType: 'inappropriate' | 'general';
};

export const GeneratorErrorCard: React.FC<GeneratorErrorCardProps> = ({ error, errorType }) => {
    const { darkMode } = useTheme();

    return (
        <SectionContainer
            className={cn(
                "border-2",
                darkMode
                    ? "bg-red-900/20 border-red-700"
                    : "bg-red-50 border-red-300"
            )}
            padding="lg"
            rounded="xl"
            margin="none"
        >
            <div className="flex flex-col gap-5">
                <div
                    className={cn(
                        "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-normal w-fit",
                        darkMode
                            ? "bg-red-800 text-white"
                            : "bg-red-700 text-white"
                    )}
                >
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                        {errorType === 'inappropriate'
                            ? "Inapropriado — Erro"
                            : "Erro do modelo IA — Erro"}
                    </span>
                </div>
                <p className={cn(
                    "py-3 px-1 text-2xl font-light",
                    darkMode
                        ? "text-white"
                        : "text-red-700"
                )}>
                    {error}
                </p>
            </div>
        </SectionContainer>
    );
};