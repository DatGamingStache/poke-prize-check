import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import DeckList from "@/pages/DeckList";
import Game from "@/pages/Game";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/game" element={<Game />} />
        <Route path="/decks" element={<DeckList />} />
        <Route path="/" element={<Navigate to="/decks" replace />} />
      </Routes>
    </Router>
  );
}

export default App;