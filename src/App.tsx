import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import DeckList from "@/pages/DeckList";
import DeckPreview from "@/pages/DeckPreview";
import Game from "@/pages/Game";
import Analytics from "@/pages/Analytics";
import History from "@/pages/History";
import GameDetails from "@/pages/GameDetails";
import Leaderboard from "@/pages/Leaderboard";
import PrintDeckList from "@/pages/PrintDeckList";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/decks" element={<DeckList />} />
          <Route path="/decks/:id" element={<DeckPreview />} />
          <Route path="/game" element={<Game />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/game-details/:id" element={<GameDetails />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/print-decklist/:id" element={<PrintDeckList />} />
          {/* Add an alias route for the print functionality */}
          <Route path="/decks/:id/print" element={<PrintDeckList />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;