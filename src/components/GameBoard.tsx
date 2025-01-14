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
    
    const lines = decklist.split('\n').filter(line => line.trim());
    
    const deck: string[] = [];
    lines.forEach(line => {
      const match = line.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        const [, count, cardName] = match;
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

    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);
    
    const initialHand = shuffledDeck.slice(0, 7);
    const prizesCards = shuffledDeck.slice(7, 13);
    const remaining = shuffledDeck.slice(13);
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

  const extractCardName = (cardString: string): string => {
    return cardString.split(/\s+(?:\(|\d)/).shift()?.trim() || cardString;
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

    const prizeNames = prizes.map(extractCardName);
    const guessNames = guesses.map(extractCardName);

    // Create a map to count occurrences of each card in prizes
    const prizeCardCounts = new Map<string, number>();
    prizeNames.forEach(name => {
      prizeCardCounts.set(name, (prizeCardCounts.get(name) || 0) + 1);
    });

    // Create a map to count occurrences of each card in guesses
    const guessCardCounts = new Map<string, number>();
    guessNames.forEach(name => {
      guessCardCounts.set(name, (guessCardCounts.get(name) || 0) + 1);
    });

    let correctGuesses = 0;
    // For each unique prize card
    prizeCardCounts.forEach((prizeCount, prizeName) => {
      // Get the number of times this card was guessed (0 if not guessed)
      const guessCount = guessCardCounts.get(prizeName) || 0;
      // Add the minimum of prize count and guess count
      // This ensures we don't count more matches than actual instances
      correctGuesses += Math.min(prizeCount, guessCount);
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
              <Card key={index} className="p-4 text-center animate-fade-in select-none">
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
                  <Card className="p-4 h-32 flex items-center justify-center text-center select-none">
                    {card}
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">Prize Cards (Testing Only)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {prizes.map((prize, index) => (
              <div key={index} className="p-2 bg-background rounded text-sm select-none">
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