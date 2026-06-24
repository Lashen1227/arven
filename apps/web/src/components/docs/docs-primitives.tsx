import type { ReactNode } from "react";

type DocsSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

type DocsCodeBlockProps = {
  children: ReactNode;
};

type DocsCalloutProps = {
  children: ReactNode;
};

export function DocsSection({ id, title, children }: DocsSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-5">
      <h2 className="text-xl font-normal tracking-[-0.03em] text-zinc-900 sm:text-2xl">{title}</h2>
      <div className="space-y-5 text-[15px] leading-8 text-zinc-700">{children}</div>
    </section>
  );
}

export function DocsCodeBlock({ children }: DocsCodeBlockProps) {
  return (
    <pre className="overflow-x-auto border border-zinc-50 bg-zinc-100 p-5 text-sm leading-7 text-zinc-700">
      <code className="font-mono">{children}</code>
    </pre>
  );
}

export function DocsCallout({ children }: DocsCalloutProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50 px-5 py-4 text-[15px] leading-8 text-blue-900">
      {children}
    </div>
  );
}
