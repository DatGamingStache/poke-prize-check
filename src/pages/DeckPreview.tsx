import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/stats/StatsCard";
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

interface DeckPreviewProps {
  id: string;
  name: string;
  cards: string;
}

interface CardSuccessRate {
  card: string;
  successRate: number;
}

interface CardStats {
  successRates: CardSuccessRate[];
  totalCardsGuessed: number;
}

interface CardSuccessRateStats {
  correct: number;
  total: number;
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

  const { data: cardStats } = useQuery<CardStats>({
    queryKey: ["cardStats", deck?.id],
    queryFn: async (): Promise<CardStats> => {
      if (!deck?.id) return { successRates: [], totalCardsGuessed: 0 };
      const { data } = await supabase
        .from("card_guess_analytics")
        .select("*")
        .eq("decklist_id", deck.id);

      if (!data) return { successRates: [], totalCardsGuessed: 0 };

      const cardSuccessRates = data.reduce<Record<string, CardSuccessRateStats>>((acc, curr) => {
        if (!curr.actual_card) return acc;
        if (!acc[curr.actual_card]) {
          acc[curr.actual_card] = { correct: 0, total: 0 };
        }
        acc[curr.actual_card].total++;
        if (curr.correct_guess) {
          acc[curr.actual_card].correct++;
        }
        return acc;
      }, {});

      const totalCardsGuessed = Object.values(cardSuccessRates).reduce(
        (sum, stats) => sum + stats.total,
        0
      );

      const successRates = Object.entries(cardSuccessRates)
        .map(([card, stats]) => ({
          card,
          successRate: (stats.correct / stats.total) * 100,
        }))
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 10);

      return {
        successRates,
        totalCardsGuessed,
      };
    },
    enabled: !!deck?.id,
  });

  if (!deck) return null;

  const totalGames = deckStats?.length || 0;
  const averageAccuracy = deckStats?.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / totalGames || 0;
  const totalCardsGuessed = cardStats?.totalCardsGuessed || 0;

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
              <span className="hidden md:inline">{deck.name}</span>
              <span className="md:hidden">
                {deck.name.length > 12 ? `${deck.name.slice(0, 12)}...` : deck.name}
              </span>
            </h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            <Button onClick={handlePlay} size="icon">
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* First Row: Decklist and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Deck List</h2>
              <ScrollArea className="h-[300px]">
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
          </div>
          <div className="grid grid-cols-1 gap-4">
            <StatsCard
              title="Total Games Played"
              value={totalGames}
            />
            <StatsCard
              title="Average Accuracy"
              value={`${averageAccuracy.toFixed(1)}%`}
            />
            <StatsCard
              title="Total Cards Guessed"
              value={totalCardsGuessed}
            />
          </div>
        </div>

        {/* Second Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Accuracy Over Time</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deckStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="created_at"
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
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
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
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
                <BarChart data={cardStats?.successRates} layout="vertical" margin={{ left: 100 }}>
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
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`]} />
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
  );
};

export default DeckPreview;