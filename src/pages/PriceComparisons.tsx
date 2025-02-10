import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Home, Upload, ArrowUpDown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface CardData {
  id: number;
  name: string;
  lowestPrice: number;
  setName: string;
  customAttributes: {
    cardType: string[];
    cardTypeB?: string;
    hp?: string;
    [key: string]: any;
  };
}

interface PriceData {
  card_name: string;
  set_name?: string;
  collector_number?: string;
  local_price: number;
  price_date?: string;
  price_change?: number;
  price_change_percentage?: number;
  status?: 'new' | 'increased' | 'decreased' | 'unchanged';
}

type SortField = 'price' | 'name' | 'date' | 'change';
type SortOrder = 'asc' | 'desc';

const PriceComparisons = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('change');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data: prices, isLoading, refetch } = useQuery({
    queryKey: ["price-comparisons", selectedSet, sortField, sortOrder],
    queryFn: async () => {
      let query = supabase
        .from("price_comparisons")
        .select("*");

      if (selectedSet) {
        query = query.eq("set_name", selectedSet);
      }

      switch (sortField) {
        case 'price':
          query = query.order('local_price', { ascending: sortOrder === 'asc' });
          break;
        case 'name':
          query = query.order('card_name', { ascending: sortOrder === 'asc' });
          break;
        case 'date':
          query = query.order('price_date', { ascending: sortOrder === 'asc' });
          break;
        case 'change':
          query = query.order('price_change_percentage', { ascending: sortOrder === 'asc', nullsFirst: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });

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

  const stats = {
    totalCards: prices?.length || 0,
    averagePrice: prices?.reduce((acc, card) => acc + (card.local_price || 0), 0) / (prices?.length || 1) || 0,
    biggestChange: prices?.reduce((max, card) => {
      const change = card.price_change_percentage || 0;
      return Math.abs(change) > Math.abs(max) ? change : max;
    }, 0) || 0
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

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
            throw new Error('File must contain an array of card data');
          }

          const validatedData = content.map((item: CardData): PriceData => {
            if (!item.name || typeof item.name !== 'string') {
              throw new Error('Each item must have a valid name');
            }
            if (typeof item.lowestPrice !== 'number') {
              throw new Error('Each item must have a valid lowestPrice');
            }

            return {
              card_name: item.name,
              set_name: item.setName || null,
              collector_number: null,
              local_price: item.lowestPrice,
              price_date: new Date().toISOString(),
            };
          });

          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          if (!user) throw new Error('You must be logged in to upload files');

          const fileName = `${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('price_data')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { error: recordError } = await supabase
            .from('price_data_uploads')
            .insert({
              filename: file.name,
              status: 'processing',
              user_id: user.id,
            });

          if (recordError) throw recordError;

          const { error: insertError } = await supabase
            .from('static_card_prices')
            .insert(validatedData.map(item => ({
              card_name: item.card_name,
              set_name: item.set_name,
              collector_number: null,
              normal_price: item.local_price,
              price_date: item.price_date,
            })));

          if (insertError) throw insertError;

          toast({
            title: "Success",
            description: `Successfully processed ${validatedData.length} cards`,
          });
          
          refetch();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
          console.error('Upload error:', error);
        }
      };

      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      console.error('File reading error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const chartData = prices?.map(price => ({
    date: new Date(price.price_date).toLocaleDateString(),
    price: price.local_price,
    name: price.card_name,
  })) || [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50';
      case 'increased':
        return 'bg-red-50';
      case 'decreased':
        return 'bg-green-50';
      default:
        return '';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      default:
        return null;
    }
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
          title="Biggest Price Change"
          value={`${stats.biggestChange.toFixed(2)}%`}
          subtitle="24h change"
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Card Name {sortField === 'name' && <ArrowUpDown className="inline h-4 w-4" />}
              </TableHead>
              <TableHead>Set</TableHead>
              <TableHead>Number</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('price')}>
                Price {sortField === 'price' && <ArrowUpDown className="inline h-4 w-4" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('change')}>
                24h Change {sortField === 'change' && <ArrowUpDown className="inline h-4 w-4" />}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('date')}>
                Last Updated {sortField === 'date' && <ArrowUpDown className="inline h-4 w-4" />}
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices?.map((card) => (
              <TableRow 
                key={`${card.card_name}-${card.set_name}-${card.collector_number}`}
                className={getStatusColor(card.status)}
              >
                <TableCell>{card.card_name}</TableCell>
                <TableCell>{card.set_name}</TableCell>
                <TableCell>{card.collector_number}</TableCell>
                <TableCell>${card.local_price?.toFixed(2)}</TableCell>
                <TableCell className={
                  card.price_change_percentage > 0 ? 'text-red-600' :
                  card.price_change_percentage < 0 ? 'text-green-600' : ''
                }>
                  {card.price_change_percentage ? 
                    `${card.price_change_percentage > 0 ? '+' : ''}${card.price_change_percentage.toFixed(2)}%` : 
                    '-'}
                </TableCell>
                <TableCell>
                  {new Date(card.price_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {getStatusBadge(card.status)}
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
