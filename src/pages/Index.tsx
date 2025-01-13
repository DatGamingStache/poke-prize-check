import React, { useState } from "react";
import DeckUploader from "@/components/DeckUploader";
import GameBoard from "@/components/GameBoard";
import ResultsDisplay from "@/components/ResultsDisplay";

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

  const handleDeckSubmit = (deck: string) => {
    setDecklist(deck);
    setGameStarted(true);
    setGameResult(null);
  };

  const handleGameComplete = (results: GameResult) => {
    setGameResult(results);
    setGameStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          TCG Prize Predictor
        </h1>

        {!gameStarted && !gameResult && (
          <DeckUploader onDeckSubmit={handleDeckSubmit} />
        )}

        {gameStarted && (
          <GameBoard 
            decklist={decklist}
            onGameComplete={handleGameComplete}
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