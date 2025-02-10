
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatsCard from "@/components/stats/StatsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PriceComparisons = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  // Fetch price data
  const { data: prices, isLoading } = useQuery({
    queryKey: ["price-comparisons", selectedSet],
    queryFn: async () => {
      let query = supabase
        .from("price_comparisons")
        .select("*")
        .order("price_date", { ascending: false });

      if (selectedSet) {
        query = query.eq("set_name", selectedSet);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

  // Fetch unique set names
  const { data: sets } = useQuery({
    queryKey: ["card-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("static_card_prices")
        .select("set_name")
        .eq("set_name", "set_name")
        .order("set_name");

      if (error) throw error;
      const uniqueSets = [...new Set(data.map(row => row.set_name))];
      return uniqueSets.filter(set => set !== null);
    },
  });

  // Calculate statistics
  const stats = {
    totalCards: prices?.length || 0,
    averagePrice: prices?.reduce((acc, card) => acc + (card.local_price || 0), 0) / (prices?.length || 1) || 0,
    lastUpdate: prices?.[0]?.price_date ? new Date(prices[0].price_date).toLocaleDateString() : 'Never'
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Card Price Reference</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/decks")}
          className="gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total Cards"
          value={stats.totalCards}
          subtitle="Cards tracked"
        />
        <StatsCard
          title="Average Price"
          value={`$${stats.averagePrice.toFixed(2)}`}
          subtitle="Per card"
        />
        <StatsCard
          title="Last Update"
          value={stats.lastUpdate}
          subtitle="Price check"
        />
      </div>

      <div className="flex gap-4 mb-8">
        <Select 
          value={selectedSet || "all"} 
          onValueChange={(value) => setSelectedSet(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter by set" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sets</SelectItem>
            {sets?.map((set) => (
              <SelectItem key={set} value={set || "unknown"}>
                {set || "Unknown Set"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card Name</TableHead>
              <TableHead>Set</TableHead>
              <TableHead>Number</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices?.map((card) => (
              <TableRow key={`${card.card_name}-${card.set_name}-${card.collector_number}`}>
                <TableCell>{card.card_name}</TableCell>
                <TableCell>{card.set_name}</TableCell>
                <TableCell>{card.collector_number}</TableCell>
                <TableCell>${card.local_price?.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(card.price_date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default PriceComparisons;
