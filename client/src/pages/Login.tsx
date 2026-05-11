import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!supabase) {
      console.error("Supabase not configured");
      return;
    }

    // Example: Sign in with GitHub or just show a login UI
    // For now, let's trigger a redirect to GitHub as an example OAuth provider
    // In a real app, you'd show a "Sign in with X" button.
    const signIn = async () => {
      if (!supabase) return;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin + '/dashboard',
        }
      });
      if (error) console.error("Login failed:", error.message);
    };

    signIn();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm tracking-widest uppercase animate-pulse">Initializing OS Auth...</p>
      </div>
    </div>
  );
}
