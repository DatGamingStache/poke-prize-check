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

  // Process data for accuracy over time chart
  const accuracyData = sessionData?.map((session) => ({
    date: new Date(session.created_at).toLocaleDateString(),
    accuracy: session.accuracy * 100,
  }));

  // Process data for card success rate chart
  const cardSuccessData = React.useMemo(() => {
    if (!cardData) return [];
    
    const cardStats = cardData.reduce((acc: any, curr) => {
      if (!acc[curr.actual_card]) {
        acc[curr.actual_card] = { total: 0, correct: 0 };
      }
      acc[curr.actual_card].total += 1;
      if (curr.correct_guess) {
        acc[curr.actual_card].correct += 1;
      }
      return acc;
    }, {});

    return Object.entries(cardStats).map(([card, stats]: [string, any]) => ({
      card,
      successRate: (stats.correct / stats.total) * 100,
    }));
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
              {sessionData
                ? `${(
                    sessionData.reduce((acc, curr) => acc + curr.accuracy, 0) /
                    sessionData.length *
                    100
                  ).toFixed(1)}%`
                : "0%"}
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
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Success Rates</CardTitle>
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
                <BarChart data={cardSuccessData}>
                  <XAxis dataKey="card" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar
                    dataKey="successRate"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
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