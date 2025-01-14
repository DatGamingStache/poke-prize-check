import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

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
  const [filteredSessions, setFilteredSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDeck, setSearchDeck] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
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
        setFilteredSessions(data || []);
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

  useEffect(() => {
    let filtered = [...sessions];

    // Filter by deck name
    if (searchDeck) {
      filtered = filtered.filter(session => 
        session.decklist?.name.toLowerCase().includes(searchDeck.toLowerCase())
      );
    }

    // Filter by minimum score
    if (minScore) {
      const scoreValue = parseInt(minScore);
      if (!isNaN(scoreValue)) {
        filtered = filtered.filter(session => 
          (session.correct_guesses / session.total_prizes) * 100 >= scoreValue
        );
      }
    }

    // Filter by maximum time
    if (maxTime) {
      const timeValue = parseInt(maxTime);
      if (!isNaN(timeValue)) {
        filtered = filtered.filter(session => 
          session.time_spent <= timeValue * 1000 * 60
        );
      }
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate.toDateString() === selectedDate.toDateString();
      });
    }

    setFilteredSessions(filtered);
  }, [sessions, searchDeck, minScore, maxTime, selectedDate]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/decks")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Game History</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Deck Name</label>
          <Input
            placeholder="Search deck..."
            value={searchDeck}
            onChange={(e) => setSearchDeck(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Min Score (%)</label>
          <Input
            type="number"
            placeholder="Minimum score..."
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            min="0"
            max="100"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Max Time (minutes)</label>
          <Input
            type="number"
            placeholder="Maximum time..."
            value={maxTime}
            onChange={(e) => setMaxTime(e.target.value)}
            min="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {selectedDate ? (
                  format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        <div className="text-center text-gray-500">
          No matching game sessions found.
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
              {filteredSessions.map((session) => (
                <TableRow 
                  key={session.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => navigate(`/history/${session.id}`)}
                >
                  <TableCell>
                    {new Date(session.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{session.decklist?.name || "Unknown Deck"}</TableCell>
                  <TableCell>
                    {session.correct_guesses} / {session.total_prizes}
                  </TableCell>
                  <TableCell>
                    {Math.floor((session.time_spent / 1000) / 60)}:
                    {Math.floor((session.time_spent / 1000) % 60).toString().padStart(2, '0')}
                  </TableCell>
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