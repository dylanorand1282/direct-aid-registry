import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-md border border-rule bg-paper p-5 ${className}`}>{children}</div>;
}
