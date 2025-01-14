import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import DeckList from "@/pages/DeckList";
import DeckBuilder from "@/pages/DeckBuilder";
import Game from "@/pages/Game";
import PrintDeckList from "@/pages/PrintDeckList";

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/decks" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <Login /> : <Navigate to="/decks" replace />
          }
        />
        <Route
          path="/decks"
          element={
            isAuthenticated ? <DeckList /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/decks/:id"
          element={
            isAuthenticated ? <DeckBuilder /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/game/:id"
          element={
            isAuthenticated ? <Game /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/decks/:id/print" element={<PrintDeckList />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;