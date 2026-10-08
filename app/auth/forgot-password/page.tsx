"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        // Request reset on the canonical public website, rather than on a
        // short-lived Vercel preview whose URL may not be on the allowlist.
        redirectTo: window.location.origin + "/auth/reset-password",
      });
      if (authError) {
        setError("We could not send the recovery email. Try again later.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("We couldn't connect to the authentication service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Promo Code 4 account recovery</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Forgot password?</h1>
        {success ? (
          <p role="status" className="mt-4 text-sm leading-6 text-slate-600">
            If an account exists for that address, you should receive a recovery email. Open the link in the same browser where you requested it.
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Enter your existing account email. We will send a link to change your password without creating a new account.
            </p>
            <form onSubmit={requestReset} className="mt-6 space-y-4">
              <div>
                <label htmlFor="recovery-email" className="mb-1 block text-sm font-medium text-slate-800">Account email</label>
                <input
                  id="recovery-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="min-h-12 w-full rounded-lg border border-slate-300 px-3 focus-visible:outline-2 focus-visible:outline-indigo-600"
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading} className="min-h-12 w-full rounded-lg bg-indigo-700 px-4 py-3 font-semibold text-white disabled:opacity-50">
                {loading ? "Sending…" : "Send password reset link"}
              </button>
            </form>
          </>
        )}
        <Link href="/auth/login" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-indigo-700 underline">Back to sign in</Link>
      </div>
    </main>
  );
}
