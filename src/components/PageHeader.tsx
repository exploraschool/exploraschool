import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <section className="page-header">
      <div className="container-page relative">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className={eyebrow ? "page-title mt-2 sm:mt-3" : "page-title"}>{title}</h1>
        {description ? <p className="page-lead">{description}</p> : null}
        {children}
      </div>
    </section>
  );
}
