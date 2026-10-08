"use client";

import { useState, type MouseEvent } from "react";
import { ArrowUpRight, Copy, Check } from "lucide-react";

export default function UseCodeButton({
  code,
  promoId,
}: {
  code: string;
  promoId: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // A real anchor preserves native new-tab behavior and avoids
    // popup blockers caused by awaiting a clipboard operation.
    try {
      const fingerprint = window.localStorage.getItem("fp");
      if (fingerprint) {
        event.currentTarget.href =
          "/go/" + promoId + "?fp=" + encodeURIComponent(fingerprint);
      }
    } catch {
      // The tracked redirect works even if local storage is unavailable.
    }

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(code)
        .then(() => setCopied(true))
        .catch(() => {});
    }
  };

  return (
    <a
      href={"/go/" + promoId}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl bg-[#211b57] px-4 py-3 text-sm font-extrabold text-white transition hover:bg-[#46368f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7859e1] focus-visible:ring-offset-2"
      aria-label={"Copy code " + code + " and open deal"}
    >
      {copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />}
      <span>{copied ? "Code copied — open deal" : "Copy code & open deal"}</span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}
