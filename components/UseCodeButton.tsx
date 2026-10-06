"use client";

import { useState } from "react";

export default function UseCodeButton({
  code,
  promoId,
}: {
  code: string;
  promoId: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard access can be unavailable in some browsers.
    }

    const fingerprint = localStorage.getItem("fp") || "";
    const target = fingerprint
      ? `/go/${promoId}?fp=${encodeURIComponent(fingerprint)}`
      : `/go/${promoId}`;

    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className="bg-black text-white px-3 py-1 mt-3 hover:bg-gray-800 rounded"
    >
      {copied ? "Copied! Open Deal" : "Use Code"}
    </button>
  );
}
