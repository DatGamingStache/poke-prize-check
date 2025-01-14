import React from "react";
import PrizeGuessInput from "./PrizeGuessInput";

interface PrizeGuessesProps {
  guesses: string[];
  uniqueCards: string[];
  onGuessChange: (value: string, index: number) => void;
}

const PrizeGuesses = ({ guesses, uniqueCards, onGuessChange }: PrizeGuessesProps) => {
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
          />
        ))}
      </div>
    </div>
  );
};

export default PrizeGuesses;