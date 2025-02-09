
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

interface CardState {
  name: string;
  isActive: boolean;
}

interface BinderSet {
  id: string;
  name: string;
  cards: CardState[];
  created_at: string;
}

const BinderSetView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [binderSet, setBinderSet] = useState<BinderSet | null>(null);

  useEffect(() => {
    loadBinderSet();
  }, [id]);

  const loadBinderSet = async () => {
    try {
      const { data, error } = await supabase
        .from('binder_sets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform the data to match our expected types
      const transformedData: BinderSet = {
        id: data.id,
        name: data.name,
        created_at: data.created_at,
        cards: (data.cards as any[]).map((card: any) => ({
          name: card.name,
          isActive: card.isActive
        }))
      };

      setBinderSet(transformedData);
    } catch (error) {
      console.error('Error loading binder set:', error);
      toast({
        title: "Error",
        description: "Failed to load binder set",
        variant: "destructive",
      });
    }
  };

  const toggleCard = async (pageIndex: number, cardIndex: number) => {
    if (!binderSet) return;

    const absoluteIndex = pageIndex * 9 + cardIndex;
    const currentCard = binderSet.cards[absoluteIndex];
    
    // Only allow toggling from inactive to active
    if (currentCard.isActive) {
      return; // Don't allow deactivating cards in view mode
    }

    const updatedCards = [...binderSet.cards];
    updatedCards[absoluteIndex] = {
      ...updatedCards[absoluteIndex],
      isActive: true
    };

    try {
      const { error } = await supabase
        .from('binder_sets')
        .update({ 
          cards: updatedCards.map(card => ({
            name: card.name,
            isActive: card.isActive
          }))
        })
        .eq('id', binderSet.id);

      if (error) throw error;

      setBinderSet({
        ...binderSet,
        cards: updatedCards
      });

      toast({
        title: "Success",
        description: "Card marked as found",
      });
    } catch (error) {
      console.error('Error updating card:', error);
      toast({
        title: "Error",
        description: "Failed to update card status",
        variant: "destructive",
      });
    }
  };

  const renderGrid = () => {
    if (!binderSet?.cards) return null;

    const grids = [];
    const cardsPerGrid = 9; // 3x3 grid

    for (let i = 0; i < binderSet.cards.length; i += cardsPerGrid) {
      const pageNumber = Math.floor(i / cardsPerGrid);
      const currentPageCards = binderSet.cards.slice(i, i + cardsPerGrid);
      
      grids.push(
        <div key={pageNumber} className="space-y-2 mb-8">
          <h2 className="text-lg font-semibold text-center">Page {pageNumber + 1}</h2>
          <div className="grid grid-cols-3 gap-2 max-w-[400px] mx-auto">
            {currentPageCards.map((card, index) => {
              const absoluteIndex = i + index + 1;
              const slotNumber = (index % 9) + 1;
              return (
                <div 
                  key={index}
                  onClick={() => toggleCard(pageNumber, index)}
                  className={`
                    aspect-[2.5/3.5] 
                    ${card.isActive ? 'bg-green-200' : 'bg-muted'} 
                    rounded-lg 
                    overflow-hidden 
                    flex 
                    items-center 
                    justify-center 
                    p-1 
                    h-24
                    cursor-pointer
                    transition-colors
                    hover:opacity-80
                  `}
                >
                  <p className="text-xs font-semibold text-muted-foreground text-center">
                    {`Slot ${slotNumber} (${absoluteIndex})`}<br/>
                    {card.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return grids;
  };

  if (!binderSet) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{binderSet.name}</h1>
        <Button onClick={() => navigate('/binder-helper')}>Back to List</Button>
      </div>

      <div className="space-y-8">
        {renderGrid()}
      </div>
    </div>
  );
};

export default BinderSetView;
