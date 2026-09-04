const HEADER_GAP = 10;
const SETTLE_MS = 900;

let pendingHash = "";

export function setPendingHash(hash: string): void {
  pendingHash = normalizeHash(hash);
}

export function consumePendingHash(): string {
  const hash = pendingHash;
  pendingHash = "";
  return hash;
}

export function normalizeHash(hash: string): string {
  if (!hash || hash === "#") return "";
  return hash.startsWith("#") ? hash : `#${hash}`;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getHeaderOffset(): number {
  const header = document.querySelector(".site-header");
  const measured =
    header instanceof HTMLElement ? header.getBoundingClientRect().height + HEADER_GAP : 0;
  const fromCss = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--header-offset"),
  );
  return Math.max(measured, Number.isFinite(fromCss) ? fromCss : 72);
}

function prepareTarget(el: HTMLElement): void {
  const nodes = [el, el.closest(".reveal"), ...el.querySelectorAll(".reveal")];
  for (const node of nodes) {
    if (node instanceof HTMLElement && node.classList.contains("reveal")) {
      node.classList.add("reveal-visible");
    }
  }
}

export function getAnchorTop(el: HTMLElement): number {
  return Math.max(0, window.scrollY + el.getBoundingClientRect().top - getHeaderOffset());
}

export function scrollToElement(el: HTMLElement, behavior: ScrollBehavior = "smooth"): void {
  prepareTarget(el);
  const used = prefersReducedMotion() ? "auto" : behavior;
  window.scrollTo({ top: getAnchorTop(el), left: 0, behavior: used });
}

type ScrollToHashOptions = {
  retries?: number;
  behavior?: ScrollBehavior;
};

export function scrollToHash(hash: string, options: ScrollToHashOptions = {}): () => void {
  const id = normalizeHash(hash).slice(1);
  if (!id) return () => undefined;

  const retries = options.retries ?? 32;
  const behavior = options.behavior ?? "smooth";
  let cancelled = false;
  let attempt = 0;
  let foundAt = 0;
  let timer = 0;

  const run = () => {
    if (cancelled) return;
    const el = document.getElementById(id);
    if (!el) {
      if (attempt >= retries) return;
      attempt += 1;
      timer = window.setTimeout(run, 40);
      return;
    }

    const now = Date.now();
    if (!foundAt) foundAt = now;
    const first = now === foundAt;
    scrollToElement(el, first ? behavior : "auto");

    if (now - foundAt < SETTLE_MS) {
      timer = window.setTimeout(run, first ? 80 : 50);
    }
  };

  run();
  return () => {
    cancelled = true;
    window.clearTimeout(timer);
  };
}
