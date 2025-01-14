import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-center gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Welcome to the Card Game
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          Test your memory and card recognition skills
        </p>
      </div>
      <div className="flex gap-4">
        <Link to="/decks">
          <Button>View Decks</Button>
        </Link>
        <Link to="/game">
          <Button variant="outline">Start Game</Button>
        </Link>
      </div>
    </div>
  );
}