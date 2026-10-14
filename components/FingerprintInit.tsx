"use client";

import { useEffect } from "react";

export default function FingerprintInit() {
  useEffect(() => {
    // A random browser identifier is used for duplicate-vote protection.
    // If local storage is blocked, browsing and tracked redirects still work.
    try {
      if (!window.localStorage.getItem("fp") && window.crypto?.randomUUID) {
        window.localStorage.setItem("fp", window.crypto.randomUUID());
      }
    } catch {
      // Do not crash the storefront in restricted/private browsing modes.
    }
  }, []);

  return null;
}
