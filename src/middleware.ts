import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  
  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return null
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return null
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assignments/:path*",
    "/admin/:path*",
    "/login"
  ],
}