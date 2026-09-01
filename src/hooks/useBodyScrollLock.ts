import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;

function lockBody() {
  if (lockCount > 0) {
    lockCount += 1;
    return;
  }

  lockCount = 1;
  savedScrollY = window.scrollY;

  const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;

  document.documentElement.classList.add("modal-open");
  document.body.classList.add("modal-open");
  document.body.style.position = "fixed";
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  if (scrollbarGap > 0) {
    document.body.style.paddingRight = `${scrollbarGap}px`;
  }
}

function unlockBody() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  document.documentElement.classList.remove("modal-open");
  document.body.classList.remove("modal-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";

  window.scrollTo(0, savedScrollY);
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
