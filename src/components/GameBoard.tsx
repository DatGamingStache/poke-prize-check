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

  const parseDeckList = (decklist: string) => {
    // Split the decklist into lines and remove empty lines
    const lines = decklist.split('\n').filter(line => line.trim());
    
    // Parse each line into card count and name
    const deck: string[] = [];
    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        const [, count, cardName] = match;
        // Add the card to the deck the specified number of times
        for (let i = 0; i < parseInt(count); i++) {
          deck.push(cardName);
        }
      }
    });

    return deck;
  };

  useEffect(() => {
    const deck = parseDeckList(decklist);
    
    if (deck.length !== 60) {
      toast({
        title: "Invalid Deck",
        description: "Please ensure your deck contains exactly 60 cards",
        variant: "destructive",
      });
      return;
    }

    // Shuffle the deck
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    
    // Draw 7 cards for hand
    const initialHand = shuffledDeck.slice(0, 7);
    
    // Take 6 cards for prizes
    const prizesCards = shuffledDeck.slice(7, 13);
    
    setHand(initialHand);
    setPrizes(prizesCards);
  }, [decklist, toast]);

  const handleCardGuess = (cardName: string, index: number) => {
    if (guesses.length >= 6) return;
    
    const newGuesses = [...guesses];
    newGuesses[index] = cardName;
    setGuesses(newGuesses);
  };

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
          <h3 className="text-lg font-medium">Your Hand ({hand.length} cards)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hand.map((card, index) => (
              <Card key={index} className="p-4 text-center animate-fade-in">
                {card}
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-medium">Prize Guesses</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array(6).fill(null).map((_, index) => (
              <Card 
                key={index} 
                className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  const guess = prompt("Enter your guess for this prize card:");
                  if (guess) handleCardGuess(guess, index);
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