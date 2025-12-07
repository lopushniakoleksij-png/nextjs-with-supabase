import { NextResponse } from "next/server";

export const config = {
  matcher: ["/admin/:path*"],
};

export function middleware() {
  return NextResponse.next({
    headers: {
      "x-middleware-cache": "no-cache",
    },
  });
}

