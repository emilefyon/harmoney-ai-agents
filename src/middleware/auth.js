import crypto from 'node:crypto';
import { config } from '../config.js';

function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function problem(res, status, title, detail, requestId) {
  res
    .status(status)
    .type('application/problem+json')
    .json({ type: 'about:blank', title, status, detail, request_id: requestId });
}

export function apiKeyAuth(req, res, next) {
  if (config.API_KEYS.length === 0) {
    req.apiKey = 'anonymous';
    return next();
  }
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return problem(res, 401, 'Unauthorized', 'Missing Authorization: Bearer <key> header', req.id);
  }
  const provided = match[1];
  const accepted = config.API_KEYS.some((k) => safeEqual(k, provided));
  if (!accepted) {
    return problem(res, 401, 'Unauthorized', 'Invalid API key', req.id);
  }
  req.apiKey = `key_${provided.slice(-4)}`;
  next();
}
