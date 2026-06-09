import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route guard — fully implemented in Task 13 when Firebase Auth is wired.
// For now: pass all requests through.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
