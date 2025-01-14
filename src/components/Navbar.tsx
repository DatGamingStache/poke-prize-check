import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="flex gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">Card Game</span>
          </Link>
          <Link to="/decks" className="text-sm font-medium transition-colors hover:text-primary">
            Decks
          </Link>
          <Link to="/game" className="text-sm font-medium transition-colors hover:text-primary">
            Game
          </Link>
          <Link to="/analytics" className="text-sm font-medium transition-colors hover:text-primary">
            Analytics
          </Link>
        </div>
      </div>
    </nav>
  );
}