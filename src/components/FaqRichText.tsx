import { Link } from "@/i18n/routing";
import { isSingleLinkItem, parseFaqBlocks, splitFaqInline, type FaqInlinePart } from "@/lib/faq-text";

function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

const linkClassName =
  "font-semibold text-hielo transition hover:text-accent";

function FaqLink({ href, label }: { href: string; label: string }) {
  if (isInternalHref(href)) {
    return (
      <Link href={href} className={linkClassName}>
        {label}
      </Link>
    );
  }

  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={linkClassName}
    >
      {label}
    </a>
  );
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {splitFaqInline(text).map((part: FaqInlinePart, i) => {
        if (part.type === "text") return <span key={i}>{part.value}</span>;
        return <FaqLink key={i} href={part.href} label={part.label} />;
      })}
    </>
  );
}

function ChipLink({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex items-center rounded-full border border-hielo/15 bg-nieve px-3.5 py-1.5 text-sm font-semibold text-hielo transition hover:border-hielo/30 hover:bg-white hover:text-accent";

  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
    >
      {label}
    </a>
  );
}

export function FaqRichText({ text }: { text: string }) {
  const blocks = parseFaqBlocks(text);

  return (
    <div className="space-y-4 text-[0.9375rem] leading-[1.65] text-pizarra/80">
      {blocks.map((block, i) => {
        if (block.type === "paragraph") {
          return (
            <p key={i}>
              <InlineText text={block.text} />
            </p>
          );
        }

        if (block.type === "note") {
          return (
            <p
              key={i}
              className="rounded-xl border border-hielo/10 bg-hielo/5 px-3.5 py-2.5 text-sm font-medium text-hielo"
            >
              <InlineText text={block.text} />
            </p>
          );
        }

        if (block.type === "steps") {
          return (
            <ol key={i} className="space-y-2.5">
              {block.items.map((item, j) => (
                <li key={j} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hielo text-[0.7rem] font-bold text-white">
                    {j + 1}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <InlineText text={item} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.items.every(isSingleLinkItem)) {
          return (
            <div key={i} className="flex flex-wrap gap-2">
              {block.items.map((item, j) => {
                const part = splitFaqInline(item)[0];
                if (part.type !== "link") return null;
                return <ChipLink key={j} href={part.href} label={part.label} />;
              })}
            </div>
          );
        }

        return (
          <ul key={i} className="space-y-2">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2.5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-hielo/55" aria-hidden />
                <span className="min-w-0">
                  <InlineText text={item} />
                </span>
              </li>
            ))}
          </ul>
        );
      })}
    </div>
  );
}
