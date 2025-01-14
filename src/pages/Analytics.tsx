import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { ChartLine, ChartBar } from "lucide-react";

interface GameSessionAnalytics {
  created_at: string;
  accuracy: number;
  deck_name: string;
  time_spent: number;
}

interface CardGuessAnalytics {
  deck_name: string;
  correct_guess: boolean;
  guessed_card: string;
}

const Analytics = () => {
  const { data: sessionData, isLoading: isSessionLoading } = useQuery({
    queryKey: ["gameSessionAnalytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("game_session_analytics")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as GameSessionAnalytics[];
    },
  });

  const { data: cardData, isLoading: isCardLoading } = useQuery({
    queryKey: ["cardGuessAnalytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("card_guess_analytics")
        .select("*");

      if (error) throw error;
      return data as CardGuessAnalytics[];
    },
  });

  const accuracyData = sessionData?.map((session) => ({
    date: format(new Date(session.created_at), "MMM d"),
    accuracy: Math.round(session.accuracy),
    deck: session.deck_name,
  }));

  const cardSuccessRate = cardData?.reduce((acc: Record<string, { total: number; correct: number }>, curr) => {
    if (!acc[curr.guessed_card]) {
      acc[curr.guessed_card] = { total: 0, correct: 0 };
    }
    acc[curr.guessed_card].total += 1;
    if (curr.correct_guess) {
      acc[curr.guessed_card].correct += 1;
    }
    return acc;
  }, {});

  const cardSuccessData = Object.entries(cardSuccessRate || {}).map(([card, stats]) => ({
    card,
    successRate: Math.round((stats.correct / stats.total) * 100),
  }));

  if (isSessionLoading || isCardLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <ChartLine className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Accuracy Over Time</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ fill: "#2563eb" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <ChartBar className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Card Success Rates</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cardSuccessData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="card" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="successRate" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;