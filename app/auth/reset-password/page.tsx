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
  const [copiedLink, setCopiedLink] = useState("");
  const [verifyingCopiedLink, setVerifyingCopiedLink] = useState(false);

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

  async function verifyCopiedRecoveryLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!copiedLink.trim() || verifyingCopiedLink || recoveryUserId) return;
    setVerifyingCopiedLink(true);
    setError(null);
    try {
      // Supabase's default recovery email points to its /auth/v1/verify
      // endpoint with a one-time token hash. Verify that token directly
      // instead of following the link through a different browser's PKCE
      // context. Never send the pasted URL to our application server.
      const link = new URL(copiedLink.trim());
      const projectOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).origin;
      if (
        link.protocol !== "https:" ||
        link.origin !== projectOrigin ||
        link.pathname !== "/auth/v1/verify" ||
        link.searchParams.get("type") !== "recovery"
      ) {
        throw new Error(INVALID_LINK_MESSAGE);
      }

      const tokenHash = link.searchParams.get("token");
      if (!tokenHash || tokenHash.length > 4096) {
        throw new Error(INVALID_LINK_MESSAGE);
      }

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        type: "recovery",
        token_hash: tokenHash,
      });
      if (verifyError || !data.user || !data.session) {
        throw new Error(INVALID_LINK_MESSAGE);
      }

      setRecoveryUserId(data.user.id);
    } catch {
      setError("That reset link could not be verified. Copy the link from a fresh email without opening it first.");
    } finally {
      // A recovery link is a one-time secret; never retain it in the form.
      setCopiedLink("");
      setVerifyingCopiedLink(false);
    }
  }

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
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Opening reset links inside Gmail can switch browsers and lose the secure sign-in context.
                  For an unused link in your newest Supabase recovery email, long-press
                  <strong> Reset Password</strong>, choose <strong>Copy link</strong>, then paste it below.
                  Do not open the link before copying it. Only paste the link into this website, never into a chat.
                </p>
                <form onSubmit={verifyCopiedRecoveryLink} className="mt-4 space-y-3">
                  <label htmlFor="copied-recovery-link" className="block text-sm font-medium text-slate-800">
                    Paste the recovery link from Gmail
                  </label>
                  <input id="copied-recovery-link" type="url" inputMode="url" autoComplete="off"
                    required value={copiedLink}
                    onChange={(event) => setCopiedLink(event.target.value)}
                    placeholder="https://…supabase.co/auth/v1/verify?…"
                    className="min-h-12 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-indigo-600" />
                  <button type="submit" disabled={verifyingCopiedLink}
                    className="min-h-12 w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
                    {verifyingCopiedLink ? "Verifying…" : "Verify recovery link"}
                  </button>
                </form>
                <Link href="/auth/forgot-password" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline">
                  Request a fresh reset email
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
