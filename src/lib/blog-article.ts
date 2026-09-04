import { getDisciplineBySlug, type MainDisciplineId } from "@/data/disciplines";

export const BLOG_H2_CLASS =
  "scroll-mt-28 mt-12 mb-4 font-display text-[1.65rem] font-bold tracking-tight text-pizarra sm:mt-14 sm:text-3xl";
export const BLOG_H3_CLASS =
  "scroll-mt-28 mt-8 mb-3 font-display text-xl font-bold text-pizarra sm:text-2xl";
export const BLOG_P_CLASS =
  "mb-5 max-w-prose text-[1.075rem] leading-relaxed text-pizarra/90";

export type BlogTocItem = {
  id: string;
  label: string;
};

export type BlogFaqItem = {
  question: string;
  answer: string;
};

export type BlogDisciplineCta = {
  href: string;
  nameEs: string;
  nameEn: string;
  image: string;
  blurbEs: string;
  blurbEn: string;
};

export function localizedHref(locale: string, href: string): string {
  if (!href.startsWith("/")) return href;
  if (href === "/es" || href === "/en" || href.startsWith("/es/") || href.startsWith("/en/")) {
    return href;
  }
  return `/${locale}${href}`;
}

export function slugifyHeading(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || "seccion";
}

export function headingIdFor(label: string, seen: Map<string, number>): string {
  let id = slugifyHeading(label);
  const count = (seen.get(id) || 0) + 1;
  seen.set(id, count);
  if (count > 1) id = `${id}-${count}`;
  return id;
}

export function headingsFromMarkdown(content: string): BlogTocItem[] {
  const seen = new Map<string, number>();
  const items: BlogTocItem[] = [];
  for (const line of content.split("\n")) {
    if (!line.startsWith("## ") || line.startsWith("### ")) continue;
    const label = line.slice(3).trim();
    if (!label) continue;
    items.push({ id: headingIdFor(label, seen), label });
  }
  return items;
}

function looksLikeQuestion(text: string): boolean {
  return /[¿?]/.test(text);
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^>\s?/, "")
    .trim();
}

export function faqFromMarkdown(content: string): BlogFaqItem[] {
  const lines = content.split("\n");
  const items: BlogFaqItem[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith("## ") || line.startsWith("### ")) continue;
    const question = line.slice(3).trim();
    if (!looksLikeQuestion(question)) continue;
    const answerParts: string[] = [];
    let cursor = index + 1;
    while (
      cursor < lines.length &&
      !lines[cursor].startsWith("## ") &&
      !lines[cursor].startsWith("### ")
    ) {
      const next = stripMarkdown(lines[cursor]);
      if (next) answerParts.push(next);
      cursor += 1;
    }
    const answer = answerParts.join(" ").trim();
    if (answer) items.push({ question, answer });
  }
  return items;
}

export function parseExploraScore(raw: string | number | undefined): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.min(5, Math.max(0, raw));
  }
  if (!raw) return 0;
  const normalized = String(raw).replace(",", ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(?:\/|de|out of)?\s*5/i);
  const value = Number(match?.[1] ?? normalized.match(/(\d+(?:\.\d+)?)/)?.[1] ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.min(5, Math.max(0, value));
}

const DISCIPLINE_RULES: Array<{ test: RegExp; id: MainDisciplineId }> = [
  { test: /snowboard|tabla/i, id: "snowboard" },
  { test: /telemark/i, id: "telemark" },
  { test: /adaptado|adaptive/i, id: "esqui-adaptado" },
  { test: /niñ|kids|famil/i, id: "ninos" },
  { test: /esqui|ski|freeride|freestyle|gafa|casco|baston|bota/i, id: "esqui" },
];

export function inferBlogDiscipline(text: string): BlogDisciplineCta {
  const match = DISCIPLINE_RULES.find((rule) => rule.test.test(text));
  const id = match?.id ?? "esqui";
  const discipline = getDisciplineBySlug(id);
  const hasSnow = /snowboard|tabla/i.test(text);
  const hasSki = /esqui|ski/i.test(text);
  const mixedSkiSnow =
    hasSnow && hasSki && !/telemark|adaptado|niñ|kids|famil/i.test(text);
  const href = mixedSkiSnow ? "/clases" : `/clases/${id}`;
  const nameEs = mixedSkiSnow ? "esquí y snowboard" : discipline?.nameEs ?? "Esquí alpino";
  const nameEn = mixedSkiSnow ? "ski and snowboard" : discipline?.nameEn ?? "Alpine skiing";
  const freeride = /freeride|fuera de pista/i.test(text);

  return {
    href,
    nameEs: freeride && !mixedSkiSnow ? "freeride" : nameEs,
    nameEn: freeride && !mixedSkiSnow ? "freeride" : nameEn,
    image: discipline?.image ?? "/images/stock/discipline-esqui-pista.jpg",
    blurbEs: freeride
      ? "Si este material es para fuera de pista, ven con un instructor que conoce la nieve de Sierra Nevada."
      : mixedSkiSnow
        ? "Da el salto de la guía a la nieve: clases de esquí y snowboard con Explora en Sierra Nevada."
        : "Prueba el material en nieve real: clases con instructores de Explora en Sierra Nevada.",
    blurbEn: freeride
      ? "If this gear is for off-piste, come with an instructor who knows Sierra Nevada snow."
      : mixedSkiSnow
        ? "Take the guide onto the snow: ski and snowboard lessons with Explora in Sierra Nevada."
        : "Try the gear on real snow: lessons with Explora instructors in Sierra Nevada.",
  };
}
