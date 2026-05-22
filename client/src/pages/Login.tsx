import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        setLocation("/dashboard");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white font-mono p-4">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-zinc-900 border-zinc-800" />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-zinc-900 border-zinc-800" />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}
