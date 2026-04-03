"use client";

import { useState } from "react";

export default function UseCodeButton({
  code,
  promoId,
  url,
}: {
  code: string;
  promoId: string;
  url?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      // ✅ copy to clipboard
      await navigator.clipboard.writeText(code);
      setCopied(true);

      // ✅ track click
      await fetch("/api/click", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promoId }),
      });

      // ✅ redirect after short delay
      setTimeout(() => {
        if (url) {
          window.open(url, "_blank");
        }
      }, 800);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-black text-white px-3 py-1 mt-3 hover:bg-gray-800 rounded"
    >
      {copied ? "Copied!" : "Use Code"}
    </button>
  );
}