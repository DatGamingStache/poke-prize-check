import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GameControlsProps {
  onSubmitGuesses: () => void;
  showRestartDialog: boolean;
  setShowRestartDialog: (show: boolean) => void;
  onRestartGame: () => void;
}

const GameControls = ({
  onSubmitGuesses,
  showRestartDialog,
  setShowRestartDialog,
  onRestartGame,
}: GameControlsProps) => {
  return (
    <>
      <div className="mt-8 space-y-4">
        <Button onClick={onSubmitGuesses} className="w-full">
          Submit Guesses
        </Button>

        <Button
          onClick={() => setShowRestartDialog(true)}
          variant="outline"
          className="w-full"
        >
          Start New Game
        </Button>
      </div>

      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Game</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start a new game? This will reshuffle the deck and reset your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep playing</AlertDialogCancel>
            <AlertDialogAction onClick={onRestartGame}>Yes, start new game</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GameControls;