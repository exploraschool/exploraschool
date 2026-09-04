import { Link } from "@/i18n/routing";
import type { ReactNode } from "react";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogTechTable } from "@/components/blog/BlogTechTable";
import { BLOG_H2_CLASS, BLOG_H3_CLASS, BLOG_P_CLASS, headingIdFor } from "@/lib/blog-article";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
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
    }
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong key={i} className="font-semibold text-pizarra">
          {bold[1]}
        </strong>
      );
    }
    return part;
  });
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function isTableDivider(line: string): boolean {
  return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function BlogMarkdown({
  content,
  locale = "es",
}: {
  content: string;
  locale?: string;
}) {
  const lines = content.split("\n");
  const seen = new Map<string, number>();
  const nodes: ReactNode[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (isTableRow(line)) {
      const tableLines = [line];
      let cursor = index + 1;
      while (cursor < lines.length && isTableRow(lines[cursor])) {
        tableLines.push(lines[cursor]);
        cursor += 1;
      }
      const bodyLines = tableLines.filter((row) => !isTableDivider(row));
      const header = tableCells(bodyLines[0] || "");
      const rows = bodyLines.slice(1).map((row) => tableCells(row));
      if (header.length === 2 && rows.every((row) => row.length >= 2)) {
        nodes.push(
          <div key={`table-${index}`} className="mb-8">
            <BlogTechTable
              rows={rows.map((row) => ({
                label: row[0] || "",
                value: row[1] || "",
              }))}
            />
          </div>,
        );
      } else {
        nodes.push(
          <div key={`table-${index}`} className="mb-8 overflow-x-auto rounded-2xl border border-hielo/12">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="bg-hielo/5">
                  {header.map((cell) => (
                    <th key={cell} className="px-4 py-3 font-semibold text-pizarra">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-nieve/80"}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 leading-relaxed text-muted">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      index = cursor - 1;
      continue;
    }

    if (line.trim().startsWith("> ")) {
      const quote: string[] = [];
      let cursor = index;
      while (cursor < lines.length && lines[cursor].trim().startsWith(">")) {
        quote.push(lines[cursor].replace(/^\s*>\s?/, ""));
        cursor += 1;
      }
      nodes.push(
        <div key={`quote-${index}`} className="mb-8">
          <BlogCallout locale={locale}>
            {quote.filter(Boolean).map((item, quoteIndex) => (
              <p key={quoteIndex} className={quoteIndex === 0 ? "" : "mt-2"}>
                {renderInline(item)}
              </p>
            ))}
          </BlogCallout>
        </div>,
      );
      index = cursor - 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      let cursor = index;
      while (cursor < lines.length && /^\s*[-*]\s+/.test(lines[cursor])) {
        items.push(lines[cursor].replace(/^\s*[-*]\s+/, ""));
        cursor += 1;
      }
      nodes.push(
        <ul key={`list-${index}`} className="mb-6 max-w-prose list-none space-y-2.5 pl-0">
          {items.map((item, itemIndex) => (
            <li key={itemIndex} className="flex gap-2.5 text-[1.075rem] leading-relaxed text-pizarra/90">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-hielo" aria-hidden />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>,
      );
      index = cursor - 1;
      continue;
    }

    if (line.startsWith("## ")) {
      const label = line.slice(3).trim();
      const id = headingIdFor(label, seen);
      nodes.push(
        <h2 key={`h2-${index}`} id={id} className={BLOG_H2_CLASS}>
          {renderInline(label)}
        </h2>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h3 key={`h3-${index}`} className={BLOG_H3_CLASS}>
          {renderInline(line.slice(4).trim())}
        </h3>,
      );
      continue;
    }

    if (line.trim() === "") continue;

    nodes.push(
      <p key={`p-${index}`} className={BLOG_P_CLASS}>
        {renderInline(line)}
      </p>,
    );
  }

  return <div className="blog-markdown">{nodes}</div>;
}
