const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const STEP_RE = /^\d+\.\s+/;

export type FaqInlinePart =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

export type FaqBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "note"; text: string };

export function faqAnswerPlainText(text: string): string {
  return text
    .replace(LINK_RE, "$1")
    .replace(/^\s*>\s+/gm, "")
    .replace(/^\s*-\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitFaqInline(text: string): FaqInlinePart[] {
  const parts: FaqInlinePart[] = [];
  const re = new RegExp(LINK_RE.source, "g");
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text))) {
    if (match.index > last) {
      parts.push({ type: "text", value: text.slice(last, match.index) });
    }
    parts.push({ type: "link", label: match[1], href: match[2] });
    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push({ type: "text", value: text.slice(last) });
  }

  return parts;
}

export function isSingleLinkItem(text: string): boolean {
  const parts = splitFaqInline(text.trim());
  return parts.length === 1 && parts[0].type === "link";
}

export function parseFaqBlocks(text: string): FaqBlock[] {
  const blocks: FaqBlock[] = [];

  for (const raw of text.trim().split(/\n\n+/)) {
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;

    if (lines.every((line) => line.startsWith("> "))) {
      blocks.push({ type: "note", text: lines.map((line) => line.slice(2)).join(" ") });
      continue;
    }

    if (lines.every((line) => STEP_RE.test(line))) {
      blocks.push({ type: "steps", items: lines.map((line) => line.replace(STEP_RE, "")) });
      continue;
    }

    const intro: string[] = [];
    const items: string[] = [];
    const steps: string[] = [];

    for (const line of lines) {
      if (line.startsWith("- ")) items.push(line.slice(2));
      else if (STEP_RE.test(line)) steps.push(line.replace(STEP_RE, ""));
      else if (line.startsWith("> ")) {
        if (intro.length) blocks.push({ type: "paragraph", text: intro.splice(0).join(" ") });
        blocks.push({ type: "note", text: line.slice(2) });
      } else intro.push(line);
    }

    if (intro.length) blocks.push({ type: "paragraph", text: intro.join(" ") });
    if (steps.length) blocks.push({ type: "steps", items: steps });
    if (items.length) blocks.push({ type: "list", items });
  }

  return blocks;
}
