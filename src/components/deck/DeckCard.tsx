import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Play, Printer, Pencil, Trash2, Check, X } from "lucide-react";
import { Link } from "react-router-dom";

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
            <div className="flex items-center space-x-3">
              <Play 
                className="h-5 w-5 text-green-500 hover:text-green-600 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay();
                }}
              />
              <Link 
                to={`/decks/${deck.id}/print`}
                onClick={(e) => e.stopPropagation()}
              >
                <Printer 
                  className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                />
              </Link>
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
                className="text-destructive hover:text-destructive"
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