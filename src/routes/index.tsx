import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from "@/pages/LandingPage/LandingPage";
import { LoginPage } from "@/pages/Login/LoginPage";
import { RegisterPage } from "@/pages/Register/Register";
import { GeneratorPage } from '@/pages/GeneratorPage/GeneratorPage';
import HistoryPage from '@/pages/History/History';
import FavoritesPage from '@/pages/FavoritesPage/FavoritesPage';
import DashboardPage from '@/pages/DashboardPage/DashboardPage';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PrivateLayout } from '@/layouts/PrivateLayout';
import { ChatMetricsGate } from '@/pages/ChatMetricsPage/ChatMetricsGate';
import MyIdeasPage from '@/pages/MyIdeasPage/MyIdeasPage';


const AppRoutes: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />                
                </Route>

                {/* Private Routes */}
                <Route element={<PrivateLayout />}>
                    <Route path="/generator" element={<GeneratorPage />} />
                    <Route path="/community" element={<HistoryPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/my-ideas" element={<MyIdeasPage />} />
                    <Route path="/chatbot-metrics" element={<ChatMetricsGate />} />
                </Route>

            </Routes>

        </Router>
    )
}

export default AppRoutes; 