"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "checking" | "ready" | "success" | "error";

export default function ResetPasswordClient() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  // ✅ Validate reset link + establish session
  useEffect(() => {
    const run = async () => {
      try {
        const code = searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          throw new Error("Invalid or expired reset link.");
        }

        setStep("ready");
      } catch (error: unknown) {
        setErrorMsg(error instanceof Error ? error.message : "Reset link invalid.");
        setStep("error");
      }
    };

    run();
  }, [searchParams, supabase]);

  // ✅ Submit new password
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      // 🔥 GLOBAL SIGN OUT (critical fix)
      await supabase.auth.signOut({ scope: "global" });

      // 🧹 Clear any cached auth state
      localStorage.clear();
      sessionStorage.clear();

      setStep("success");

      // ➜ Clean login redirect
      setTimeout(() => {
        router.replace("/auth/login?reset=1");
      }, 800);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  // ---- UI STATES ----

  if (step === "checking") {
    return <p className="mt-20 text-center">Validating reset link…</p>;
  }

  if (step === "error") {
    return (
      <div className="mt-20 text-center space-y-4">
        <p className="text-red-500">{errorMsg}</p>
        <button
          onClick={() => router.replace("/auth/forgot-password")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Request new reset link
        </button>
      </div>
    );
  }

  if (step === "success") {
    return (
      <p className="mt-20 text-center text-green-600">
        Password updated. Redirecting to login…
      </p>
    );
  }

  // READY
  return (
    <form onSubmit={submit} className="max-w-md mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-semibold">Reset password</h1>

      <input
        type="password"
        placeholder="New password"
        required
        value={password}
        disabled={saving}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      <input
        type="password"
        placeholder="Confirm password"
        required
        value={confirmPassword}
        disabled={saving}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />

      {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
      >
        {saving ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

