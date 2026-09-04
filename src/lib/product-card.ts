import type { Product } from "@/data/products";
import { pickLocale } from "@/lib/locale";
import { FULL_DAY_HOURLY_EUR } from "@/lib/lesson-pricing";

export function productFacts(product: Product, locale: string): string[] {
  const people = peopleBit(product, locale);

  switch (product.id) {
    case "full-day":
      return pickLocale(locale, ["5 h de clase", people], ["5 h teaching", people]);
    case "particular":
      return pickLocale(locale, ["Mín. 2 h", people], ["Min. 2 h", people]);
    case "curso-empresa":
      return pickLocale(
        locale,
        ["2–5 días", "10:00–16:00", people],
        ["2–5 days", "10:00 am–4:00 pm", people],
      );
    default:
      break;
  }

  const parts: string[] = [];
  if (product.hours) parts.push(`${product.hours} h`);
  const schedule = pickLocale(locale, product.scheduleEs ?? "", product.scheduleEn ?? "").trim();
  if (schedule) parts.push(schedule.replace(/\s+–\s+/g, "–"));
  if (people) parts.push(people);
  return parts;
}

export function productCardHighlights(product: Product, locale: string): string[] {
  switch (product.id) {
    case "full-day":
      return pickLocale(
        locale,
        ["Recogida y entrega en hotel", "1 h de comodín (comidas y retrasos)", "1 y 2 personas pagan lo mismo"],
        ["Hotel pick-up and drop-off", "1 h buffer (meals and delays)", "1 and 2 people pay the same"],
      );
    case "particular":
      return pickLocale(
        locale,
        ["Tú eliges hora y disciplina", "Todos los niveles, desde 3 años", "1 y 2 personas pagan lo mismo"],
        ["You choose time and discipline", "All levels, from age 3", "1 and 2 people pay the same"],
      );
    case "medio-dia":
      return pickLocale(
        locale,
        ["Punto de encuentro en la estación", "Esquí, snowboard o telemark", "1 y 2 personas pagan lo mismo"],
        ["Meeting point at the resort", "Ski, snowboard or telemark", "1 and 2 people pay the same"],
      );
    case "curso-snow":
      return pickLocale(
        locale,
        ["Precio por persona", "Grupo reducido, máximo 8", "Snowboard, todas las edades"],
        ["Price per person", "Small group, max. 8", "Snowboard, all ages"],
      );
    case "curso-empresa":
      return pickLocale(
        locale,
        ["+25 €/día a partir de la 3.ª persona", "Esquí, snowboard o telemark", "Máximo 8 personas"],
        ["+€25/day from the 3rd person", "Ski, snowboard or telemark", "Maximum 8 people"],
      );
    default:
      return [];
  }
}

export function productPricePrefix(product: Product, locale: string): string | undefined {
  if (product.id === "curso-snow") return undefined;
  return pickLocale(locale, "desde ", "from ");
}

export function productPriceSuffix(product: Product, locale: string): string | undefined {
  if (product.id === "curso-snow") {
    return pickLocale(locale, " / persona", " / person");
  }
  if (product.category === "full-day" || product.id === "curso-empresa") {
    return pickLocale(locale, " / día", " / day");
  }
  return undefined;
}

export function productHourlyHook(product: Product, locale: string): string | null {
  if (product.category !== "full-day") return null;
  return pickLocale(
    locale,
    `${FULL_DAY_HOURLY_EUR} €/h`,
    `€${FULL_DAY_HOURLY_EUR}/h`,
  );
}

function peopleBit(product: Product, locale: string): string {
  const min = product.minPeople ?? 1;
  const max = product.maxPeople ?? 8;
  return pickLocale(locale, `${min}–${max} pers.`, `${min}–${max} people`);
}

export function productImageAlt(product: Product, locale: string): string {
  switch (product.id) {
    case "full-day":
      return pickLocale(
        locale,
        "Clase de día completo de esquí en Sierra Nevada",
        "Full-day ski lesson in Sierra Nevada",
      );
    case "particular":
      return pickLocale(
        locale,
        "Clase particular de esquí en Sierra Nevada",
        "Private ski lesson in Sierra Nevada",
      );
    case "medio-dia":
      return pickLocale(
        locale,
        "Clases de medio día en las pistas de Sierra Nevada",
        "Half-day lessons on the Sierra Nevada slopes",
      );
    case "curso-snow":
      return pickLocale(
        locale,
        "Grupo de snowboard en un curso en Sierra Nevada",
        "Snowboard group on a course in Sierra Nevada",
      );
    case "curso-empresa":
      return pickLocale(
        locale,
        "Curso de esquí de varios días en Sierra Nevada",
        "Multi-day ski course in Sierra Nevada",
      );
    default:
      return pickLocale(
        locale,
        `${product.titleEs} en Sierra Nevada`,
        `${product.titleEn} in Sierra Nevada`,
      );
  }
}
