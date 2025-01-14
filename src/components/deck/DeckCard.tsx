import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Printer, Pencil, Trash2, Check, X } from "lucide-react";

interface DeckCardProps {
  deck: {
    id: string;
    name: string;
    created_at: string;
  };
  isEditing: boolean;
  editingName: string;
  onEdit: () => void;
  onDelete: () => void;
  onPlay: () => void;
  onSave: () => void;
  onCancel: () => void;
  onNameChange: (name: string) => void;
  onSelect: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({
  deck,
  isEditing,
  editingName,
  onEdit,
  onDelete,
  onPlay,
  onSave,
  onCancel,
  onNameChange,
  onSelect,
}) => {
  return (
    <Card
      className="p-4 hover:bg-accent transition-colors cursor-pointer"
      onClick={(e) => {
        if (!isEditing) {
          e.stopPropagation();
          onSelect();
        }
      }}
    >
      <div className="flex justify-between items-start mb-2">
        {isEditing ? (
          <div className="flex items-center space-x-2 w-full">
            <Input
              value={editingName}
              onChange={(e) => onNameChange(e.target.value)}
              className="flex-1"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold">{deck.name}</h3>
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="ghost"
                className="text-green-500 hover:text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-blue-500 hover:text-blue-600"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/decks/${deck.id}/print`, '_blank');
                }}
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Created: {new Date(deck.created_at).toLocaleDateString()}
      </p>
    </Card>
  );
};

export default DeckCard;