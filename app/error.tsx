"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5 py-16 text-[#10182b]">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0ed] text-[#a4473c]">
          <AlertTriangle size={28} aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight">We couldn&apos;t load this page.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          The service is temporarily unavailable. Please try again shortly. We won&apos;t display fake deals while data is unavailable.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#211b57] px-6 py-3 text-sm font-bold text-white"
          >
            <RotateCw size={16} aria-hidden="true" /> Try again
          </button>
          <Link href="/" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">
            <ArrowLeft size={16} aria-hidden="true" /> Home
          </Link>
        </div>
      </div>
    </main>
  );
}
