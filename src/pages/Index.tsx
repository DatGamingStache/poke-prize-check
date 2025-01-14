import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeckUploader from "@/components/DeckUploader";
import GameBoard from "@/components/GameBoard";
import ResultsDisplay from "@/components/ResultsDisplay";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GameResult {
  correctGuesses: number;
  totalPrizes: number;
  guessedCards: string[];
  actualPrizes: string[];
  timeSpent: number;
}

const Index = () => {
  const [decklist, setDecklist] = useState<string>("");
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

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
        name: "My Deck", // You might want to add a name input field later
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">TCG Prize Predictor</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
    </div>
  );
};

export default Index;