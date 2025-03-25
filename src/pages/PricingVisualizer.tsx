
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { FileText, ArrowDownAZ, ArrowUpZA, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface PriceItem {
  id: number;
  name: string;
  lowestprice: number;
  tcgplayer_market_price: number;
  price_difference: number;
  percentage_difference: number;
  minus_whatnot_fees: number;
}

const PricingVisualizer = () => {
  const [priceData, setPriceData] = useState<PriceItem[]>([]);
  const [sortField, setSortField] = useState<keyof PriceItem>("percentage_difference");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Check if the data is in the expected format (array of objects with required fields)
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          setPriceData(jsonData);
          toast({
            title: "File loaded successfully",
            description: `Loaded ${jsonData.length} items`,
          });
        } else {
          toast({
            title: "Invalid data format",
            description: "The uploaded file doesn't contain valid price data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        toast({
          title: "Error parsing file",
          description: "Please upload a valid JSON file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleSort = (field: keyof PriceItem) => {
    if (field === sortField) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, set it and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedData = useMemo(() => {
    // First filter by search query
    const filtered = priceData.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then sort
    return [...filtered].sort((a, b) => {
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      // Handle numeric values (most fields)
      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
      
      // Handle string values (like name)
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === "asc" 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      return 0;
    });
  }, [priceData, sortField, sortDirection, searchQuery]);

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pricing Visualizer</span>
            <Button variant="outline" className="gap-2">
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload JSON
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={sortField}
                  onValueChange={(value) => setSortField(value as keyof PriceItem)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="lowestprice">Lowest Price</SelectItem>
                    <SelectItem value="tcgplayer_market_price">TCG Price</SelectItem>
                    <SelectItem value="price_difference">Price Difference</SelectItem>
                    <SelectItem value="percentage_difference">% Difference</SelectItem>
                    <SelectItem value="minus_whatnot_fees">After Fees</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  {sortDirection === "asc" ? <ArrowUpZA /> : <ArrowDownAZ />}
                </Button>
              </div>
            </div>

            {filteredAndSortedData.length > 0 ? (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("name")}
                      >
                        Name {sortField === "name" && (
                          sortDirection === "asc" ? "↑" : "↓"
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("lowestprice")}
                      >
                        Lowest Price {sortField === "lowestprice" && (
                          sortDirection === "asc" ? "↑" : "↓"
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("tcgplayer_market_price")}
                      >
                        TCG Market {sortField === "tcgplayer_market_price" && (
                          sortDirection === "asc" ? "↑" : "↓"
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("price_difference")}
                      >
                        Difference {sortField === "price_difference" && (
                          sortDirection === "asc" ? "↑" : "↓"
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("percentage_difference")}
                      >
                        % Diff {sortField === "percentage_difference" && (
                          sortDirection === "asc" ? "↑" : "↓"
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort("minus_whatnot_fees")}
                      >
                        After Fees {sortField === "minus_whatnot_fees" && (
                          sortDirection === "asc" ? "↑" : "↓"
                        )}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.lowestprice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.tcgplayer_market_price)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price_difference)}</TableCell>
                        <TableCell className="text-right">{formatPercentage(item.percentage_difference)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.minus_whatnot_fees)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                {priceData.length === 0 ? (
                  <p>Upload a JSON file to visualize pricing data</p>
                ) : (
                  <p>No results match your search criteria</p>
                )}
              </div>
            )}

            {priceData.length > 0 && (
              <div className="text-sm text-muted-foreground text-right">
                Showing {filteredAndSortedData.length} of {priceData.length} items
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingVisualizer;
