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
import Analytics from "@/pages/Analytics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <Toaster position="top-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/decks" element={<DeckList />} />
              <Route path="/game" element={<Game />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:id" element={<GameDetails />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;