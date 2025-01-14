import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PrintDeckList = () => {
  const { id } = useParams();
  const [deck, setDeck] = useState<{ name: string; cards: string } | null>(null);

  useEffect(() => {
    const fetchDeck = async () => {
      const { data } = await supabase
        .from("decklists")
        .select("name, cards")
        .eq("id", id)
        .single();

      if (data) {
        setDeck(data);
        // Automatically open print dialog when the deck data is loaded
        setTimeout(() => {
          window.print();
        }, 500);
      }
    };

    fetchDeck();
  }, [id]);

  if (!deck) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto print:p-0">
      <h1 className="text-2xl font-bold mb-4">{deck.name}</h1>
      <div className="whitespace-pre-line font-mono">
        {deck.cards}
      </div>
    </div>
  );
};

export default PrintDeckList;