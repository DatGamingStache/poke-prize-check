import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileSettingsProps {
  onClose: () => void;
}

const UserProfileSettings = ({ onClose }: UserProfileSettingsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
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
        .select('profile_picture_url, share_game_history, display_name')
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

  const checkDisplayNameAvailability = async (name: string) => {
    if (name.length === 0) {
      setDisplayNameError("Display name is required");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('user_id')
        .eq('display_name', name)
        .maybeSingle();

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Name is available if no data returned or if it belongs to current user
      const isAvailable = !data || data.user_id === user.id;
      if (!isAvailable) {
        setDisplayNameError("This display name is already taken");
      } else {
        setDisplayNameError(null);
      }
      return isAvailable;
    } catch (error) {
      console.error('Error checking display name:', error);
      setDisplayNameError("Error checking display name availability");
      return false;
    }
  };

  const handleDisplayNameChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;
    setDisplayName(newName);
    setIsCheckingName(true);
    await checkDisplayNameAvailability(newName);
    setIsCheckingName(false);
  };

  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_pictures')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('user_preferences')
        .update({ profile_picture_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfilePictureUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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
    if (displayNameError || isCheckingName) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('user_preferences')
        .update({ display_name: displayName })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Display name updated successfully",
      });
      onClose();
    } catch (error) {
      console.error('Error updating display name:', error);
      toast({
        title: "Error",
        description: "Failed to update display name",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profilePictureUrl || undefined} alt={displayName} />
          <AvatarFallback>{getInitial(displayName)}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <input
            type="file"
            id="profile-picture"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <Button
            variant="outline"
            onClick={() => document.getElementById("profile-picture")?.click()}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Picture"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="display-name">Display Name</Label>
        <Input
          id="display-name"
          value={displayName}
          onChange={handleDisplayNameChange}
          className={displayNameError ? "border-red-500" : ""}
          placeholder="Enter display name"
        />
        {displayNameError && (
          <p className="text-sm text-red-500">{displayNameError}</p>
        )}
      </div>

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
        className="w-full" 
        onClick={handleSave}
        disabled={!!displayNameError || isCheckingName}
      >
        Save Changes
      </Button>
    </div>
  );
};

export default UserProfileSettings;
