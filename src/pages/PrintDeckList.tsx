import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface UserProfile {
  display_name: string;
  player_name: string | null;
  player_id: string | null;
  birthdate: string | null;
  division: string | null;
}

const PrintDeckList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = React.useState<{ cards: string } | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch deck data
      const { data: deckData, error: deckError } = await supabase
        .from("decklists")
        .select("cards")
        .eq("id", id)
        .single();

      if (deckError) {
        console.error("Error fetching deck:", deckError);
        return;
      }

      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from("user_preferences")
        .select("display_name, player_name, player_id, birthdate, division")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      setDeck(deckData);
      setProfile(profileData);
    };

    fetchData();
  }, [id]);

  if (!deck || !profile) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  // Function to process the text and make specific headers bold
  const formatDeckList = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.startsWith('Pokémon:') || 
          line.startsWith('Pokemon:') ||
          line.startsWith('Trainer:') || 
          line.startsWith('Energy:')) {
        return <div key={index} className="font-bold">{line}</div>;
      }
      return <div key={index}>{line}</div>;
    });
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate(`/decks/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Deck
        </Button>
        
        <div className="font-mono">
          {formatDeckList(deck.cards)}
        </div>
      </div>
    </div>
  );
};

export default PrintDeckList;