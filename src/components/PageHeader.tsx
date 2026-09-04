import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, description, children, className = "" }: PageHeaderProps) {
  return (
    <section className={`page-header ${className}`.trim()}>
      <div className="container-page relative">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className={eyebrow ? "page-title mt-2 sm:mt-2.5" : "page-title"}>{title}</h1>
        {description ? <p className="page-lead">{description}</p> : null}
        {children ? <div className="page-actions">{children}</div> : null}
      </div>
    </section>
  );
}
