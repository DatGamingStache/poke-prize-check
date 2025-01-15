import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DeckCard from "@/components/deck/DeckCard";
import DeckListHeader from "@/components/deck/DeckListHeader";
import DeckSearch from "@/components/deck/DeckSearch";
import KofiButton from "@/components/KofiButton";

interface Deck {
  id: string;
  name: string;
  cards: string[];
}

const DeckList = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecks = async () => {
      const { data } = await supabase.from("decklists").select("*");
      setDecks(data);
      setFilteredDecks(data);
    };
    fetchDecks();
  }, []);

  const handleSearch = (searchTerm: string) => {
    const filtered = decks.filter(deck =>
      deck.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDecks(filtered);
  };

  const handleDeleteDeck = async (id: string) => {
    await supabase.from("decklists").delete().match({ id });
    setFilteredDecks(filteredDecks.filter(deck => deck.id !== id));
  };

  const handleEditDeck = (id: string) => {
    navigate(`/decks/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <DeckListHeader />
        <DeckSearch onSearch={handleSearch} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDecks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDelete={handleDeleteDeck}
              onEdit={handleEditDeck}
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
