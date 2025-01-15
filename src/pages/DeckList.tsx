import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DeckUploader from "@/components/DeckUploader";
import UserProfileSettings from "@/components/UserProfileSettings";
import DeckListHeader from "@/components/deck/DeckListHeader";
import DeckSearch from "@/components/deck/DeckSearch";
import DeckCard from "@/components/deck/DeckCard";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface Deck {
  id: string;
  name: string;
  cards: string;
  created_at: string;
}

const DeckList: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [previewDeck, setPreviewDeck] = useState<Deck | null>(null);
  const [deletingDeckId, setDeletingDeckId] = useState<string | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check session on mount and redirect if not authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          navigate("/login");
          return;
        }

        if (!session) {
          console.log("No active session found");
          navigate("/login");
          return;
        }

        // Only proceed to load data if we have a valid session
        await Promise.all([
          loadDecks(),
          loadUserProfile()
        ]);
      } catch (error) {
        console.error("Error in session check:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from('user_preferences')
        .select('profile_picture_url, display_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (data) {
        setProfilePicture(data.profile_picture_url);
        setDisplayName(data.display_name || '');
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive",
      });
    }
  };

  const loadDecks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("decklists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDecks(data || []);
      setFilteredDecks(data || []);
    } catch (error) {
      console.error('Error loading decks:', error);
      toast({
        title: "Error",
        description: "Failed to load decks",
        variant: "destructive",
      });
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <DeckListHeader
          onNewDeck={() => setIsCreating(true)}
          onShowSettings={() => setShowProfileSettings(true)}
          onLogout={handleLogout}
          profilePicture={profilePicture}
          displayName={displayName}
        />

        <DeckSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

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
              <DeckCard
                key={deck.id}
                deck={deck}
                isEditing={editingDeckId === deck.id}
                editingName={editingName}
                onEdit={() => {
                  setEditingDeckId(deck.id);
                  setEditingName(deck.name);
                }}
                onDelete={() => setDeletingDeckId(deck.id)}
                onPlay={() => handleDeckSelect(deck, true)}
                onSelect={() => handleDeckSelect(deck, false)}
                onSave={() => saveDeckName(deck.id)}
                onCancel={() => {
                  setEditingDeckId(null);
                  setEditingName("");
                }}
                onNameChange={setEditingName}
              />
            ))}
          </div>
        )}

        <Dialog open={showProfileSettings} onOpenChange={setShowProfileSettings}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile Settings</DialogTitle>
            </DialogHeader>
            <UserProfileSettings onClose={() => setShowProfileSettings(false)} />
          </DialogContent>
        </Dialog>

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
