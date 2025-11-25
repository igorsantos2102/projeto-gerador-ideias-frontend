import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { LoginHeader } from "@/components/Login/LoginHeader";
import { LoginForm } from "@/components/Login/LoginForm";
import { LoginFooter } from "@/components/Login/LoginFooter";
import { AppFooter } from "@/components/Footer/AppFooter";

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Navbar com logo apenas */}
      <Navbar hideActions />

      {/* Conteúdo central sem card */}
      <div className="flex flex-col grow items-center justify-center px-4 mt-16">
        <div className="w-full max-w-md">
          <LoginHeader />
          <LoginForm />
          <LoginFooter/>
        </div>
      </div>

      <AppFooter forceLightMode />
    </div>
  );
};
