"use client";

import { useState } from "react";

type Props = {
  promoId: string;
};

export default function VoteButtons({ promoId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVote = async (voteType: "worked" | "failed") => {
    if (loading) return;

    setLoading(true);
    setMessage("");

    try {
      const fingerprint = localStorage.getItem("fp");

      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promoId,
          voteType,
          fingerprint,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Error");
        return;
      }

      setMessage(`Success rate: ${data.successRate}%`);
    } catch (err) {
      setMessage("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 space-x-2">
      <button
        onClick={() => handleVote("worked")}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        👍 Worked
      </button>

      <button
        onClick={() => handleVote("failed")}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        👎 Didn’t work
      </button>

      {message && (
        <p className="mt-2 text-sm font-medium">{message}</p>
      )}
    </div>
  );
}