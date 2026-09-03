import { Link } from "@/i18n/routing";
import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!match) return part;

    const [, label, href] = match;
    const className =
      "font-semibold text-hielo underline-offset-2 transition-colors hover:text-accent hover:underline";

    if (href.startsWith("/")) {
      return (
        <Link key={i} href={href} className={className}>
          {label}
        </Link>
      );
    }

    return (
      <a
        key={i}
        href={href}
        className={className}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {label}
      </a>
    );
  });
}

export function BlogMarkdown({ content }: { content: string }) {
  return content.split("\n").map((line, i) => {
    if (line.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 mb-4 font-display text-2xl font-semibold">
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-6 mb-3 font-display text-xl font-semibold">
          {line.slice(4)}
        </h3>
      );
    }
    if (line.trim() === "") return <br key={i} />;
    return (
      <p key={i} className="mb-4 text-muted leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });
}
