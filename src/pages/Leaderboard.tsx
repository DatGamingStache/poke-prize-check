import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for our data structures
type LeaderboardEntry = {
  user_id: string;
  total_games: number;
  total_correct_guesses: number;
  average_accuracy: number;
}

type UserPreference = {
  user_id: string;
  display_name: string;
  profile_picture_url: string | null;
}

type CombinedLeaderboardEntry = LeaderboardEntry & {
  user_preferences?: UserPreference | null;
}

const Leaderboard = () => {
  const navigate = useNavigate();

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // First, get the leaderboard data
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from("leaderboard_view")
        .select("*")
        .order("average_accuracy", { ascending: false })
        .limit(100);

      if (leaderboardError) throw leaderboardError;

      // Then, get all user preferences for the users in the leaderboard
      if (leaderboard && leaderboard.length > 0) {
        const userIds = leaderboard.map(entry => entry.user_id);
        const { data: preferences, error: preferencesError } = await supabase
          .from("user_preferences")
          .select("*")
          .in("user_id", userIds);

        if (preferencesError) throw preferencesError;

        // Combine the data
        return leaderboard.map(entry => ({
          ...entry,
          user_preferences: preferences?.find(p => p.user_id === entry.user_id)
        })) as CombinedLeaderboardEntry[];
      }

      return leaderboard as CombinedLeaderboardEntry[];
    },
  });

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-semibold text-foreground/80">
            Global Leaderboard
          </h1>
        </div>

        <div className="bg-card rounded-lg shadow-md">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">Games</TableHead>
                  <TableHead className="text-right">Correct Guesses</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData?.map((entry, index) => (
                  <TableRow key={entry.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <span>{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={entry.user_preferences?.profile_picture_url || "/placeholder.svg"}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span>{entry.user_preferences?.display_name || "Anonymous"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{entry.total_games}</TableCell>
                    <TableCell className="text-right">
                      {entry.total_correct_guesses}
                    </TableCell>
                    <TableCell className="text-right">
                      {(entry.average_accuracy * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;