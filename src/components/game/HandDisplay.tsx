import React from "react";
import { Card } from "@/components/ui/card";

interface HandDisplayProps {
  hand: string[];
}

const HandDisplay = ({ hand }: HandDisplayProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {hand.map((card, index) => (
        <Card key={index} className="p-4 text-center animate-fade-in select-none">
          {card}
        </Card>
      ))}
    </div>
  );
};

export default HandDisplay;