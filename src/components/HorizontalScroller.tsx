"use client";

import {
  Children,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type HorizontalScrollerProps = {
  children: ReactNode;
  className?: string;
  label: string;
  prevLabel: string;
  nextLabel: string;
};

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
      {dir === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

function NavButton({
  dir,
  label,
  controls,
  disabled,
  onClick,
}: {
  dir: "left" | "right";
  label: string;
  controls: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controls}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-hielo/15 bg-white text-hielo shadow-[0_4px_18px_rgba(10,18,25,0.16)] transition enabled:hover:bg-nieve enabled:active:scale-95 disabled:pointer-events-none disabled:opacity-40"
    >
      <Chevron dir={dir} />
    </button>
  );
}

export function HorizontalScroller({
  children,
  className = "",
  label,
  prevLabel,
  nextLabel,
}: HorizontalScrollerProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollerId = useId();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const count = Children.count(children);

  const sync = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const overflow = max > 8;
    setCanPrev(overflow && el.scrollLeft > 6);
    setCanNext(overflow && el.scrollLeft < max - 6);
  }, []);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [sync, children]);

  function scrollByCard(direction: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = Number.parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 0;
    const amount = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.85;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }

  const itemClass =
    count <= 1
      ? "flex h-full w-full min-w-0 [&>*]:h-full [&>*]:min-w-0 [&>*]:w-full"
      : "flex h-full w-[calc(100%-2.75rem)] shrink-0 snap-start [&>*]:h-full [&>*]:min-w-0 [&>*]:w-full sm:w-full sm:min-w-0 sm:max-w-none sm:shrink";

  return (
    <div className="min-w-0">
      <div ref={scrollerRef} id={scrollerId} className={className} role="list" aria-label={label}>
        {Children.map(children, (child) => (
          <div role="listitem" className={itemClass}>
            {child}
          </div>
        ))}
      </div>
      {canPrev || canNext ? (
        <div className="mt-3 flex items-center justify-end gap-2 sm:hidden">
          <NavButton
            dir="left"
            label={prevLabel}
            controls={scrollerId}
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
          />
          <NavButton
            dir="right"
            label={nextLabel}
            controls={scrollerId}
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
          />
        </div>
      ) : null}
    </div>
  );
}
