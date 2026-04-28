import type { AgentPrompt } from '@/lib/prompts';

interface Props {
  prompt: AgentPrompt | null;
  labels: {
    title: string;
    open: string;
    systemPrompt: string;
    userTemplate: string;
    notFound: string;
  };
}

export function PromptViewer({ prompt, labels }: Props) {
  if (!prompt) {
    return (
      <div className="card p-4 text-sm text-ink/70">{labels.notFound}</div>
    );
  }

  return (
    <details className="card overflow-hidden group">
      <summary className="cursor-pointer select-none px-5 py-4 flex items-center justify-between gap-4 hover:bg-purple-lighter/30">
        <div className="flex flex-col gap-0.5">
          <span className="font-display text-base">{labels.title}</span>
          <code className="text-xs text-ink/60">{prompt.promptName}.md</code>
        </div>
        <span className="text-ink/50 text-xs uppercase tracking-wider group-open:hidden">
          {labels.open}
        </span>
        <span className="text-ink/50 text-xs group-open:rotate-180 transition-transform">▾</span>
      </summary>
      <div className="border-t border-mist flex flex-col gap-5 p-5">
        {prompt.systemPrompt ? (
          <PromptSection label={labels.systemPrompt} body={prompt.systemPrompt} />
        ) : null}
        {prompt.userTemplate ? (
          <PromptSection label={labels.userTemplate} body={prompt.userTemplate} />
        ) : null}
      </div>
    </details>
  );
}

function PromptSection({ label, body }: { label: string; body: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h4 className="text-xs font-medium text-ink uppercase tracking-wider">{label}</h4>
      <pre className="bg-mist/40 border border-mist rounded p-4 text-xs text-ink leading-relaxed whitespace-pre-wrap break-words font-mono max-h-[28rem] overflow-auto">
        {body}
      </pre>
    </section>
  );
}
