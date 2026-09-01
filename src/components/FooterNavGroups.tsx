"use client";

import { Link } from "@/i18n/routing";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type FooterNavGroupsProps = {
  sections: {
    id: string;
    title: string;
    links: FooterLink[];
    note?: string;
    noteSecondary?: string;
  }[];
};

function Chevron() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function FooterDisclosure({
  title,
  links,
  note,
  noteSecondary,
}: {
  title: string;
  links: FooterLink[];
  note?: string;
  noteSecondary?: string;
}) {
  return (
    <details className="group border-b border-white/10 px-4 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 transition hover:text-oro-light [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-nieve">{title}</span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-nieve/70 transition group-open:rotate-180">
          <Chevron />
        </span>
      </summary>
      <div className="pb-4 pt-1">
        <ul className="space-y-2.5">
          {links.map((link) => (
            <li key={link.href + link.label}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-nieve/80 transition hover:text-oro-light"
                >
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className="text-sm text-nieve/80 transition hover:text-oro-light">
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        {note && <p className="mt-3 text-xs leading-relaxed text-nieve/50">{note}</p>}
        {noteSecondary && (
          <p className="mt-2 text-xs leading-relaxed text-nieve/40">{noteSecondary}</p>
        )}
      </div>
    </details>
  );
}

export function FooterNavGroups({ sections }: FooterNavGroupsProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      {sections.map((section) => (
        <FooterDisclosure
          key={section.id}
          title={section.title}
          links={section.links}
          note={section.note}
          noteSecondary={section.noteSecondary}
        />
      ))}
    </div>
  );
}
