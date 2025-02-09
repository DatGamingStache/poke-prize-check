
import { useState } from "react";
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

interface GridSize {
  rows: number;
  columns: number;
}

const BinderHelper = () => {
  const [cardList, setCardList] = useState<string>("");
  const [gridSize, setGridSize] = useState<string>("3x3");
  const [processedCards, setProcessedCards] = useState<string[]>([]);

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
      .filter(line => line.length > 0);

    setProcessedCards(cards);
  };

  const selectedSize: GridSize = gridSizeOptions[gridSize as keyof typeof gridSizeOptions];
  const gridClass = `grid gap-4 grid-cols-${selectedSize.columns}`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Binder Helper</h1>

      <div className="space-y-4">
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

        <Button onClick={processCards}>
          Process Cards
        </Button>
      </div>

      {processedCards.length > 0 && (
        <div className={gridClass}>
          {processedCards.map((card, index) => (
            <div key={index} className="w-full aspect-[2.5/3.5] bg-muted rounded-lg overflow-hidden flex items-center justify-center p-4">
              <p className="text-sm text-muted-foreground text-center">{card}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BinderHelper;
