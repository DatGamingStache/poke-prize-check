import React from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  display_name: string;
  player_name: string | null;
  player_id: string | null;
  birthdate: string | null;
  division: string | null;
}

const PrintDeckList = () => {
  const { id } = useParams();
  const [deck, setDeck] = React.useState<{ name: string; cards: string } | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch deck data
      const { data: deckData, error: deckError } = await supabase
        .from("decklists")
        .select("name, cards")
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

  const formatCards = (cards: string) => {
    const lines = cards.split('\n');
    const sections: { [key: string]: string[] } = {
      'Pokémon': [],
      'Trainer': [],
      'Energy': [],
    };
    
    let currentSection = '';
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('pokémon') || line.toLowerCase().includes('pokemon')) {
        currentSection = 'Pokémon';
      } else if (line.toLowerCase().includes('trainer')) {
        currentSection = 'Trainer';
      } else if (line.toLowerCase().includes('energy')) {
        currentSection = 'Energy';
      } else if (line.trim() && currentSection) {
        sections[currentSection].push(line.trim());
      }
    });

    return sections;
  };

  if (!deck || !profile) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  const sections = formatCards(deck.cards);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-5 gap-8">
          {/* Left side - Player Info */}
          <div className="col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">Player Information</h2>
            <div className="space-y-2">
              <p><span className="font-semibold">Display Name:</span> {profile.display_name}</p>
              {profile.player_name && (
                <p><span className="font-semibold">Player Name:</span> {profile.player_name}</p>
              )}
              {profile.player_id && (
                <p><span className="font-semibold">Player ID:</span> {profile.player_id}</p>
              )}
              {profile.birthdate && (
                <p><span className="font-semibold">Birthdate:</span> {format(new Date(profile.birthdate), 'PP')}</p>
              )}
              {profile.division && (
                <p><span className="font-semibold">Division:</span> {profile.division}</p>
              )}
              <p><span className="font-semibold">Print Date:</span> {format(new Date(), 'PPpp')}</p>
            </div>
          </div>

          {/* Right side - Decklist */}
          <div className="col-span-3">
            <h1 className="text-3xl font-bold mb-6">{deck.name}</h1>
            
            {/* Pokémon Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-600 mb-2">Pokémon</h2>
              <div className="pl-4 font-mono">
                {sections['Pokémon'].map((card, index) => (
                  <div key={index}>{card}</div>
                ))}
              </div>
            </div>

            {/* Trainer Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-purple-600 mb-2">Trainer</h2>
              <div className="pl-4 font-mono">
                {sections['Trainer'].map((card, index) => (
                  <div key={index}>{card}</div>
                ))}
              </div>
            </div>

            {/* Energy Section */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-green-600 mb-2">Energy</h2>
              <div className="pl-4 font-mono">
                {sections['Energy'].map((card, index) => (
                  <div key={index}>{card}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintDeckList;