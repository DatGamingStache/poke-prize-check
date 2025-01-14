import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Leaderboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-semibold text-foreground/80">Leaderboard</h1>
        </div>
        <div className="bg-card rounded-lg shadow-md p-6">
          <p className="text-center text-muted-foreground">Leaderboard coming soon!</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;