import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileSettingsProps {
  onClose: () => void;
}

const UserProfileSettings = ({ onClose }: UserProfileSettingsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const { toast } = useToast();

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

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
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
      toast({
        title: "Error",
        description: "Failed to update leaderboard preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>User</AvatarFallback>
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

      <Button className="w-full" onClick={onClose}>
        Done
      </Button>
    </div>
  );
};

export default UserProfileSettings;