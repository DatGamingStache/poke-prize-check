import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Tooltip 
} from "recharts";
import { Activity, TrendingUp, Database, ArrowLeft, GameController } from "lucide-react";

const Analytics = () => {
  const navigate = useNavigate();
  
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ["gameSessionAnalytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_session_analytics")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch card guess analytics
  const { data: cardData, isLoading: isCardLoading } = useQuery({
    queryKey: ["cardGuessAnalytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_guess_analytics")
        .select("*")
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Calculate games played per deck
  const gamesPerDeck = React.useMemo(() => {
    if (!sessionData) return [];
    
    const deckCounts = sessionData.reduce((acc: { [key: string]: number }, session) => {
      if (!session.deck_name || !session.deck_id) return acc;
      const key = session.deck_name;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(deckCounts)
      .map(([deck, count]) => ({
        deck,
        games: count
      }))
      .sort((a, b) => b.games - a.games);
  }, [sessionData]);

  // Calculate average accuracy
  const averageAccuracy = React.useMemo(() => {
    if (!sessionData?.length) return 0;
    const totalCorrect = sessionData.reduce((acc, curr) => acc + curr.correct_guesses, 0);
    const totalPrizes = sessionData.reduce((acc, curr) => acc + curr.total_prizes, 0);
    return totalPrizes > 0 ? (totalCorrect / totalPrizes) * 100 : 0;
  }, [sessionData]);

  // Process data for accuracy over time chart
  const accuracyData = React.useMemo(() => {
    if (!sessionData) return [];
    return sessionData.map((session) => ({
      date: new Date(session.created_at).toLocaleDateString(),
      accuracy: (session.correct_guesses / session.total_prizes) * 100,
    }));
  }, [sessionData]);

  // Process data for card success rate chart
  const cardSuccessData = React.useMemo(() => {
    if (!cardData) return [];
    
    const cardStats = cardData.reduce((acc: Record<string, { total: number; correct: number }>, curr) => {
      if (!curr.actual_card) return acc;
      
      if (!acc[curr.actual_card]) {
        acc[curr.actual_card] = { total: 0, correct: 0 };
      }
      acc[curr.actual_card].total += 1;
      if (curr.correct_guess) {
        acc[curr.actual_card].correct += 1;
      }
      return acc;
    }, {});

    return Object.entries(cardStats)
      .map(([card, stats]) => ({
        card,
        successRate: (stats.correct / stats.total) * 100,
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 10);
  }, [cardData]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button 
          variant="outline" 
          className="w-fit"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <Activity className="h-6 w-6 md:h-8 md:w-8 text-primary" />
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Games Played</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionData?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageAccuracy.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cards Guessed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardData?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Games Played per Deck</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {isSessionLoading ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={gamesPerDeck} 
                  layout="vertical"
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    type="category"
                    dataKey="deck"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip />
                  <Bar
                    dataKey="games"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Accuracy Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {isSessionLoading ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData} margin={{ top: 5, right: 20, bottom: 40, left: 0 }}>
                  <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="w-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Card Success Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            {isCardLoading ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={cardSuccessData} 
                  layout="vertical"
                  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                >
                  <XAxis 
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    type="category"
                    dataKey="card"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip />
                  <Bar
                    dataKey="successRate"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;