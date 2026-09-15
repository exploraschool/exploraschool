"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { getHeaderOffset } from "@/lib/scroll-to-anchor";

type DisclosureItemProps = {
  id?: string;
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Same name = only one panel open at a time. */
  name?: string;
  /** Card style (standalone) vs row inside a panel */
  variant?: "row" | "card" | "dark";
  className?: string;
  bodyClassName?: string;
};

function DiscloseIcon() {
  return (
    <span className="disclose__icon" aria-hidden>
      <span className="disclose__icon-bars">
        <span />
        <span />
      </span>
    </span>
  );
}

function pinSummaryBelowHeader(summary: HTMLElement) {
  const header = getHeaderOffset();
  const delta = summary.getBoundingClientRect().top - header;
  if (Math.abs(delta) > 1) {
    window.scrollBy(0, delta);
  }
}

export function DisclosureItem({
  id,
  title,
  children,
  defaultOpen = false,
  name,
  variant = "row",
  className = "",
  bodyClassName = "",
}: DisclosureItemProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const variantClass =
    variant === "card" ? "disclose--card" : variant === "dark" ? "disclose--dark" : "";

  useEffect(() => {
    if (defaultOpen && detailsRef.current) {
      detailsRef.current.open = true;
    }
  }, [defaultOpen]);

  function handleSummaryClick(event: MouseEvent<HTMLElement>) {
    if (!name) return;

    event.preventDefault();
    const current = detailsRef.current;
    if (!current) return;

    const summary = event.currentTarget;
    const willOpen = !current.open;

    if (willOpen) {
      const root = current.parentElement;
      if (root) {
        for (const node of root.querySelectorAll("details")) {
          if (node !== current && node.getAttribute("data-accordion") === name) {
            node.open = false;
          }
        }
      }
    }

    current.open = willOpen;

    const settle = () => {
      const top = summary.getBoundingClientRect().top;
      const header = getHeaderOffset();
      if (willOpen || top < header) {
        pinSummaryBelowHeader(summary);
      }
    };

    settle();
    requestAnimationFrame(() => {
      settle();
      requestAnimationFrame(settle);
    });
  }

  return (
    <details
      id={id}
      ref={detailsRef}
      data-accordion={name}
      className={`disclose group ${variantClass} ${id ? "scroll-target" : ""} ${className}`.trim()}
    >
      <summary className="disclose__trigger" onClick={handleSummaryClick}>
        <span className="disclose__title">{title}</span>
        <DiscloseIcon />
      </summary>
      <div className={`disclose__body ${bodyClassName}`.trim()}>{children}</div>
    </details>
  );
}

export function DisclosurePanel({
  children,
  dark = false,
  className = "",
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`${dark ? "disclose-panel--dark" : "disclose-panel"} ${className}`.trim()}>
      {children}
    </div>
  );
}
