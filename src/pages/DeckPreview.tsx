import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface DeckPreviewProps {
  id: string;
  name: string;
  cards: string;
}

const DeckPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const deck = location.state as DeckPreviewProps | null;

  useEffect(() => {
    if (!deck) {
      toast({
        title: "Error",
        description: "No deck data found. Redirecting to decks page.",
        variant: "destructive",
      });
      navigate("/decks");
    }
  }, [deck, navigate, toast]);

  const { data: deckStats } = useQuery({
    queryKey: ["deckStats", deck?.id],
    queryFn: async () => {
      if (!deck?.id) return [];
      const { data } = await supabase
        .from("game_session_analytics")
        .select("*")
        .eq("deck_id", deck.id)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!deck?.id,
  });

  const { data: cardStats } = useQuery({
    queryKey: ["cardStats", deck?.id],
    queryFn: async () => {
      if (!deck?.id) return [];
      const { data } = await supabase
        .from("card_guess_analytics")
        .select("*")
        .eq("decklist_id", deck.id);

      if (!data) return [];

      const cardSuccessRates = data.reduce((acc: any, curr) => {
        if (!acc[curr.actual_card!]) {
          acc[curr.actual_card!] = { correct: 0, total: 0 };
        }
        acc[curr.actual_card!].total++;
        if (curr.correct_guess) {
          acc[curr.actual_card!].correct++;
        }
        return acc;
      }, {});

      return Object.entries(cardSuccessRates)
        .map(([card, stats]: [string, any]) => ({
          card,
          successRate: (stats.correct / stats.total) * 100,
        }))
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 10);
    },
    enabled: !!deck?.id,
  });

  if (!deck) {
    return null;
  }

  const handlePlay = () => {
    navigate("/game", {
      state: {
        decklist: deck.cards,
        deckId: deck.id,
      },
    });
  };

  const handlePrint = () => {
    navigate(`/decks/${deck.id}/print`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/decks")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-semibold text-foreground/80">
              {deck.name}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={handlePlay}>
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Deck List</h2>
            <ScrollArea className="h-[400px]">
              {deck.cards.split("\n").map((card, index) => (
                <div
                  key={index}
                  className="py-2 border-b last:border-b-0 border-border/50"
                >
                  {card}
                </div>
              ))}
            </ScrollArea>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Accuracy Over Time</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={deckStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="created_at"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`]}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--primary))"
                      dot
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Card Success Rates</h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cardStats}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="card"
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`]}
                    />
                    <Bar
                      dataKey="successRate"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckPreview;