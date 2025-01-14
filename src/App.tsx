import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Login from "./pages/Login";
import DeckList from "./pages/DeckList";
import Game from "./pages/Game";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import DeckPreview from "./pages/DeckPreview";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<DeckList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/decks" element={<DeckList />} />
        <Route path="/game" element={<Game />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/deck-preview" element={<DeckPreview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;