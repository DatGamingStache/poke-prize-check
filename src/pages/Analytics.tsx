import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";
import { Activity, TrendingUp, Database } from "lucide-react";

const Analytics = () => {
  // Fetch game session analytics
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

  // Calculate average accuracy properly
  const averageAccuracy = React.useMemo(() => {
    if (!sessionData?.length) return 0;
    const totalCorrect = sessionData.reduce((acc, curr) => acc + curr.correct_guesses, 0);
    const totalPrizes = sessionData.reduce((acc, curr) => acc + curr.total_prizes, 0);
    return totalPrizes > 0 ? (totalCorrect / totalPrizes) * 100 : 0;
  }, [sessionData]);

  // Process data for accuracy over time chart with proper date formatting
  const accuracyData = React.useMemo(() => {
    if (!sessionData) return [];
    return sessionData.map((session) => ({
      date: new Date(session.created_at).toLocaleDateString(),
      accuracy: (session.correct_guesses / session.total_prizes) * 100,
    }));
  }, [sessionData]);

  // Process data for card success rate chart with proper calculations
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
      .sort((a, b) => b.successRate - a.successRate) // Sort by success rate descending
      .slice(0, 10); // Show only top 10 cards
  }, [cardData]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <Activity className="h-8 w-8 text-primary" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isSessionLoading ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <ChartContainer
                className="h-[300px]"
                config={{
                  accuracy: {
                    theme: {
                      light: "hsl(var(--primary))",
                      dark: "hsl(var(--primary))",
                    },
                  },
                }}
              >
                <LineChart data={accuracyData}>
                  <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
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
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Card Success Rates</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isCardLoading ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <ChartContainer
                className="h-[300px]"
                config={{
                  successRate: {
                    theme: {
                      light: "hsl(var(--primary))",
                      dark: "hsl(var(--primary))",
                    },
                  },
                }}
              >
                <BarChart data={cardSuccessData} layout="vertical">
                  <XAxis 
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    type="category"
                    dataKey="card"
                    width={150}
                  />
                  <ChartTooltip />
                  <Bar
                    dataKey="successRate"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;