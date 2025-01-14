import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DeckUploader from "@/components/DeckUploader";

interface Deck {
  id: string;
  name: string;
  cards: string;
  created_at: string;
}

const DeckList = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const { data, error } = await supabase
      .from("decklists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load decks",
        variant: "destructive",
      });
      return;
    }

    setDecks(data || []);
  };

  const handleDeckSelect = (deck: Deck) => {
    navigate("/", { state: { decklist: deck.cards } });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">My Decks</h1>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Deck
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {isCreating ? (
          <div className="mt-8">
            <DeckUploader
              onDeckSubmit={async (decklist: string) => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) throw new Error("Not authenticated");

                  const { error } = await supabase.from("decklists").insert({
                    user_id: user.id,
                    name: `Deck ${decks.length + 1}`,
                    cards: decklist,
                  });

                  if (error) throw error;

                  toast({
                    title: "Success",
                    description: "Deck created successfully!",
                  });
                  
                  setIsCreating(false);
                  loadDecks();
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create deck",
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <Card
                key={deck.id}
                className="p-4 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => handleDeckSelect(deck)}
              >
                <h3 className="font-semibold mb-2">{deck.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(deck.created_at).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckList;