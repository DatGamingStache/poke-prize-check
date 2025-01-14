import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Pencil, Trash2, Printer } from "lucide-react";
import PrintDeckList from "./PrintDeckList";

interface Deck {
  id: string;
  name: string;
  cards: string;
  created_at: string;
}

interface DeckCardProps {
  deck: Deck;
  isEditing: boolean;
  editingName: string;
  onEdit: () => void;
  onDelete: () => void;
  onPlay: () => void;
  onSelect: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  isEditing,
  editingName,
  onEdit,
  onDelete,
  onPlay,
  onSelect,
  onSave,
  onCancel,
  onNameChange,
}) => {
  const handlePrint = () => {
    // Parse the deck string into card objects
    const cardList = deck.cards.split('\n')
      .map(line => {
        const match = line.match(/^(\d+)\s+(.+)$/);
        return match ? { quantity: parseInt(match[1]), name: match[2] } : null;
      })
      .filter((card): card is { quantity: number; name: string } => card !== null);

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Write the print-friendly HTML to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${deck.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 20px; }
            h2 { font-size: 18px; margin: 15px 0 10px; }
            ul { list-style: none; padding: 0; }
            li { margin: 5px 0; }
            .quantity { display: inline-block; width: 30px; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
    `);

    // Render the component content
    printWindow.document.write('<div id="print-content">');
    const date = new Date(deck.created_at).toLocaleDateString();
    const content = <PrintDeckList name={deck.name} cards={cardList} date={date} />;
    // @ts-ignore - React 18 has types for this
    const html = React.renderToString(content);
    printWindow.document.write(html);
    printWindow.document.write('</div></body></html>');
    
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a short delay to ensure styles are loaded
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    }, 250);
  };

  return (
    <div
      className="glass-card rounded-lg p-4 cursor-pointer transition-all hover:shadow-xl"
      onClick={onSelect}
    >
      {isEditing ? (
        <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editingName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Deck name"
            className="w-full"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save</Button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-semibold">{deck.name}</h3>
          <div className="flex items-center space-x-3">
            <Play 
              className="h-5 w-5 text-green-500 hover:text-green-600 cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onPlay();
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Printer
              className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handlePrint();
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DeckCard;