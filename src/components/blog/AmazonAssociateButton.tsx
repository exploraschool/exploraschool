import { pickLocale } from "@/lib/locale";

type AmazonAssociateButtonProps = {
  href: string;
  locale: string;
  className?: string;
};

function AmazonSmileMark() {
  return (
    <svg viewBox="0 0 48 16" className="h-4 w-11 shrink-0" aria-hidden>
      <path
        d="M3.5 6.2c11.8 8.4 29.8 8.6 41.2.4"
        fill="none"
        stroke="#FF9900"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path fill="#FF9900" d="M40.2 3.6 47 8.1l-8.4 2.2z" />
    </svg>
  );
}

export function AmazonAssociateButton({
  href,
  locale,
  className = "",
}: AmazonAssociateButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#FFD814] px-4 py-2.5 text-sm font-semibold text-[#0F1111] shadow-[0_2px_5px_rgba(15,17,17,0.12)] transition hover:bg-[#F7CA00] ${className}`.trim()}
    >
      <AmazonSmileMark />
      {pickLocale(locale, "Comprar en Amazon", "Shop on Amazon")}
    </a>
  );
}
