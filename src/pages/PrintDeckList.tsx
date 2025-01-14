import React from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PrintDeckList = () => {
  const { id } = useParams();
  const [deck, setDeck] = React.useState<{ name: string; cards: string } | null>(null);

  React.useEffect(() => {
    const fetchDeck = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("decklists")
        .select("name, cards")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching deck:", error);
        return;
      }

      setDeck(data);
    };

    fetchDeck();
  }, [id]);

  if (!deck) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{deck.name}</h1>
        <div className="whitespace-pre-line font-mono">
          {deck.cards}
        </div>
      </div>
    </div>
  );
};

export default PrintDeckList;