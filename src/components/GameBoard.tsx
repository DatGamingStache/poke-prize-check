import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Timer from "./Timer";
import PrizeGuesses from "./PrizeGuesses";
import HandDisplay from "./game/HandDisplay";
import RemainingDeck from "./game/RemainingDeck";
import PrizeDisplay from "./game/PrizeDisplay";
import GameControls from "./game/GameControls";

interface GameBoardProps {
  decklist: string;
  deckId?: string;
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

const GameBoard = ({ decklist, deckId, onGameComplete, onRestart }: GameBoardProps) => {
  const [hand, setHand] = useState<string[]>([]);
  const [prizes, setPrizes] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [remainingDeck, setRemainingDeck] = useState<string[]>([]);
  const [uniqueCards, setUniqueCards] = useState<string[]>([]);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [resetTimer, setResetTimer] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const initializeGame = () => {
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
    setTimeSpent(0);
    setResetTimer(prev => !prev);
  };

  useEffect(() => {
    initializeGame();
  }, [decklist]);

  const handleCardGuess = (value: string, index: number) => {
    const newGuesses = [...guesses];
    newGuesses[index] = value;
    setGuesses(newGuesses);
  };

  const extractCardName = (cardString: string): string => {
    return cardString.split(/\s+(?:\(|\d)/).shift()?.trim() || cardString;
  };

  const saveGameSession = async (results: GameResult) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !deckId) {
        console.error("User not authenticated or deck ID not provided");
        return;
      }

      const { error } = await supabase.from("game_sessions").insert({
        user_id: user.id,
        decklist_id: deckId,
        correct_guesses: results.correctGuesses,
        total_prizes: results.totalPrizes,
        guessed_cards: results.guessedCards,
        actual_prizes: results.actualPrizes,
        time_spent: results.timeSpent
      });

      if (error) {
        console.error("Error saving game session:", error);
        toast({
          title: "Error",
          description: "Failed to save game session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving game session:", error);
    }
  };

  const handleSubmitGuesses = async () => {
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

    const prizeCardCounts = new Map<string, number>();
    prizeNames.forEach(name => {
      prizeCardCounts.set(name, (prizeCardCounts.get(name) || 0) + 1);
    });

    const guessCardCounts = new Map<string, number>();
    guessNames.forEach(name => {
      guessCardCounts.set(name, (guessCardCounts.get(name) || 0) + 1);
    });

    let correctGuesses = 0;
    prizeCardCounts.forEach((prizeCount, prizeName) => {
      const guessCount = guessCardCounts.get(prizeName) || 0;
      correctGuesses += Math.min(prizeCount, guessCount);
    });

    const results = {
      correctGuesses,
      totalPrizes: 6,
      guessedCards: guesses,
      actualPrizes: prizes,
      timeSpent,
    };

    await saveGameSession(results);
    onGameComplete(results);
  };

  const handleRestartGame = () => {
    initializeGame();
    onRestart();
    setShowRestartDialog(false);
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
            <Timer onTimeUpdate={setTimeSpent} reset={resetTimer} />
          </div>
          
          <HandDisplay hand={hand} />
        </div>

        <RemainingDeck remainingDeck={remainingDeck} />
        <PrizeDisplay prizes={prizes} />

        <PrizeGuesses
          guesses={guesses}
          uniqueCards={uniqueCards}
          onGuessChange={handleCardGuess}
        />

        <GameControls
          onSubmitGuesses={handleSubmitGuesses}
          showRestartDialog={showRestartDialog}
          setShowRestartDialog={setShowRestartDialog}
          onRestartGame={handleRestartGame}
        />
      </div>
    </div>
  );
};

export default GameBoard;
