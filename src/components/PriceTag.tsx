import { resolvePriceDisplay } from "@/lib/promotions";
import type { ProductId } from "@/data/products";

type PriceTagProps = {
  price: number;
  locale: string;
  prefix?: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  productId?: ProductId;
};

const sizeClasses = {
  sm: { price: "text-sm font-semibold", list: "text-xs", badge: "text-[0.6rem] px-1.5 py-0.5" },
  md: { price: "text-lg font-semibold", list: "text-sm", badge: "text-[0.65rem] px-2 py-0.5" },
  lg: { price: "text-2xl font-semibold", list: "text-base", badge: "text-xs px-2 py-0.5" },
} as const;

export function PriceTag({
  price,
  locale,
  prefix,
  suffix,
  size = "md",
  className = "",
  productId,
}: PriceTagProps) {
  const display = resolvePriceDisplay(price, new Date(), productId);
  const sizes = sizeClasses[size];

  if (!display.discountActive) {
    return (
      <span className={`text-accent-dark ${sizes.price} ${className}`}>
        {prefix}
        {display.finalPrice} €{suffix}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}>
      <span className={`text-muted line-through ${sizes.list}`}>{display.listPrice} €</span>
      <span className={`text-accent-dark ${sizes.price}`}>
        {prefix}
        {display.finalPrice} €{suffix}
      </span>
      <span
        className={`rounded-full bg-oro/15 font-bold uppercase tracking-wide text-oro ${sizes.badge}`}
      >
        -{display.discountPercent}%
      </span>
    </span>
  );
}
