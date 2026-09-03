"use client";

import { Link } from "@/i18n/routing";
import { DisclosureItem, DisclosurePanel } from "@/components/DisclosureItem";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type FooterSection = {
  id: string;
  title: string;
  links: FooterLink[];
  note?: string;
  noteSecondary?: string;
};

type FooterNavGroupsProps = {
  sections: FooterSection[];
};

function FooterLinkList({ section }: { section: FooterSection }) {
  return (
    <>
      <ul className="space-y-2">
        {section.links.map((link) => (
          <li key={link.href + link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-nieve/65 transition hover:text-oro-light"
              >
                {link.label}
              </a>
            ) : (
              <Link href={link.href} className="text-sm text-nieve/65 transition hover:text-oro-light">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
      {section.note ? (
        <p className="mt-3 text-[0.7rem] leading-relaxed text-nieve/40">{section.note}</p>
      ) : null}
      {section.noteSecondary ? (
        <p className="mt-1.5 text-[0.7rem] leading-relaxed text-nieve/30">{section.noteSecondary}</p>
      ) : null}
    </>
  );
}

export function FooterNavGroups({ sections }: FooterNavGroupsProps) {
  return (
    <DisclosurePanel dark className="footer-nav">
      {sections.map((section) => (
        <DisclosureItem key={section.id} variant="dark" title={section.title} bodyClassName="!pt-0">
          <FooterLinkList section={section} />
        </DisclosureItem>
      ))}
    </DisclosurePanel>
  );
}
