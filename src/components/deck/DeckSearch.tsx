import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DeckSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const DeckSearch: React.FC<DeckSearchProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search decks..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10 w-full max-w-sm"
      />
    </div>
  );
};

export default DeckSearch;