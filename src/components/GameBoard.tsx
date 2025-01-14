import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Timer from "./Timer";
import PrizeGuesses from "./PrizeGuesses";
import { useToast } from "@/hooks/use-toast";

interface GameBoardProps {
  decklist: string;
  onGameComplete: (results: GameResult) => void;
  onRestart: () => void;
}

interface GameResult {
  correctGuesses: number;
  totalPrizes: number;
  guessedCards: string[];
  actualPrizes: string[];
  timeSpent: number;
}

const GameBoard = ({ decklist, onGameComplete, onRestart }: GameBoardProps) => {
  const [hand, setHand] = useState<string[]>([]);
  const [prizes, setPrizes] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [remainingDeck, setRemainingDeck] = useState<string[]>([]);
  const [uniqueCards, setUniqueCards] = useState<string[]>([]);
  const { toast } = useToast();

  const parseDeckList = (decklist: string) => {
    if (!decklist) return [];
    
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
    if (!decklist) return;

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
    
    // Set remaining deck
    const remaining = shuffledDeck.slice(13);
    
    // Get unique card names for autocomplete
    const unique = Array.from(new Set(deck)).sort();

    setHand(initialHand);
    setPrizes(prizesCards);
    setRemainingDeck(remaining);
    setUniqueCards(unique);
    setGuesses([]);
  }, [decklist, toast]);

  const handleCardGuess = (value: string, index: number) => {
    const newGuesses = [...guesses];
    newGuesses[index] = value;
    setGuesses(newGuesses);
  };

  const handleSubmitGuesses = () => {
    const filledGuesses = guesses.filter(Boolean);
    if (filledGuesses.length !== 6) {
      toast({
        title: "Error",
        description: "Please make 6 prize card guesses",
        variant: "destructive",
      });
      return;
    }

    // Create copies of both arrays to track matches
    const remainingPrizes = [...prizes];
    const remainingGuesses = [...guesses];
    let correctGuesses = 0;

    // For each prize card, find the first matching unprocessed guess
    remainingPrizes.forEach(prize => {
      const guessIndex = remainingGuesses.findIndex(guess => guess === prize);
      if (guessIndex !== -1) {
        // Remove the matched guess so it can't be counted again
        remainingGuesses.splice(guessIndex, 1);
        correctGuesses++;
      }
    });

    onGameComplete({
      correctGuesses,
      totalPrizes: 6,
      guessedCards: guesses,
      actualPrizes: prizes,
      timeSpent,
    });
  };

  if (!decklist) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card p-6 rounded-lg">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Hand ({hand.length} cards)</h3>
            <Timer onTimeUpdate={setTimeSpent} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hand.map((card, index) => (
              <Card key={index} className="p-4 text-center animate-fade-in">
                {card}
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Remaining Deck ({remainingDeck.length} cards)</h3>
          <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {remainingDeck.map((card, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/6">
                  <Card className="p-4 h-32 flex items-center justify-center text-center">
                    {card}
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Temporary Prize List for Testing */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Prize Cards (Testing Only)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {prizes.map((prize, index) => (
              <div key={index} className="p-2 bg-background rounded text-sm">
                {prize}
              </div>
            ))}
          </div>
        </div>

        <PrizeGuesses
          guesses={guesses}
          uniqueCards={uniqueCards}
          onGuessChange={handleCardGuess}
        />

        <div className="mt-8 space-y-4">
          <Button 
            onClick={handleSubmitGuesses}
            className="w-full"
          >
            Submit Guesses
          </Button>

          <Button 
            onClick={onRestart}
            variant="outline"
            className="w-full"
          >
            Start New Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
