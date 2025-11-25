import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { RegisterForm } from "@/components/Register/RegisterForm";
import { AppFooter } from "@/components/Footer/AppFooter";

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar hideActions />

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-10">
        <RegisterForm />
      </main>

      <AppFooter forceLightMode/>
    </div>
  );
};
