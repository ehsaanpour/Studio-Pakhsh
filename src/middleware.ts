import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get('user');
  let user: { isAdmin?: boolean } | null = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch (e) {
      console.error('Failed to parse user cookie in middleware:', e);
      user = null; // Treat as not logged in if cookie is invalid
    }
  }

  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isProducerRoute = request.nextUrl.pathname.startsWith('/producer');

  // If user is already logged in, redirect them from the login page
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL(user.isAdmin ? '/admin' : '/producer', request.url));
  }

  // If user is not logged in, redirect them to the login page from protected routes
  if (!user && (isAdminRoute || isProducerRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (user) {
    // Protect admin routes
    if (isAdminRoute && !user.isAdmin) {
      return NextResponse.redirect(new URL('/producer', request.url));
    }

    // Protect producer routes
    if (isProducerRoute && user.isAdmin) {
      // Allow admins to access the edit request page
      if (!request.nextUrl.pathname.startsWith('/producer/edit-request')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/producer/:path*', '/login'],
};

