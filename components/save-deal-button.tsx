"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { changeSavedId, readSavedIds, SAVED_EVENT, SAVED_KEY } from "@/lib/saved-deals";

export default function SaveDealButton({ promoId }: { promoId: string }) {
  const [saved, setSaved] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const refresh = () => setSaved(readSavedIds().includes(promoId));
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === SAVED_KEY || event.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(SAVED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(SAVED_EVENT, refresh);
    };
  }, [promoId]);

  const onClick = () => {
    if (!changeSavedId(promoId, !saved)) {
      setAvailable(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      title={available ? "Saved on this device only" : "Saving is unavailable in this browser"}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#e4ddfb] bg-white px-3.5 text-xs font-bold text-[#5a3cbd] transition hover:bg-[#f3efff] focus-visible:outline-2 focus-visible:outline-[#6844db]"
    >
      {saved ? <BookmarkCheck size={17} aria-hidden="true" /> : <Bookmark size={17} aria-hidden="true" />}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
