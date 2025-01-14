import React, { useState } from "react";
import PrizeGuessInput from "./PrizeGuessInput";

interface PrizeGuessesProps {
  guesses: string[];
  uniqueCards: string[];
  onGuessChange: (value: string, index: number) => void;
}

const PrizeGuesses = ({ guesses, uniqueCards, onGuessChange }: PrizeGuessesProps) => {
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);

  const handleEnterPress = (currentIndex: number) => {
    // Move to next empty input if available
    for (let i = currentIndex + 1; i < 6; i++) {
      if (!guesses[i]) {
        const nextInput = document.querySelector(`input[data-index="${i}"]`);
        if (nextInput instanceof HTMLInputElement) {
          nextInput.focus();
          break;
        }
      }
    }
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-medium">Prize Guesses</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array(6).fill(null).map((_, index) => (
          <PrizeGuessInput
            key={index}
            index={index}
            value={guesses[index] || ""}
            uniqueCards={uniqueCards}
            onChange={onGuessChange}
            activeSuggestionIndex={activeSuggestionIndex}
            setActiveSuggestionIndex={setActiveSuggestionIndex}
            onEnterPress={() => handleEnterPress(index)}
            guesses={guesses}
          />
        ))}
      </div>
    </div>
  );
};

export default PrizeGuesses;