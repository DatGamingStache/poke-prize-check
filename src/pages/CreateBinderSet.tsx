import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface GridSize {
  rows: number;
  columns: number;
}

interface CardState {
  name: string;
  isActive: boolean;
}

const BinderHelper = () => {
  const [cardList, setCardList] = useState<string>("");
  const [gridSize, setGridSize] = useState<string>("3x3");
  const [processedCards, setProcessedCards] = useState<CardState[]>([]);
  const [binderName, setBinderName] = useState<string>("");
  const [selectedCardToDeactivate, setSelectedCardToDeactivate] = useState<number | null>(null);
  const { toast } = useToast();

  const gridSizeOptions = {
    "2x2": { rows: 2, columns: 2 },
    "3x3": { rows: 3, columns: 3 },
    "3x4": { rows: 3, columns: 4 },
    "4x4": { rows: 4, columns: 4 },
  };

  const processCards = () => {
    const cards = cardList
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(card => ({ name: card, isActive: false }));  // Initialize all cards as inactive

    setProcessedCards(cards);
  };

  const handleCardClick = (index: number, currentState: boolean) => {
    if (!currentState) {
      // If card is inactive, activate it immediately
      const updatedCards = [...processedCards];
      updatedCards[index].isActive = true;
      setProcessedCards(updatedCards);
    } else {
      // If card is active, show confirmation dialog before deactivating
      setSelectedCardToDeactivate(index);
    }
  };

  const confirmDeactivateCard = () => {
    if (selectedCardToDeactivate !== null) {
      const updatedCards = [...processedCards];
      updatedCards[selectedCardToDeactivate].isActive = false;
      setProcessedCards(updatedCards);
      setSelectedCardToDeactivate(null);
    }
  };

  const saveBinder = async () => {
    if (!binderName) {
      toast({
        title: "Error",
        description: "Please enter a binder name",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert CardState[] to a format that matches the Json type
      const cardsJson: Json = processedCards.map(card => ({
        name: card.name,
        isActive: card.isActive
      }));

      const { data, error } = await supabase
        .from('binder_sets')
        .insert({
          name: binderName,
          cards: cardsJson
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Binder saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save binder",
        variant: "destructive",
      });
    }
  };

  const renderGrids = () => {
    const grids = [];
    const cardsPerGrid = 9; // 3x3 grid

    for (let i = 0; i < processedCards.length; i += cardsPerGrid) {
      const pageNumber = Math.floor(i / cardsPerGrid) + 1;
      const currentPageCards = processedCards.slice(i, i + cardsPerGrid);
      
      grids.push(
        <div key={pageNumber} className="space-y-2 mb-8">
          <h2 className="text-lg font-semibold text-center">Page {pageNumber}</h2>
          <div className="grid grid-cols-3 gap-2 max-w-[400px] mx-auto">
            {currentPageCards.map((card, index) => {
              const absoluteIndex = i + index + 1;
              const slotNumber = (index % 9) + 1;
              return (
                <div 
                  key={index} 
                  onClick={() => handleCardClick(i + index, card.isActive)}
                  className={`
                    aspect-[2.5/3.5] 
                    ${card.isActive ? 'bg-green-200' : 'bg-muted'} 
                    rounded-lg 
                    overflow-hidden 
                    flex 
                    items-center 
                    justify-center 
                    p-1 
                    h-24
                    cursor-pointer
                    hover:opacity-80
                    transition-all
                  `}
                >
                  <p className="text-xs font-semibold text-muted-foreground text-center">
                    {`Slot ${slotNumber} (${absoluteIndex})`}<br/>
                    {card.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return grids;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Binder Helper</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="binder-name">Binder Name</Label>
          <Input
            id="binder-name"
            value={binderName}
            onChange={(e) => setBinderName(e.target.value)}
            placeholder="Enter binder name..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grid-size">Grid Size</Label>
          <Select
            value={gridSize}
            onValueChange={setGridSize}
          >
            <SelectTrigger id="grid-size" className="w-[180px]">
              <SelectValue placeholder="Select grid size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2x2">2x2</SelectItem>
              <SelectItem value="3x3">3x3</SelectItem>
              <SelectItem value="3x4">3x4</SelectItem>
              <SelectItem value="4x4">4x4</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="card-list">Card List (one card per line)</Label>
          <Textarea
            id="card-list"
            value={cardList}
            onChange={(e) => setCardList(e.target.value)}
            placeholder="Enter your card list here..."
            className="min-h-[200px]"
          />
        </div>

        <div className="space-x-2">
          <Button onClick={processCards}>
            Process Cards
          </Button>
          {processedCards.length > 0 && (
            <Button onClick={saveBinder} variant="secondary">
              Save Binder
            </Button>
          )}
        </div>
      </div>

      {processedCards.length > 0 && (
        <div className="space-y-8">
          {renderGrids()}
        </div>
      )}

      <AlertDialog open={selectedCardToDeactivate !== null} onOpenChange={() => setSelectedCardToDeactivate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this card? You can reactivate it later by clicking again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivateCard}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BinderHelper;
