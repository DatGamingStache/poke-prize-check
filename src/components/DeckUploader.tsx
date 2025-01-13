import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface DeckUploaderProps {
  onDeckSubmit: (decklist: string) => void;
}

const DeckUploader = ({ onDeckSubmit }: DeckUploaderProps) => {
  const [deckInput, setDeckInput] = useState("");
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
    onDeckSubmit(deckInput);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto">
      <div className="glass-card p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold text-center">Upload Decklist</h2>
        <textarea
          className="w-full h-40 p-3 rounded-md border bg-white/50"
          value={deckInput}
          onChange={(e) => setDeckInput(e.target.value)}
          placeholder="Enter your decklist here..."
        />
        <Button type="submit" className="w-full">
          Start Testing
        </Button>
      </div>
    </form>
  );
};

export default DeckUploader;