import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log the requested URL path for debugging
  console.log(`🚀 Request path: ${request.nextUrl.pathname}`);
  
  // Continue with the request as normal
  return NextResponse.next();
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ['/:path*'],
}; 