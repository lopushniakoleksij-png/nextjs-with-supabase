"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setVerified(true);
        setChecking(false);
        setError(null);
      }
    });

    async function initialize() {
      try {
        // Browser clients may already have consumed the recovery callback.
        const first = await supabase.auth.getUser();
        if (first.data.user) {
          if (active) setVerified(true);
          return;
        }

        // A PKCE recovery link can return a one-time code to this page.
        const code = new URLSearchParams(window.location.search).get("code");
        if (code) {
          const exchanged = await supabase.auth.exchangeCodeForSession(code);
          if (exchanged.error) throw exchanged.error;
          window.history.replaceState({}, "", window.location.pathname);
          if (active) setVerified(Boolean(exchanged.data.user));
          return;
        }

        if (active) {
          setError("This recovery link is missing, expired or already used. Request a new link.");
        }
      } catch {
        if (active) {
          setError("We couldn't verify your recovery link. Request a new one in this browser.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    void initialize();
    return () => { active = false; subscription.unsubscribe(); };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!verified || busy) return;
    if (password.length < 12) {
      setError("Use at least 12 characters for your new password.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    setError(null);
    const result = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (result.error) {
      setError("The password couldn't be changed. Try a new reset link or a different password.");
      return;
    }
    setPassword("");
    setConfirmation("");
    setSaved(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Promo Code 4 account recovery</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          {saved ? "Password updated" : "Set a new password"}
        </h1>

        {saved ? (
          <>
            <p role="status" className="mt-4 text-sm leading-6 text-slate-600">
              Your password has been changed. Your existing account and permissions remain the same.
            </p>
            <Link href="/auth/login" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">
              Return to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Follow the recovery link sent to your registered email, then choose a new password.
            </p>
            {checking ? (
              <p role="status" className="mt-6 text-sm text-slate-600">Checking recovery link…</p>
            ) : verified ? (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-800">New password</label>
                  <input id="new-password" type="password" autoComplete="new-password" required minLength={12}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="min-h-12 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-indigo-600" />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-800">Confirm new password</label>
                  <input id="confirm-password" type="password" autoComplete="new-password" required minLength={12}
                    value={confirmation} onChange={(e) => setConfirmation(e.target.value)}
                    className="min-h-12 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-indigo-600" />
                </div>
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <button type="submit" disabled={busy} className="min-h-12 w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
                  {busy ? "Updating…" : "Update password"}
                </button>
              </form>
            ) : (
              <div className="mt-6">
                {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
                <Link href="/auth/forgot-password" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-indigo-700 px-5 py-3 text-sm font-semibold text-white">
                  Request a new reset link
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
