import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import DeckList from "@/pages/DeckList";
import Game from "@/pages/Game";
import History from "@/pages/History";
import GameDetails from "@/pages/GameDetails";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/decks" element={<DeckList />} />
            <Route path="/game" element={<Game />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:id" element={<GameDetails />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
