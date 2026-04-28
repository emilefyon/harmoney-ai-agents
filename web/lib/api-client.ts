'use client';

import type { AgentInput, AgentRunRaw, AgentRunResponse, Envelope, ProblemDetails } from './types';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.title || `Request failed with ${status}`);
  }
}

export interface RunOptions {
  input: AgentInput;
  language?: string;
  settings?: { model?: string; temperature?: number };
  signal?: AbortSignal;
}

export async function runAgent(
  apiSlug: string,
  { input, language, settings, signal }: RunOptions,
): Promise<AgentRunResponse> {
  const body: Record<string, unknown> = { input };
  if (language) body.language = language;
  if (settings && Object.keys(settings).length) body.settings = settings;

  const res = await fetch(`/api/proxy/agents/${apiSlug}/run`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    let problem: ProblemDetails;
    try {
      problem = (await res.json()) as ProblemDetails;
    } catch {
      problem = { title: res.statusText, status: res.status };
    }
    throw new ApiError(res.status, problem);
  }

  const raw = (await res.json()) as AgentRunRaw;
  return {
    envelope: raw.result?.json ?? null,
    validation: raw.validation,
    raw_content: raw.result?.content ?? null,
    meta: {
      agent: raw.agent,
      prompt: raw.prompt,
      language: raw.language,
      model: raw.result?.model,
      timing: raw.result?.timing,
      estimated_cost: raw.result?.estimated_cost ?? null,
    },
  };
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  // Prefer RFC 5987 filename*=UTF-8''<pct-encoded> when present (handles accents).
  const star = /filename\*=(?:UTF-8'[^']*')?([^;]+)/i.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ''));
    } catch {
      // fall through
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

export async function downloadAgentReport(
  apiSlug: string,
  input: AgentInput,
  envelope: Envelope,
  language: string,
): Promise<void> {
  const res = await fetch(`/api/proxy/agents/${apiSlug}/report/pdf`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input, envelope, language }),
  });

  if (!res.ok) {
    let problem: ProblemDetails;
    try {
      problem = (await res.json()) as ProblemDetails;
    } catch {
      problem = { title: res.statusText, status: res.status };
    }
    throw new ApiError(res.status, problem);
  }

  // Force a true PDF MIME on the blob — some intermediaries strip Content-Type,
  // and Safari will preview rather than download an `application/octet-stream`.
  const rawBlob = await res.blob();
  const blob = rawBlob.type === 'application/pdf'
    ? rawBlob
    : new Blob([rawBlob], { type: 'application/pdf' });

  const filename =
    filenameFromContentDisposition(res.headers.get('content-disposition')) ??
    `${apiSlug}-report.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // Defer cleanup so Safari has time to start the download before the blob URL
  // is revoked. Without this, the download silently fails on some Safari builds.
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
}
