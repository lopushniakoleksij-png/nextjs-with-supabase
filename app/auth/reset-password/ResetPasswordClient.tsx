"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Step = "checking" | "ready" | "success" | "error";

function getHashParams(hash: string) {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  return {
    access_token: params.get("access_token"),
    refresh_token: params.get("refresh_token"),
    error: params.get("error"),
    error_description: params.get("error_description"),
  };
}

export default function ResetPasswordClient() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const code = searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const hash = window.location.hash;
          const hp = getHashParams(hash);

          if (hp.error) throw new Error(hp.error_description || hp.error);

          if (hp.access_token && hp.refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token: hp.access_token,
              refresh_token: hp.refresh_token,
            });
            if (error) throw error;
            window.history.replaceState(null, "", window.location.pathname);
          }
        }

        const { data } = await supabase.auth.getUser();
        if (!data.user) throw new Error("Invalid or expired reset link.");

        setStep("ready");
      } catch (err: any) {
        setStep("error");
        setErrorMsg(err.message || "Reset link invalid.");
      }
    };

    run();
  }, [searchParams, supabase]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      await supabase.auth.signOut();
      setStep("success");

      setTimeout(() => {
        router.replace("/auth/login?reset=1");
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  if (step === "checking") {
    return <p className="mt-20 text-center">Validating reset link...</p>;
  }

  if (step === "error") {
    return (
      <div className="mt-20 text-center">
        <p className="text-red-500">{errorMsg}</p>
        <button
          className="mt-4 bg-black text-white px-4 py-2 rounded"
          onClick={() => router.replace("/auth/forgot-password")}
        >
          Request new reset link
        </button>
      </div>
    );
  }

  if (step === "success") {
    return <p className="mt-20 text-center text-green-600">Password updated!</p>;
  }

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

      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

      <button
        disabled={saving}
        className="w-full bg-black text-white py-2 rounded"
      >
        {saving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

