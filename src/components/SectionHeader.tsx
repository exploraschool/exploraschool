type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
  dark?: boolean;
};

export function SectionHeader({ eyebrow, title, description, className = "", dark = false }: SectionHeaderProps) {
  return (
    <div className={`section-header ${className}`.trim()}>
      <p className={dark ? "eyebrow-dark" : "eyebrow"}>{eyebrow}</p>
      <h2 className={`section-title mt-2 sm:mt-3 ${dark ? "text-nieve" : ""}`}>{title}</h2>
      {description ? (
        <p className={`section-intro mt-3 sm:mt-4 ${dark ? "text-on-dark-muted" : ""}`}>{description}</p>
      ) : null}
    </div>
  );
}
