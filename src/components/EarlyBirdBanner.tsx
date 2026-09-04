import { earlyBirdBannerCopy, isEarlyBirdActive } from "@/lib/promotions";

type EarlyBirdBannerProps = {
  locale: string;
  className?: string;
};

export function EarlyBirdBanner({ locale, className = "" }: EarlyBirdBannerProps) {
  if (!isEarlyBirdActive()) return null;

  const { title, body } = earlyBirdBannerCopy(locale);

  return (
    <div className={`early-bird-banner ${className}`.trim()} role="status">
      <span className="early-bird-banner__badge" aria-hidden>
        −10%
      </span>
      <div className="early-bird-banner__copy">
        <p className="early-bird-banner__title">{title}</p>
        <p className="early-bird-banner__body">{body}</p>
      </div>
    </div>
  );
}
