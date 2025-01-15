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
  cards: string[];
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: preferences } = await supabase
          .from("user_preferences")
          .select("profile_picture_url, display_name")
          .eq("user_id", user.id)
          .single();
        
        if (preferences) {
          setProfilePicture(preferences.profile_picture_url);
          setDisplayName(preferences.display_name);
        }
      }
    };

    const fetchDecks = async () => {
      const { data } = await supabase.from("decklists").select("*");
      if (data) {
        // Convert the cards string to array for each deck
        const parsedDecks = data.map(deck => ({
          ...deck,
          cards: JSON.parse(deck.cards)
        }));
        setDecks(parsedDecks);
        setFilteredDecks(parsedDecks);
      }
    };

    fetchUserData();
    fetchDecks();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const filtered = decks.filter(deck =>
      deck.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDecks(filtered);
  };

  const handleDeleteDeck = async (id: string) => {
    await supabase.from("decklists").delete().match({ id });
    setFilteredDecks(filteredDecks.filter(deck => deck.id !== id));
    toast({
      title: "Deck deleted",
      description: "The deck has been successfully deleted.",
    });
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
    await supabase.auth.signOut();
    navigate("/login");
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
            />
          ))}
        </div>

        {/* Footer with Ko-fi Button */}
        <footer className="text-center pt-8">
          <KofiButton />
        </footer>
      </div>
    </div>
  );
};

export default DeckList;