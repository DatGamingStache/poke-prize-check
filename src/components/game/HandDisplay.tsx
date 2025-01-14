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
    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
      {hand.map((card, index) => (
        <Card key={index} className="p-1 text-center animate-fade-in select-none h-48 w-[180px] mx-auto">
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : cardImages[card] ? (
            <img
              src={cardImages[card]?.images.small}
              alt={card}
              className="w-full h-full rounded-sm object-contain"
              loading="lazy"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs">{card}</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default HandDisplay;