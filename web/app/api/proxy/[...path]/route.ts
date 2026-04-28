import { NextRequest } from 'next/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const KEY = process.env.HARMONEY_API_KEY ?? '';
const PORT_FILE = path.resolve(process.cwd(), '..', '.api-port');

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function resolveUpstream(): Promise<string> {
  if (process.env.HARMONEY_API_URL) return process.env.HARMONEY_API_URL;
  try {
    const port = (await readFile(PORT_FILE, 'utf8')).trim();
    if (/^\d+$/.test(port)) return `http://localhost:${port}/v1`;
  } catch {}
  return 'http://localhost:3000/v1';
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const upstream = await resolveUpstream();
  const upstreamUrl = `${upstream}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers();
  const incomingContentType = req.headers.get('content-type');
  if (incomingContentType) headers.set('content-type', incomingContentType);
  if (KEY) headers.set('authorization', `Bearer ${KEY}`);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  };

  if (!['GET', 'HEAD'].includes(req.method)) {
    const body = await req.text();
    if (body) init.body = body;
  }

  let res: Response;
  try {
    res = await fetch(upstreamUrl, init);
  } catch (err) {
    return new Response(
      JSON.stringify({
        type: 'about:blank',
        title: 'Upstream API unreachable',
        status: 502,
        detail: err instanceof Error ? err.message : 'unknown',
        upstream: upstreamUrl,
      }),
      { status: 502, headers: { 'content-type': 'application/problem+json' } },
    );
  }

  const responseHeaders = new Headers();
  const ct = res.headers.get('content-type');
  if (ct) responseHeaders.set('content-type', ct);
  const requestId = res.headers.get('x-request-id');
  if (requestId) responseHeaders.set('x-request-id', requestId);
  const cd = res.headers.get('content-disposition');
  if (cd) responseHeaders.set('content-disposition', cd);

  return new Response(res.body, { status: res.status, headers: responseHeaders });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE, proxy as PATCH };
