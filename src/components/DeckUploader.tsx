import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface DeckUploaderProps {
  onDeckSubmit: (decklist: string, name: string) => void;
  onCancel?: () => void;
}

const DeckUploader = ({ onDeckSubmit, onCancel }: DeckUploaderProps) => {
  const [deckInput, setDeckInput] = useState("");
  const [deckName, setDeckName] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a decklist",
        variant: "destructive",
      });
      return;
    }
    if (!deckName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deck name",
        variant: "destructive",
      });
      return;
    }
    onDeckSubmit(deckInput, deckName);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="glass-card p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold text-center">Upload Decklist</h2>
        <div className="space-y-2">
          <Input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="Enter deck name..."
            className="w-full"
          />
        </div>
        <textarea
          className="w-full h-40 p-3 rounded-md border bg-white/50"
          value={deckInput}
          onChange={(e) => setDeckInput(e.target.value)}
          placeholder="Enter your decklist here..."
        />
        <div className="flex space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button type="submit" className="flex-1">
            Save Deck
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DeckUploader;