
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

  // Fetch price data
  const { data: prices, isLoading } = useQuery({
    queryKey: ["price-comparisons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_comparisons")
        .select("*")
        .order("price_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate statistics
  const stats = {
    totalCards: prices?.length || 0,
    averagePrice: prices?.reduce((acc, card) => acc + (card.local_price || 0), 0) / (prices?.length || 1) || 0,
    lastUpdate: prices?.[0]?.price_date ? new Date(prices[0].price_date).toLocaleDateString() : 'Never'
  };

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
      <h1 className="text-3xl font-bold mb-8">Local Shop Prices</h1>

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
              <TableHead>Price</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices?.map((card) => (
              <TableRow key={`${card.card_name}-${card.set_name}`}>
                <TableCell>{card.card_name}</TableCell>
                <TableCell>{card.set_name}</TableCell>
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
