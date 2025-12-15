"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  /**
   * VERY IMPORTANT:
   * This consumes the reset token from the URL
   * and establishes a session.
   */
  useEffect(() => {
    const initSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setError("Invalid or expired reset link. Please request a new one.");
        return;
      }

      setReady(true);
    };

    initSession();
  }, [supabase]);

  const handleUpdatePassword = async () => {
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setLoading(false);
      setError("Password must be at least 8 characters long.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // 🔐 IMPORTANT: clear old session
    await supabase.auth.signOut();

    router.push("/auth/login");
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Validating reset link…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset password</CardTitle>
          <CardDescription>
            Enter a new password for your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? "Updating password…" : "Update password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

