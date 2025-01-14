import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfilePictureSection } from "./profile/ProfilePictureSection";
import { DisplayNameSection } from "./profile/DisplayNameSection";
import { PlayerInfoSection } from "./profile/PlayerInfoSection";

interface UserProfileSettingsProps {
  onClose: () => void;
}

const UserProfileSettings = ({ onClose }: UserProfileSettingsProps) => {
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [division, setDivision] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('profile_picture_url, share_game_history, display_name, player_name, player_id, birthdate, division')
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        toast({
          title: "Error",
          description: "Failed to load user preferences",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        setShowOnLeaderboard(data.share_game_history);
        setProfilePictureUrl(data.profile_picture_url);
        setDisplayName(data.display_name || '');
        setPlayerName(data.player_name || '');
        setPlayerId(data.player_id || '');
        setBirthdate(data.birthdate ? new Date(data.birthdate).toISOString().split('T')[0] : '');
        setDivision(data.division || '');
      }
    } catch (error) {
      console.error('Error in loadUserPreferences:', error);
      toast({
        title: "Error",
        description: "Failed to load user preferences",
        variant: "destructive",
      });
    }
  };

  const handleLeaderboardToggle = async (checked: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('user_preferences')
        .update({ share_game_history: checked })
        .eq('user_id', user.id);

      if (error) throw error;

      setShowOnLeaderboard(checked);
      toast({
        title: "Success",
        description: `You will ${checked ? 'now' : 'no longer'} appear on the leaderboard`,
      });
    } catch (error) {
      console.error('Error updating leaderboard preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update leaderboard preferences",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (displayNameError) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('user_preferences')
        .update({
          display_name: displayName,
          player_name: playerName,
          player_id: playerId,
          birthdate: birthdate || null,
          division: division,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <ProfilePictureSection
        profilePictureUrl={profilePictureUrl}
        displayName={displayName}
        onPictureUpdate={setProfilePictureUrl}
      />

      <DisplayNameSection
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        setDisplayNameError={setDisplayNameError}
        displayNameError={displayNameError}
      />

      <PlayerInfoSection
        playerName={playerName}
        playerId={playerId}
        birthdate={birthdate}
        division={division}
        onPlayerNameChange={setPlayerName}
        onPlayerIdChange={setPlayerId}
        onBirthdateChange={setBirthdate}
        onDivisionChange={setDivision}
      />

      <div className="flex items-center justify-between">
        <Label htmlFor="show-leaderboard" className="text-base">
          Show on Leaderboard
        </Label>
        <Switch
          id="show-leaderboard"
          checked={showOnLeaderboard}
          onCheckedChange={handleLeaderboardToggle}
        />
      </div>

      <Button 
        className="w-full mb-4" 
        onClick={handleSave}
        disabled={!!displayNameError}
      >
        Save Changes
      </Button>
    </div>
  );
};

export default UserProfileSettings;