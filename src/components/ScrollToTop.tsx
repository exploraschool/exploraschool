"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  consumePendingHash,
  normalizeHash,
  scrollToHash,
  setPendingHash,
} from "@/lib/scroll-to-anchor";

function pathsMatch(a: string, b: string): boolean {
  const normalize = (path: string) => {
    if (!path) return "/";
    return path.length > 1 ? path.replace(/\/$/, "") : path;
  };
  return normalize(a) === normalize(b);
}

export function ScrollToTop() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const hash = consumePendingHash() || window.location.hash;
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    if (window.location.hash !== hash) {
      history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
    }
    return scrollToHash(hash, { retries: 36, behavior: "smooth" });
  }, [pathname]);

  useEffect(() => {
    function onHashChange() {
      if (window.location.hash) {
        scrollToHash(window.location.hash, { retries: 16, behavior: "smooth" });
      }
    }

    function onPopState() {
      if (window.location.hash) {
        scrollToHash(window.location.hash, { retries: 16, behavior: "auto" });
      }
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      const samePath = pathsMatch(url.pathname, window.location.pathname);
      const sameSearch = url.search === window.location.search;
      const hash = normalizeHash(url.hash);

      if (hash) {
        event.preventDefault();
        if (samePath && sameSearch) {
          if (window.location.hash !== hash) {
            history.pushState(null, "", `${url.search}${hash}`);
          }
          scrollToHash(hash, { retries: 16, behavior: "smooth" });
          return;
        }
        setPendingHash(hash);
        router.push(`${url.pathname}${url.search}`, { scroll: false });
        return;
      }

      if (samePath && sameSearch) {
        event.preventDefault();
        if (window.location.hash) {
          history.pushState(null, "", `${url.pathname}${url.search}`);
        }
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      }
    }

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
    };
  }, [router]);

  return null;
}
