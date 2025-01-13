import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Timer from "./Timer";
import { useToast } from "@/hooks/use-toast";

interface GameBoardProps {
  decklist: string;
  onGameComplete: (results: GameResult) => void;
}

interface GameResult {
  correctGuesses: number;
  totalPrizes: number;
  guessedCards: string[];
  actualPrizes: string[];
  timeSpent: number;
}

const GameBoard = ({ decklist, onGameComplete }: GameBoardProps) => {
  const [hand, setHand] = useState<string[]>([]);
  const [prizes, setPrizes] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate drawing initial hand and setting prizes
    const cards = decklist.split("\n").filter(card => card.trim());
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setHand(shuffled.slice(0, 7));
    setPrizes(shuffled.slice(7, 13));
  }, [decklist]);

  const handleSubmitGuesses = () => {
    if (guesses.length !== 6) {
      toast({
        title: "Error",
        description: "Please make 6 prize card guesses",
        variant: "destructive",
      });
      return;
    }

    const correctGuesses = guesses.filter(guess => 
      prizes.includes(guess)
    ).length;

    onGameComplete({
      correctGuesses,
      totalPrizes: 6,
      guessedCards: guesses,
      actualPrizes: prizes,
      timeSpent,
    });
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 rounded-lg">
        <Timer onTimeUpdate={setTimeSpent} />
        
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Your Hand</h3>
          <div className="card-grid">
            {hand.map((card, index) => (
              <Card key={index} className="p-4 text-center animate-fade-in">
                {card}
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-medium">Prize Guesses</h3>
          <div className="card-grid">
            {Array(6).fill(null).map((_, index) => (
              <Card 
                key={index} 
                className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  // Implement prize guessing logic
                }}
              >
                {guesses[index] || "Click to guess"}
              </Card>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmitGuesses}
          className="mt-6 w-full"
        >
          Submit Guesses
        </Button>
      </div>
    </div>
  );
};

export default GameBoard;