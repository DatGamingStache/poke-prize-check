import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GameSession {
  id: string;
  correct_guesses: number;
  total_prizes: number;
  time_spent: number;
  created_at: string;
  decklist: {
    name: string;
  };
}

const History = () => {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("game_sessions")
          .select(`
            *,
            decklist:decklist_id (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setSessions(data || []);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        toast({
          title: "Error",
          description: "Failed to load game history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Game History</h1>
      
      {sessions.length === 0 ? (
        <div className="text-center text-gray-500">
          No game sessions found. Try playing a game first!
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Deck</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {new Date(session.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{session.decklist?.name || "Unknown Deck"}</TableCell>
                  <TableCell>
                    {session.correct_guesses} / {session.total_prizes}
                  </TableCell>
                  <TableCell>{Math.round(session.time_spent / 1000)}s</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default History;