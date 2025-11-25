import React from "react";
import { Navbar } from "@/components/Navbar/Navbar";
import { Hero } from "@/components/Hero/Hero";
import { LandingFooter } from "@/components/Footer/LandingFooter";

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <LandingFooter />
    </div>
  );
};
