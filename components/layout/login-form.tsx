"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("manager@demo-resto.com");
  const [password, setPassword] = useState("Demo1234!");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md rise-in border-white/80 bg-white/90 shadow-luxe">
      <CardHeader>
        <CardTitle className="text-3xl text-[#1f2d43]">Welcome Back</CardTitle>
        <CardDescription>
          Access your hospitality control center.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full" size="lg" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Enter Platform
          </Button>
          <p className="rounded-lg bg-[#f9f1e2] px-3 py-2 text-xs text-[#6e5738]">
            Demo manager: manager@demo-resto.com / Demo1234!
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
