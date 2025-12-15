"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "checking" | "ready" | "success" | "error";

function getHashParams(hash: string) {
  // hash looks like: "#access_token=...&refresh_token=...&type=recovery"
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    type: params.get("type"),
    error: params.get("error"),
    error_description: params.get("error_description"),
  };
}

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("checking");
  const [statusMsg, setStatusMsg] = useState<string>("Validating recovery session...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setStep("checking");
        setErrorMsg(null);

        // 1) If Supabase gives PKCE code in query (?code=...), exchange it for a session
        const code = searchParams.get("code");
        const type = searchParams.get("type"); // often "recovery"

        if (code) {
          setStatusMsg("Exchanging recovery code for session...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // 2) If legacy/implicit flow puts tokens in URL hash (#access_token=...)
          const hash = typeof window !== "undefined" ? window.location.hash : "";
          const hp = getHashParams(hash);

          if (hp.error) {
            throw new Error(hp.error_description || hp.error);
          }

          if (hp.access_token && hp.refresh_token) {
            setStatusMsg("Setting recovery session...");
            const { error } = await supabase.auth.setSession({
              access_token: hp.access_token,
              refresh_token: hp.refresh_token,
            });
            if (error) throw error;

            // Clean the hash so refresh / copy-paste doesn’t re-run weirdly
            window.history.replaceState(null, "", window.location.pathname);
          } else {
            // No code and no tokens: maybe user opened page directly
            // We'll still check if there's an existing session
            setStatusMsg("Checking existing session...");
          }
        }

        // 3) Verify we have an authenticated user/session now
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (!data?.user) {
          throw new Error(
            "No active recovery session found. Please open the reset link from your email again."
          );
        }

        if (!cancelled) {
          // Optional: ensure this really is a recovery flow when ?type exists
          if (type && type !== "recovery") {
            // still allow, but you can be strict if you want
          }

          setStep("ready");
          setStatusMsg("Ready to set a new password.");
        }
      } catch (e: any) {
        if (cancelled) return;
        setStep("error");
        setErrorMsg(e?.message || "Reset link is invalid or expired. Request a new one.");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams, supabase]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (saving) return;

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // IMPORTANT: force clean state. This prevents “logged in as wrong account” bugs
      // when multiple sessions exist across devices/tabs.
      await supabase.auth.signOut();

      setStep("success");
      setStatusMsg("Password updated. Redirecting to login...");
      setTimeout(() => {
        router.replace("/auth/login?reset=1");
      }, 700);
    } catch (e: any) {
      setErrorMsg(e?.message || "Failed to update password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-semibold mb-2">Reset password</h1>

      {step === "checking" && (
        <p className="text-sm text-muted-foreground">{statusMsg}</p>
      )}

      {step === "error" && (
        <div className="space-y-3">
          <p className="text-sm text-red-500">{errorMsg}</p>
          <button
            className="w-full bg-black text-white py-2 rounded"
            onClick={() => router.replace("/auth/forgot-password")}
          >
            Request a new reset email
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="space-y-3">
          <p className="text-sm text-green-600">{statusMsg}</p>
          <button
            className="w-full bg-black text-white py-2 rounded"
            onClick={() => router.replace("/auth/login")}
          >
            Go to login
          </button>
        </div>
      )}

      {step === "ready" && (
        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm mb-1">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              disabled={saving}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm new password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              disabled={saving}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 disabled:opacity-60"
            />
          </div>

          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}

