
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatsCard from "@/components/stats/StatsCard";

const PriceComparisons = () => {
  const { toast } = useToast();
  const [shopUrl, setShopUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch price comparisons
  const { data: comparisons, isLoading } = useQuery({
    queryKey: ["price-comparisons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_comparisons")
        .select("*")
        .order("price_difference_percentage", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const stats = comparisons?.reduce(
    (acc, card) => {
      if (card.price_difference_percentage < 0) {
        acc.underpriced++;
        acc.totalSavings += Math.abs(
          (card.local_price || 0) - (card.tcgplayer_price || 0)
        );
      } else {
        acc.overpriced++;
      }
      return acc;
    },
    { underpriced: 0, overpriced: 0, totalSavings: 0 }
  );

  // Handle update prices
  const handleUpdatePrices = async () => {
    if (!shopUrl) {
      toast({
        title: "Error",
        description: "Please enter a shop URL",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const response = await supabase.functions.invoke("update-card-prices", {
        body: { shopUrl },
      });

      if (!response.error) {
        toast({
          title: "Success",
          description: "Card prices updated successfully",
        });
      } else {
        throw new Error(response.error.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Price Comparisons</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Underpriced Cards"
          value={stats?.underpriced || 0}
          subtitle="Potential buying opportunities"
        />
        <StatsCard
          title="Overpriced Cards"
          value={stats?.overpriced || 0}
          subtitle="Above market price"
        />
        <StatsCard
          title="Total Potential Savings"
          value={`$${(stats?.totalSavings || 0).toFixed(2)}`}
          subtitle="On underpriced cards"
        />
      </div>

      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Enter shop URL"
          value={shopUrl}
          onChange={(e) => setShopUrl(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleUpdatePrices} disabled={isUpdating}>
          {isUpdating ? "Updating..." : "Update Prices"}
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card Name</TableHead>
              <TableHead>Set</TableHead>
              <TableHead>Local Price</TableHead>
              <TableHead>TCGPlayer Price</TableHead>
              <TableHead>Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisons?.map((card) => (
              <TableRow key={`${card.card_name}-${card.set_name}`}>
                <TableCell>{card.card_name}</TableCell>
                <TableCell>{card.set_name}</TableCell>
                <TableCell>${card.local_price?.toFixed(2)}</TableCell>
                <TableCell>${card.tcgplayer_price?.toFixed(2)}</TableCell>
                <TableCell
                  className={
                    card.price_difference_percentage < 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {card.price_difference_percentage?.toFixed(2)}%
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
