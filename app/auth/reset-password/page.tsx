"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const INVALID_LINK_MESSAGE =
  "We could not verify this recovery link. It may be expired, already used, or opened in a different browser session.";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const verification = useRef<Promise<string> | null>(null);
  const [recoveryUserId, setRecoveryUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let recoveryEventUserId: string | null = null;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // A normal SIGNED_IN or INITIAL_SESSION event does not prove that
      // this browser has a password-recovery token for that account.
      if (!active || event !== "PASSWORD_RECOVERY" || !session?.user) return;
      recoveryEventUserId = session.user.id;
      setRecoveryUserId(session.user.id);
      setChecking(false);
      setError(null);
    });

    async function initialize() {
      try {
        const query = new URLSearchParams(window.location.search);
        const fragment = new URLSearchParams(window.location.hash.slice(1));

        if (query.has("error") || fragment.has("error")) {
          throw new Error(INVALID_LINK_MESSAGE);
        }

        const tokenHash = query.get("token_hash");
        const code = query.get("code");

        if (tokenHash && query.get("type") === "recovery") {
          // Email-template TokenHash + verifyOtp works when Gmail opens the
          // recovery link in another browser (no PKCE verifier is required).
          // Reuse the same promise in React Strict Mode: tokens are single-use.
          verification.current ??= (async () => {
            const { data, error: otpError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "recovery",
            });
            if (otpError || !data.user || !data.session) {
              throw new Error(INVALID_LINK_MESSAGE);
            }
            return data.user.id;
          })();
          const userId = await verification.current;
          window.history.replaceState(window.history.state, "", window.location.pathname);
          if (active) setRecoveryUserId(userId);
          return;
        }

        if (code) {
          // Keep existing PKCE links working when the verifier is available.
          verification.current ??= (async () => {
            const { data, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError || !data.user || !data.session) {
              throw new Error(INVALID_LINK_MESSAGE);
            }
            return data.user.id;
          })();
          const userId = await verification.current;
          window.history.replaceState(window.history.state, "", window.location.pathname);
          if (active) setRecoveryUserId(userId);
          return;
        }

        // Legacy implicit recovery links are accepted only when Supabase
        // itself emits PASSWORD_RECOVERY; an ordinary stored login is NOT enough.
        if (fragment.get("type") === "recovery") {
          const { error: initializationError } = await supabase.auth.initialize();
          if (initializationError || !recoveryEventUserId) {
            throw new Error(INVALID_LINK_MESSAGE);
          }
          return;
        }

        if (!recoveryEventUserId) throw new Error(INVALID_LINK_MESSAGE);
      } catch {
        if (active) {
          setRecoveryUserId(null);
          setError(INVALID_LINK_MESSAGE);
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    void initialize();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!recoveryUserId || busy) return;
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
    try {
      // Prevent a stale or replaced browser session from updating a different
      // signed-in account than the one authenticated by the recovery token.
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data.user || data.user.id !== recoveryUserId) {
        setRecoveryUserId(null);
        throw new Error(INVALID_LINK_MESSAGE);
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      // End the recovery session so the user must sign in with the new password.
      await supabase.auth.signOut({ scope: "local" });
      setPassword("");
      setConfirmation("");
      setSaved(true);
    } catch {
      setError("The password could not be changed. Please use a fresh recovery link after the issue is resolved.");
    } finally {
      setBusy(false);
    }
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
              Your password has been changed. Sign in with your existing email and the new password.
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
            ) : recoveryUserId ? (
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-slate-800">New password</label>
                  <input id="new-password" type="password" autoComplete="new-password" required minLength={12}
                    value={password} onChange={(event) => setPassword(event.target.value)}
                    className="min-h-12 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-indigo-600" />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-slate-800">Confirm new password</label>
                  <input id="confirm-password" type="password" autoComplete="new-password" required minLength={12}
                    value={confirmation} onChange={(event) => setConfirmation(event.target.value)}
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
