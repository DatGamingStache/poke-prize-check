import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
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
      <h3 className="text-lg font-medium mb-4">
        Remaining Deck ({remainingDeck.length} cards)
      </h3>
      <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {remainingDeck.map((card, index) => (
            <CarouselItem
              key={index}
              className="pl-2 md:pl-4 basis-auto"
            >
              <Card className="p-2 h-48 w-[180px] flex items-center justify-center text-center select-none">
                {loading ? (
                  <Skeleton className="w-full h-full" />
                ) : cardImages[card] ? (
                  <img
                    src={cardImages[card]?.images.small}
                    alt={card}
                    className="w-full h-full object-contain rounded-lg"
                    loading="lazy"
                  />
                ) : (
                  <p className="text-sm">{card}</p>
                )}
              </Card>
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