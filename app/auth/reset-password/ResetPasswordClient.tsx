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
      } catch (err: any) {
        setErrorMsg(err.message || "Reset link invalid.");
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

    setSaving(tr

