"use client";

import { useEffect, useRef, type ReactNode } from "react";

type DisclosureItemProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
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

export function DisclosureItem({
  title,
  children,
  defaultOpen = false,
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

  return (
    <details
      ref={detailsRef}
      className={`disclose group ${variantClass} ${className}`.trim()}
    >
      <summary className="disclose__trigger">
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
