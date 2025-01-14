import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/decks");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-background to-muted p-6">
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src="/purple-checkmark.svg" alt="PokéCheck Logo" className="w-8 h-8" />
            <h1 className="text-4xl font-bold text-foreground">PokéCheck</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-md">
            A Pokémon prize checking practice and analytics tool, with decklist printing functionality
          </p>
        </div>

        {/* Auth Card */}
        <Card className="w-full p-6 space-y-6">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  }
                }
              }
            }}
            providers={[]}
          />
        </Card>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-sm text-muted-foreground">
        <p>
          Created by <span className="font-bold text-[#8B5CF6]">Datstache</span> • Feature requests or issues? Contact{" "}
          <a 
            href="mailto:weasel0398@gmail.com"
            className="font-bold text-[#8B5CF6] hover:underline"
          >
            TruResolution
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Login;