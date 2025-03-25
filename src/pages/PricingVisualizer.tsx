
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { FileText, ArrowDownAZ, ArrowUpZA, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PriceItem {
  id: number;
  name: string;
  lowestprice: number;
  tcgplayer_market_price: number;
  price_difference: number;
  percentage_difference: number;
  minus_whatnot_fees: number;
}

interface UploadItem {
  id: string;
  filename: string;
  created_at: string;
  status: string;
  processed_count: number;
}

const PricingVisualizer = () => {
  const [priceData, setPriceData] = useState<PriceItem[]>([]);
  const [sortField, setSortField] = useState<keyof PriceItem>("percentage_difference");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadsDialog, setShowUploadsDialog] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch uploads when dialog opens
  useEffect(() => {
    if (showUploadsDialog) {
      fetchUploads();
    }
  }, [showUploadsDialog]);

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from("price_data_uploads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploads(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching uploads",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Check if the data is in the expected format
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // First save to database
          const { data: { user } } = await supabase.auth.getUser();
          
          // Create an upload record
          const { data: uploadData, error: uploadError } = await supabase
            .from("price_data_uploads")
            .insert({
              filename: file.name,
              status: 'completed',
              processed_count: jsonData.length,
              user_id: user?.id
            })
            .select()
            .single();

          if (uploadError) throw uploadError;
          
          // Save price items to local state
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
        console.error("Error processing JSON:", error);
        toast({
          title: "Error parsing file",
          description: "Please upload a valid JSON file",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteUpload = async () => {
    if (!selectedUploadId) return;
    
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("price_data_uploads")
        .delete()
        .eq("id", selectedUploadId);

      if (error) throw error;
      
      toast({
        title: "Upload deleted",
        description: "The upload has been removed successfully",
      });
      
      // Refresh uploads list
      fetchUploads();
    } catch (error: any) {
      toast({
        title: "Error deleting upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setSelectedUploadId(null);
    }
  };

  const loadUpload = async (uploadId: string) => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would fetch the price data associated with this upload
      // For now we'll just show a message
      toast({
        title: "Upload loaded",
        description: "This feature is not fully implemented yet",
      });
      
      setShowUploadsDialog(false);
    } catch (error: any) {
      toast({
        title: "Error loading upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Ensure we're comparing the same types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string comparison (like for name field)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Default return if types don't match (shouldn't happen with proper typing)
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
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowUploadsDialog(true)}
              >
                Manage Uploads
              </Button>
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
                  disabled={isLoading}
                />
              </Button>
            </div>
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

      {/* Uploads Management Dialog */}
      <Dialog open={showUploadsDialog} onOpenChange={setShowUploadsDialog}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>Manage Uploads</DialogTitle>
            <DialogDescription>
              View and manage your previously uploaded price data files.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[400px] overflow-y-auto">
            {uploads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>{upload.filename}</TableCell>
                      <TableCell>{new Date(upload.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{upload.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => loadUpload(upload.id)}
                          >
                            Load
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUploadId(upload.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-4 text-muted-foreground">
                No uploads found
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Upload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this upload? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false);
              setSelectedUploadId(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUpload}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PricingVisualizer;
