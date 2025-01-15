import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DeckCard from "@/components/deck/DeckCard";
import DeckListHeader from "@/components/deck/DeckListHeader";
import DeckSearch from "@/components/deck/DeckSearch";
import KofiButton from "@/components/KofiButton";
import { useToast } from "@/components/ui/use-toast";

interface Deck {
  id: string;
  name: string;
  cards: string;
  created_at: string;
  user_id: string;
}

const DeckList = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log("Auth response:", { user, error: userError });

        if (userError) {
          console.error("Auth error:", userError);
          toast({
            title: "Authentication Error",
            description: "Please try logging in again",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        if (user) {
          console.log("Fetching user preferences...");
          const { data: preferences, error: prefError } = await supabase
            .from("user_preferences")
            .select("profile_picture_url, display_name")
            .eq("user_id", user.id)
            .single();
          
          console.log("Preferences response:", { preferences, error: prefError });

          if (prefError) {
            console.error("Preferences error:", prefError);
            toast({
              title: "Error",
              description: "Failed to load user preferences",
              variant: "destructive",
            });
            return;
          }

          if (preferences) {
            setProfilePicture(preferences.profile_picture_url);
            setDisplayName(preferences.display_name);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    const fetchDecks = async () => {
      try {
        console.log("Fetching decks...");
        const { data, error } = await supabase.from("decklists").select("*");
        console.log("Decks response:", { data, error });

        if (error) {
          console.error("Decks error:", error);
          toast({
            title: "Error",
            description: "Failed to load decks",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setDecks(data);
          setFilteredDecks(data);
        }
      } catch (error) {
        console.error("Unexpected error fetching decks:", error);
      }
    };

    fetchUserData();
    fetchDecks();
  }, [navigate, toast]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const filtered = decks.filter(deck =>
      deck.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDecks(filtered);
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      const { error } = await supabase.from("decklists").delete().match({ id });
      if (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error",
          description: "Failed to delete deck",
          variant: "destructive",
        });
        return;
      }
      setFilteredDecks(filteredDecks.filter(deck => deck.id !== id));
      toast({
        title: "Deck deleted",
        description: "The deck has been successfully deleted.",
      });
    } catch (error) {
      console.error("Unexpected error deleting deck:", error);
    }
  };

  const handleEditDeck = (id: string) => {
    navigate(`/decks/${id}`);
  };

  const handleNewDeck = () => {
    navigate("/decks/new");
  };

  const handleShowSettings = () => {
    navigate("/settings");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        toast({
          title: "Error",
          description: "Failed to log out",
          variant: "destructive",
        });
        return;
      }
      navigate("/login");
    } catch (error) {
      console.error("Unexpected error during logout:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <DeckListHeader 
          onNewDeck={handleNewDeck}
          onShowSettings={handleShowSettings}
          onLogout={handleLogout}
          profilePicture={profilePicture}
          displayName={displayName}
        />
        
        <DeckSearch 
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDelete={() => handleDeleteDeck(deck.id)}
              onEdit={() => handleEditDeck(deck.id)}
              isEditing={false}
              editingName=""
              onSave={() => {}}
              onCancel={() => {}}
              onNameChange={() => {}}
              onPlay={() => {}}
              onSelect={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DeckList;