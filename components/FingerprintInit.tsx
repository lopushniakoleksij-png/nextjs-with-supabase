"use client";

import { useEffect } from "react";

export default function FingerprintInit() {
  useEffect(() => {
    if (!localStorage.getItem("fp")) {
      const fp = crypto.randomUUID();
      localStorage.setItem("fp", fp);
    }
  }, []);

  return null;
}