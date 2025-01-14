import React, { useState, useEffect } from "react";
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
        <div key={index} className="animate-fade-in select-none">
          {loading ? (
            <Skeleton className="w-32 h-44" />
          ) : cardImages[card] ? (
            <img
              src={cardImages[card]?.images.small}
              alt={card}
              className="w-32 h-auto rounded-sm object-contain select-none"
              loading="lazy"
              draggable="false"
            />
          ) : (
            <div className="w-32 h-44 flex items-center justify-center bg-muted rounded-sm">
              <p className="text-xs">{card}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HandDisplay;