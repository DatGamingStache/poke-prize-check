import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, Award } from "lucide-react";

const GameDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: gameSession, isLoading } = useQuery({
    queryKey: ['gameSession', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          *,
          decklist:decklist_id (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!gameSession) {
    return <div className="container mx-auto p-6">Game session not found</div>;
  }

  const minutes = Math.floor((gameSession.time_spent / 1000) / 60);
  const seconds = Math.floor((gameSession.time_spent / 1000) % 60);
  const accuracy = (gameSession.correct_guesses / gameSession.total_prizes) * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/history")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Game Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Calendar className="h-5 w-5" />
            {new Date(gameSession.created_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time: {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Accuracy: {accuracy.toFixed(1)}%
          </div>
          <div>
            Deck: {gameSession.decklist?.name || "Unknown Deck"}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Score</h3>
          <div className="text-3xl font-bold">
            {gameSession.correct_guesses} / {gameSession.total_prizes}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Your Guesses</h3>
          <div className="space-y-2">
            {gameSession.guessed_cards.map((card: string, index: number) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  gameSession.actual_prizes.includes(card)
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {card}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Actual Prizes</h3>
          <div className="space-y-2">
            {gameSession.actual_prizes.map((card: string, index: number) => (
              <div key={index} className="p-2 rounded bg-gray-100">
                {card}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GameDetails;