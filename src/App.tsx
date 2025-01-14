import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Index from "@/pages/Index";
import DeckList from "@/pages/DeckList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/decks" element={<DeckList />} />
        <Route path="/" element={<Index />} />
      </Routes>
    </Router>
  );
}

export default App;