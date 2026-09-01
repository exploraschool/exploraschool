import { Link } from "@/i18n/routing";

type BackLinkProps = {
  href: string;
  children: string;
  className?: string;
};

export function BackLink({ href, children, className = "" }: BackLinkProps) {
  return (
    <Link href={href} className={`back-link ${className}`.trim()}>
      <span aria-hidden>←</span>
      <span>{children}</span>
    </Link>
  );
}
