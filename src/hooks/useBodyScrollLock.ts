import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;
let savedLocation = "";
let appliedPaddingRight = "";

function currentLocation() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/** Classic scrollbar compensation is desktop-only; iOS reports false gaps and leaves padding. */
function shouldCompensateScrollbar(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  if (window.matchMedia("(hover: none)").matches) return false;
  const ua = window.navigator.userAgent;
  if (/iP(ad|hone|od)/i.test(ua)) return false;
  if (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1) return false;
  return true;
}

function clearBodyLockStyles() {
  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  document.body.style.removeProperty("position");
  document.body.style.removeProperty("top");
  document.body.style.removeProperty("left");
  document.body.style.removeProperty("right");
  document.body.style.removeProperty("width");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("padding-right");
  if (appliedPaddingRight) {
    document.documentElement.style.removeProperty("padding-right");
    appliedPaddingRight = "";
  }
}

function lockBody() {
  if (lockCount > 0) {
    lockCount += 1;
    return;
  }

  lockCount = 1;
  savedScrollY = window.scrollY;
  savedLocation = currentLocation();

  const scrollbarGap = shouldCompensateScrollbar()
    ? Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    : 0;

  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  if (scrollbarGap > 0) {
    appliedPaddingRight = `${scrollbarGap}px`;
    document.body.style.paddingRight = appliedPaddingRight;
    document.documentElement.style.paddingRight = appliedPaddingRight;
  }
}

function unlockBody() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  const active = document.activeElement;
  if (active instanceof HTMLElement) {
    active.blur();
  }

  clearBodyLockStyles();

  if (currentLocation() === savedLocation) {
    window.scrollTo(0, savedScrollY);
  } else {
    window.scrollTo(0, 0);
  }
}

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lockBody();

    return () => {
      unlockBody();
    };
  }, [locked]);
}
