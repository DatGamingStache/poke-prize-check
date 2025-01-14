import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

interface DisplayNameSectionProps {
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  setDisplayNameError: (error: string | null) => void;
  displayNameError: string | null;
}

export const DisplayNameSection = ({
  displayName,
  onDisplayNameChange,
  setDisplayNameError,
  displayNameError,
}: DisplayNameSectionProps) => {
  const [isCheckingName, setIsCheckingName] = useState(false);

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
    onDisplayNameChange(newName);
    setIsCheckingName(true);
    await checkDisplayNameAvailability(newName);
    setIsCheckingName(false);
  };

  return (
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
  );
};