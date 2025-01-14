import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DeckBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deck, setDeck] = useState<{ name: string; cards: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const { data, error } = await supabase
          .from("decklists")
          .select("name, cards")
          .eq("id", id)
          .single();

        if (error) throw error;

        setDeck(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load deck",
          variant: "destructive",
        });
        navigate("/decks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeck();
  }, [id, navigate, toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{deck.name}</h1>
      <div className="whitespace-pre-line font-mono">
        {deck.cards}
      </div>
    </div>
  );
};

export default DeckBuilder;