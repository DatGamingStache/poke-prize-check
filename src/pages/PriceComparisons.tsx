
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Home, Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Define the expected structure of price data
interface PriceData {
  card_name: string;
  set_name?: string;
  collector_number?: string;
  local_price: number;
  price_date?: string;
}

const PriceComparisons = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch price data
  const { data: prices, isLoading, refetch } = useQuery({
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

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = JSON.parse(e.target?.result as string);
          if (!Array.isArray(content)) {
            throw new Error('File must contain an array of price data');
          }

          // Validate the data structure
          const validatedData = content.map((item: any): PriceData => {
            if (!item.card_name || typeof item.card_name !== 'string') {
              throw new Error('Each item must have a valid card_name');
            }
            if (!item.local_price || typeof item.local_price !== 'number') {
              throw new Error('Each item must have a valid local_price');
            }
            return {
              card_name: item.card_name,
              set_name: item.set_name || null,
              collector_number: item.collector_number || null,
              local_price: item.local_price,
              price_date: item.price_date || new Date().toISOString(),
            };
          });

          // Get the current user
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!user) throw new Error('You must be logged in to upload files');

          // Upload file to storage
          const fileName = `${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('price_data')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Create upload record
          const { error: recordError } = await supabase
            .from('price_data_uploads')
            .insert({
              filename: file.name,
              status: 'processing',
              user_id: user.id,
            });

          if (recordError) throw recordError;

          // Process and insert price data
          const { error: insertError } = await supabase
            .from('static_card_prices')
            .insert(validatedData.map(item => ({
              card_name: item.card_name,
              set_name: item.set_name,
              collector_number: item.collector_number,
              normal_price: item.local_price,
              price_date: item.price_date,
            })));

          if (insertError) throw insertError;

          toast({
            title: "Success",
            description: "Price data uploaded successfully",
          });
          
          refetch();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
      };

      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Prepare chart data
  const chartData = prices?.map(price => ({
    date: new Date(price.price_date).toLocaleDateString(),
    price: price.local_price,
    name: price.card_name,
  })) || [];

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

        <div className="flex-1 flex justify-end">
          <Input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="price-data-upload"
          />
          <Button
            onClick={() => document.getElementById("price-data-upload")?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Price Data"}
          </Button>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-8 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
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
