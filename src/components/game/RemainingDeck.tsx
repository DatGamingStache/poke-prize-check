import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { searchCard, PokemonCard } from "@/utils/pokemonCards";
import { Skeleton } from "@/components/ui/skeleton";

interface RemainingDeckProps {
  remainingDeck: string[];
}

const RemainingDeck = ({ remainingDeck }: RemainingDeckProps) => {
  const [cardImages, setCardImages] = useState<Record<string, PokemonCard | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCardImages = async () => {
      setLoading(true);
      const images: Record<string, PokemonCard | null> = {};
      
      for (const cardName of remainingDeck) {
        if (!cardImages[cardName]) {
          const card = await searchCard(cardName);
          images[cardName] = card;
        }
      }
      
      setCardImages(prev => ({ ...prev, ...images }));
      setLoading(false);
    };

    fetchCardImages();
  }, [remainingDeck]);

  return (
    <div className="mt-6">
      <Carousel className="w-full select-none" opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {remainingDeck.map((card, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-auto select-none"
            >
              {loading ? (
                <Skeleton className="w-32 h-44" />
              ) : cardImages[card] ? (
                <img
                  src={cardImages[card]?.images.small}
                  alt={card}
                  className="w-32 h-auto object-contain rounded-sm select-none"
                  loading="lazy"
                  draggable="false"
                />
              ) : (
                <div className="w-32 h-44 flex items-center justify-center bg-muted rounded-sm">
                  <p className="text-xs">{card}</p>
                </div>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default RemainingDeck;