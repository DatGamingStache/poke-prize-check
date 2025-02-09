
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Json } from "@/integrations/supabase/types";

interface BinderSet {
  id: string;
  name: string;
  cards: Json;
  created_at: string;
}

const BinderSetList = () => {
  const [binderSets, setBinderSets] = useState<BinderSet[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadBinderSets();
  }, []);

  const loadBinderSets = async () => {
    try {
      const { data, error } = await supabase
        .from('binder_sets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBinderSets(data || []);
    } catch (error) {
      console.error('Error loading binder sets:', error);
      toast({
        title: "Error",
        description: "Failed to load binder sets",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    navigate('/binder-helper/create');
  };

  const handleViewSet = (id: string) => {
    navigate(`/binder-helper/${id}`);
  };

  const confirmDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation when clicking delete
    setSelectedSetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSetId) return;

    try {
      const { error } = await supabase
        .from('binder_sets')
        .delete()
        .eq('id', selectedSetId);

      if (error) throw error;

      setBinderSets(binderSets.filter(set => set.id !== selectedSetId));
      toast({
        title: "Success",
        description: "Binder set deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting binder set:', error);
      toast({
        title: "Error",
        description: "Failed to delete binder set",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSetId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Binder Sets</h1>
        <Button onClick={handleCreateNew}>Create New Binder Set</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {binderSets.map((set) => (
          <div
            key={set.id}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
            onClick={() => handleViewSet(set.id)}
          >
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => confirmDelete(set.id, e)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold mb-2">{set.name}</h2>
            <p className="text-sm text-muted-foreground">
              Created: {new Date(set.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Cards: {Array.isArray(set.cards) ? set.cards.length : 0}
            </p>
          </div>
        ))}
      </div>

      {binderSets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No binder sets yet. Create your first one!</p>
          <Button onClick={handleCreateNew} className="mt-4">
            Create Binder Set
          </Button>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Binder Set</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this binder set? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BinderSetList;
