import React from "react";

interface PrizeDisplayProps {
  prizes: string[];
}

const PrizeDisplay = ({ prizes }: PrizeDisplayProps) => {
  return (
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
  );
};

export default PrizeDisplay;