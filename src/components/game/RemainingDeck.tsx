import React from "react";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RemainingDeckProps {
  remainingDeck: string[];
}

const RemainingDeck = ({ remainingDeck }: RemainingDeckProps) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">Remaining Deck ({remainingDeck.length} cards)</h3>
      <Carousel className="w-full" opts={{ align: "start", dragFree: true }}>
        <CarouselContent className="-ml-2 md:-ml-4">
          {remainingDeck.map((card, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/6">
              <Card className="p-4 h-32 flex items-center justify-center text-center select-none">
                {card}
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