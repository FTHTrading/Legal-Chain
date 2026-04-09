import { NextRequest, NextResponse } from 'next/server';

const LAWAPPS_HOSTS = ['lawapps.unykorn.org', 'lawapps.localhost:3003'];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';

  if (!LAWAPPS_HOSTS.some(h => host.startsWith(h.split(':')[0]))) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // lawapps root → /widgets page
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/widgets';
    return NextResponse.rewrite(url);
  }

  // Widget tool pages are already top-level routes (/rapid-intake, /demand-letter, etc.)
  // Allow them through, plus static assets and API routes
  const allowed = [
    '/rapid-intake',
    '/demand-letter',
    '/crypto-recovery',
    '/evidence-timeline',
    '/client-status',
    '/widgets',
    '/api/',
    '/_next/',
    '/icon.svg',
    '/favicon.ico',
  ];

  if (allowed.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Everything else on lawapps → redirect to widgets
  const url = request.nextUrl.clone();
  url.pathname = '/widgets';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icon\\.svg).*)'],
};
