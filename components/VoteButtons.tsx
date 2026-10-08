"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type VoteResponse = {
  error?: string;
  successRate?: number;
};

export default function VoteButtons({ promoId }: { promoId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVote = async (voteType: "worked" | "failed") => {
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      let fingerprint: string | null = null;
      try {
        fingerprint = window.localStorage.getItem("fp");
      } catch {
        setMessage("Voting requires browser storage to be available.");
        return;
      }

      if (!fingerprint) {
        setMessage("Voting is unavailable in this browser session.");
        return;
      }

      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoId, voteType, fingerprint }),
      });
      const data = (await response.json()) as VoteResponse;

      if (!response.ok) {
        setMessage(data.error || "Could not record your feedback. Please try again.");
        return;
      }
      setMessage(
        "Feedback received. Reported community success rate: " +
          (data.successRate ?? 0) + "%."
      );
    } catch {
      setMessage("Could not connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void handleVote("worked")}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#eaf9ec] px-3 text-xs font-bold text-[#276c3b] transition hover:bg-[#dcf4e0] disabled:opacity-50"
        >
          <ThumbsUp size={16} aria-hidden="true" /> Worked
        </button>
        <button
          type="button"
          onClick={() => void handleVote("failed")}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#fff0ed] px-3 text-xs font-bold text-[#a4473c] transition hover:bg-[#ffe6e0] disabled:opacity-50"
        >
          <ThumbsDown size={16} aria-hidden="true" /> Didn&apos;t work
        </button>
      </div>
      {message && <p role="status" aria-live="polite" className="mt-3 text-xs font-medium leading-5 text-slate-600">{message}</p>}
    </div>
  );
}
