import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Kept so existing call sites stay valid. Entrance motion is off so scroll stays smooth. */
  delay?: number;
};

export function Reveal({ children, className = "" }: RevealProps) {
  return <div className={className ? `reveal ${className}` : "reveal"}>{children}</div>;
}
