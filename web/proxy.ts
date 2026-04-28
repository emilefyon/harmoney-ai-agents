import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

const intl = createMiddleware(routing);

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="harmoney"' },
  });
}

function checkBasicAuth(req: NextRequest): boolean {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) return true;

  const header = req.headers.get('authorization');
  if (!header) return false;
  const m = /^Basic (.+)$/i.exec(header);
  if (!m) return false;

  let decoded = '';
  try { decoded = atob(m[1]); } catch { return false; }
  const sep = decoded.indexOf(':');
  if (sep === -1) return false;
  return decoded.slice(0, sep) === user && decoded.slice(sep + 1) === pass;
}

export default function proxy(req: NextRequest) {
  if (!checkBasicAuth(req)) return unauthorized();
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/_vercel') || /\.[^/]+$/.test(pathname)) {
    return NextResponse.next();
  }
  return intl(req);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
