import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import DeckList from "@/pages/DeckList";
import DeckPreview from "@/pages/DeckPreview";
import Game from "@/pages/Game";
import History from "@/pages/History";
import GameDetails from "@/pages/GameDetails";
import Analytics from "@/pages/Analytics";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/decks" element={<DeckList />} />
          <Route path="/decks/:id" element={<DeckPreview />} />
          <Route path="/game/:id" element={<Game />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id" element={<GameDetails />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;