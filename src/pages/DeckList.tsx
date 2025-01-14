import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LogOut, Pencil, Check, X, Eye, History, ChartBar, Search, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [previewDeck, setPreviewDeck] = useState<Deck | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    const filtered = decks.filter(deck => 
      deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDecks(filtered);
  }, [searchQuery, decks]);

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
    setFilteredDecks(data || []);
  };

  const handleDeckSelect = (deck: Deck, isPlay: boolean = false) => {
    if (isPlay) {
      navigate(`/game/${deck.id}`, { 
        state: { 
          decklist: deck.cards,
          deckId: deck.id
        } 
      });
    } else {
      navigate(`/decks/${deck.id}`, {
        state: deck
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDeleteDeck = async (deckId: string) => {
    const { error } = await supabase
      .from("decklists")
      .delete()
      .eq("id", deckId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete deck",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Deck deleted successfully",
    });

    setDeletingDeckId(null);
    loadDecks();
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-foreground/80">Dashboard</h1>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => navigate("/history")} className="gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
            <Button variant="outline" onClick={() => navigate("/analytics")} className="gap-2">
              <ChartBar className="h-4 w-4" />
              Analytics
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Deck
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full max-w-sm"
          />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {filteredDecks.map((deck) => (
              <Card
                key={deck.id}
                className="p-4 hover:bg-accent transition-colors cursor-pointer"
                onClick={() => !editingDeckId && handleDeckSelect(deck)}
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
                            handleDeckSelect(deck, true);
                          }}
                          className="text-primary hover:text-primary"
                        >
                          <Play className="h-4 w-4" />
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
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingDeckId(deck.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(deck.created_at).toLocaleDateString()}
                </p>
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

        <AlertDialog open={!!deletingDeckId} onOpenChange={(open) => !open && setDeletingDeckId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your deck.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingDeckId && handleDeleteDeck(deletingDeckId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default DeckList;
