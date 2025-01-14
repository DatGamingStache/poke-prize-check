import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DeckUploader from "@/components/DeckUploader";
import GameBoard from "@/components/GameBoard";
import ResultsDisplay from "@/components/ResultsDisplay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GameResult {
  correctGuesses: number;
  totalPrizes: number;
  guessedCards: string[];
  actualPrizes: string[];
  timeSpent: number;
}

interface LocationState {
  decklist?: string;
  deckId?: string;
}

const Game = () => {
  const [decklist, setDecklist] = useState<string>("");
  const [deckId, setDeckId] = useState<string>("");
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
      setDeckId(state.deckId || "");
      setGameStarted(true);
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  const handleDeckSubmit = async (deck: string, name: string) => {
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

      const { data, error } = await supabase.from("decklists").insert({
        user_id: user.id,
        name: name,
        cards: deck,
      }).select().single();

      if (error) throw error;

      setDecklist(deck);
      setDeckId(data.id);
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

  const handleBackToDecks = () => {
    navigate("/decks");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">TCG Prize Predictor</h1>
          <Button variant="outline" onClick={handleBackToDecks}>
            Back to Decks
          </Button>
        </div>

        {!gameStarted && !gameResult && (
          <DeckUploader onDeckSubmit={handleDeckSubmit} />
        )}

        {gameStarted && (
          <GameBoard 
            decklist={decklist}
            deckId={deckId}
            onGameComplete={handleGameComplete}
            onRestart={handleRestart}
          />
        )}

        {gameResult && (
          <ResultsDisplay results={gameResult} />
        )}
      </div>
    </div>
  );
}

export default Game;