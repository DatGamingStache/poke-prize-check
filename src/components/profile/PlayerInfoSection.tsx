import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface PlayerInfoSectionProps {
  playerName: string;
  playerId: string;
  birthdate: string;
  division: string;
  onPlayerNameChange: (value: string) => void;
  onPlayerIdChange: (value: string) => void;
  onBirthdateChange: (value: string) => void;
  onDivisionChange: (value: string) => void;
}

export const PlayerInfoSection = ({
  playerName,
  playerId,
  birthdate,
  division,
  onPlayerNameChange,
  onPlayerIdChange,
  onBirthdateChange,
  onDivisionChange,
}: PlayerInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="player-name">Player Name</Label>
        <Input
          id="player-name"
          value={playerName}
          onChange={(e) => onPlayerNameChange(e.target.value)}
          placeholder="Enter player name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="player-id">Player ID</Label>
        <Input
          id="player-id"
          value={playerId}
          onChange={(e) => onPlayerIdChange(e.target.value)}
          placeholder="Enter player ID"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Birthdate</Label>
        <Input
          id="birthdate"
          type="date"
          value={birthdate}
          onChange={(e) => onBirthdateChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="division">Division</Label>
        <Input
          id="division"
          value={division}
          onChange={(e) => onDivisionChange(e.target.value)}
          placeholder="Enter division"
        />
      </div>
    </div>
  );
};