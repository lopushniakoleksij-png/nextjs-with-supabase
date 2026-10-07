"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PromoCardCode = {
  code: string;
  title?: string | null;
  description?: string | null;
};

export function PromoCard({ code }: { code: PromoCardCode }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{code.title || "Promo Code"}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {code.description && (
          <p className="text-sm text-muted-foreground">{code.description}</p>
        )}

        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-muted rounded text-sm">{code.code}</code>

          <Button size="sm" onClick={copyCode}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
