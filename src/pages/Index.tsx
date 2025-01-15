import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DeckUploader from "@/components/DeckUploader";
import GameBoard from "@/components/GameBoard";
import ResultsDisplay from "@/components/ResultsDisplay";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import KofiButton from "@/components/KofiButton";

interface GameResult {
  correctGuesses: number;
  totalPrizes: number;
  guessedCards: string[];
  actualPrizes: string[];
  timeSpent: number;
}

interface LocationState {
  decklist?: string;
}

const Index = () => {
  const [decklist, setDecklist] = useState<string>("");
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (state?.decklist) {
      setDecklist(state.decklist);
      setGameStarted(true);
      // Clear the location state to prevent restarting the game on refresh
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  const handleDeckSubmit = async (deck: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to save a deck",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("decklists").insert({
        user_id: user.id,
        name: "My Deck",
        cards: deck,
      });

      if (error) throw error;

      setDecklist(deck);
      setGameStarted(true);
      setGameResult(null);

      toast({
        title: "Success",
        description: "Deck saved successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save deck",
        variant: "destructive",
      });
    }
  };

  const handleGameComplete = (results: GameResult) => {
    setGameResult(results);
    setGameStarted(false);
  };

  const handleRestart = () => {
    setGameStarted(true);
    setGameResult(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleBackToDecks = () => {
    navigate("/decks");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">TCG Prize Predictor</h1>
          <div className="space-x-4">
            <Button variant="outline" onClick={handleBackToDecks}>
              Back to Decks
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {!gameStarted && !gameResult && (
          <DeckUploader onDeckSubmit={handleDeckSubmit} />
        )}

        {gameStarted && (
          <GameBoard 
            decklist={decklist}
            onGameComplete={handleGameComplete}
            onRestart={handleRestart}
          />
        )}

        {gameResult && (
          <ResultsDisplay results={gameResult} />
        )}
      </div>
      
      {/* Footer with Ko-fi button */}
      <footer className="w-full flex flex-col items-center gap-4 mt-8 py-4">
        <KofiButton />
      </footer>
    </div>
  );
};

export default Index;