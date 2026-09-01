import { earlyBirdBannerCopy, isEarlyBirdActive } from "@/lib/promotions";

type EarlyBirdBannerProps = {
  locale: string;
  className?: string;
};

export function EarlyBirdBanner({ locale, className = "" }: EarlyBirdBannerProps) {
  if (!isEarlyBirdActive()) return null;

  const { title, body } = earlyBirdBannerCopy(locale);

  return (
    <div
      className={`rounded-2xl border border-oro/30 bg-gradient-to-r from-oro/10 via-oro/5 to-accent/5 px-5 py-4 sm:px-6 sm:py-5 ${className}`}
      role="status"
    >
      <p className="text-xs font-bold uppercase tracking-wider text-oro">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-pizarra sm:text-base">{body}</p>
    </div>
  );
}
