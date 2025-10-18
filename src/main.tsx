import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Landing from "./pages/landing.tsx";
import "./index.css";
import SignupPage from "./pages/Signup.tsx";
import LoginPage from "./pages/Login.tsx";
import Create from "./pages/createacoin.tsx";
import CoinPage from "./pages/CoinPage.tsx";
import Market from "./pages/Market.tsx";
import PortfolioPage from "./pages/Portfolio.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/market" element={<Market />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<Create />} />
        <Route path="/coin/:symbol" element={<CoinPage />} />
        <Route path="*" element={<h1 className="text-white p-8">404 Not Found</h1>} />
      </Routes>
    </HashRouter>
  </StrictMode>
);
