import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Plus, LogOut, History, ChartBar, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DeckListHeaderProps {
  onNewDeck: () => void;
  onShowSettings: () => void;
  onLogout: () => void;
  profilePicture: string | null;
  displayName: string;
}

const DeckListHeader: React.FC<DeckListHeaderProps> = ({
  onNewDeck,
  onShowSettings,
  onLogout,
  profilePicture,
  displayName,
}) => {
  const navigate = useNavigate();
  
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-semibold text-foreground/80">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onNewDeck} className="gap-2">
          <Plus className="h-4 w-4" />
          New Deck
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/leaderboard")} className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/history")} className="gap-2">
              <History className="h-4 w-4" />
              History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/analytics")} className="gap-2">
              <ChartBar className="h-4 w-4" />
              Analytics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" onClick={onShowSettings} className="p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profilePicture || undefined} />
            <AvatarFallback>{getInitial(displayName)}</AvatarFallback>
          </Avatar>
        </Button>
        
        <Button variant="outline" onClick={onLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DeckListHeader;