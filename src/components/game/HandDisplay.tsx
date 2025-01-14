import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { searchCard, PokemonCard } from "@/utils/pokemonCards";
import { Skeleton } from "@/components/ui/skeleton";

interface HandDisplayProps {
  hand: string[];
}

const HandDisplay = ({ hand }: HandDisplayProps) => {
  const [cardImages, setCardImages] = useState<Record<string, PokemonCard | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCardImages = async () => {
      setLoading(true);
      const images: Record<string, PokemonCard | null> = {};
      
      for (const cardName of hand) {
        if (!cardImages[cardName]) {
          const card = await searchCard(cardName);
          images[cardName] = card;
        }
      }
      
      setCardImages(prev => ({ ...prev, ...images }));
      setLoading(false);
    };

    fetchCardImages();
  }, [hand]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {hand.map((card, index) => (
        <Card key={index} className="p-2 text-center animate-fade-in select-none">
          {loading ? (
            <Skeleton className="w-full h-64" />
          ) : cardImages[card] ? (
            <div className="space-y-2">
              <img
                src={cardImages[card]?.images.small}
                alt={card}
                className="w-full rounded-lg"
                loading="lazy"
              />
              <p className="text-sm font-medium">{card}</p>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm">{card}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default HandDisplay;