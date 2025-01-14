import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import DeckList from "./pages/DeckList";
import Game from "./pages/Game";
import History from "./pages/History";
import GameDetails from "./pages/GameDetails";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/decks" element={<DeckList />} />
        <Route path="/game/:deckId" element={<Game />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:sessionId" element={<GameDetails />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;