import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Pencil, Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [previewDeck, setPreviewDeck] = useState<Deck | null>(null);
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

  const startEditing = (deck: Deck) => {
    setEditingDeckId(deck.id);
    setEditingName(deck.name);
  };

  const cancelEditing = () => {
    setEditingDeckId(null);
    setEditingName("");
  };

  const saveDeckName = async (deckId: string) => {
    if (!editingName.trim()) {
      toast({
        title: "Error",
        description: "Deck name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("decklists")
      .update({ name: editingName })
      .eq("id", deckId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update deck name",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Deck name updated successfully",
    });

    setEditingDeckId(null);
    loadDecks();
  };

  const formatDeckList = (cards: string) => {
    return cards.split('\n').map((line, index) => (
      <div key={index} className="py-1">
        {line}
      </div>
    ));
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
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {isCreating ? (
          <div className="mt-8">
            <DeckUploader
              onDeckSubmit={async (decklist: string, name: string) => {
                try {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) throw new Error("Not authenticated");

                  const { error } = await supabase.from("decklists").insert({
                    user_id: user.id,
                    name: name,
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
                className="p-4 hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  {editingDeckId === deck.id ? (
                    <div className="flex items-center space-x-2 w-full">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => saveDeckName(deck.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold">{deck.name}</h3>
                      <div className="flex space-x-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDeck(deck);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(deck);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <div
                  className="cursor-pointer"
                  onClick={() => !editingDeckId && handleDeckSelect(deck)}
                >
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(deck.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!previewDeck} onOpenChange={() => setPreviewDeck(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{previewDeck?.name}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {previewDeck && formatDeckList(previewDeck.cards)}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DeckList;