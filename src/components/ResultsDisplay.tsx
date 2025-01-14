import React from "react";
import { Card } from "@/components/ui/card";

interface ResultsDisplayProps {
  results: {
    correctGuesses: number;
    totalPrizes: number;
    guessedCards: string[];
    actualPrizes: string[];
    timeSpent: number;
  };
}

const ResultsDisplay = ({ results }: ResultsDisplayProps) => {
  const accuracy = (results.correctGuesses / results.totalPrizes) * 100;
  
  // Convert milliseconds to minutes and seconds for display
  const minutes = Math.floor((results.timeSpent / 1000) / 60);
  const seconds = Math.floor((results.timeSpent / 1000) % 60);

  return (
    <div className="glass-card p-6 rounded-lg space-y-6 animate-fade-in">
      <h2 className="text-2xl font-semibold text-center">Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Your Guesses</h3>
          <ul className="space-y-2">
            {results.guessedCards.map((card, index) => (
              <li 
                key={index}
                className={`p-2 rounded ${
                  results.actualPrizes.includes(card) 
                    ? "bg-green-100" 
                    : "bg-red-100"
                }`}
              >
                {card}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium mb-2">Actual Prizes</h3>
          <ul className="space-y-2">
            {results.actualPrizes.map((card, index) => (
              <li key={index} className="p-2 rounded bg-gray-100">
                {card}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="text-center space-y-2">
        <p className="text-xl">
          Accuracy: {accuracy.toFixed(1)}%
        </p>
        <p className="text-lg">
          Time: {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  );
};

export default ResultsDisplay;