import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const PROMPTS_DIR =
  process.env.HARMONEY_PROMPTS_DIR ?? path.resolve(process.cwd(), '..', 'prompts');

export interface AgentPrompt {
  promptName: string;
  /** Full markdown source of the prompt file. */
  markdown: string;
  /** Extracted system prompt (between `## SYSTEM PROMPT` and `## USER MESSAGE TEMPLATE`). */
  systemPrompt: string | null;
  /** Extracted user-message template (the fenced block under `## USER MESSAGE TEMPLATE`). */
  userTemplate: string | null;
}

function extractSection(content: string, start: string, end: string): string | null {
  const startIdx = content.indexOf(start);
  if (startIdx === -1) return null;
  const after = startIdx + start.length;
  const endIdx = content.indexOf(end, after);
  return (endIdx === -1 ? content.slice(after) : content.slice(after, endIdx)).trim();
}

function extractFenced(section: string | null): string | null {
  if (!section) return null;
  const m = section.match(/```(?:\w+)?\s*\n([\s\S]*?)\n```/);
  return m ? m[1].trim() : section;
}

export async function loadAgentPrompt(promptName: string): Promise<AgentPrompt | null> {
  if (!/^[a-zA-Z0-9_-]+$/.test(promptName)) return null;
  const filePath = path.join(PROMPTS_DIR, `${promptName}.md`);
  let markdown: string;
  try {
    markdown = await readFile(filePath, 'utf8');
  } catch {
    return null;
  }
  const systemSection = extractSection(markdown, '## SYSTEM PROMPT', '## USER MESSAGE TEMPLATE');
  const userSection = extractSection(markdown, '## USER MESSAGE TEMPLATE', '## NOTES FOR THE API WRAPPER');
  return {
    promptName,
    markdown,
    systemPrompt: systemSection ? systemSection.replace(/\n-{3,}\s*$/m, '').trim() : null,
    userTemplate: extractFenced(userSection),
  };
}
