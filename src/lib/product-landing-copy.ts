import { getProductBySlug, type Product } from "@/data/products";
import { pickLocale } from "@/lib/locale";
import { getProductOfferRange, type ProductOfferRange } from "@/lib/product-offer";
import type { IndexableProductId } from "@/lib/seo-urls";

const SEO_TITLE: Record<IndexableProductId, { es: string; en: string }> = {
  "full-day": {
    es: "Full Day en Sierra Nevada",
    en: "Full Day in Sierra Nevada",
  },
  "curso-snow": {
    es: "Curso de snowboard en Sierra Nevada",
    en: "Snowboard course in Sierra Nevada",
  },
  particular: {
    es: "Clases particulares en Sierra Nevada",
    en: "Private lessons in Sierra Nevada",
  },
};

const AUDIENCE: Record<IndexableProductId, { es: string; en: string }> = {
  "full-day": {
    es: "Para quien quiere el mejor precio por hora: un día entero con instructor, de 1 a 8 personas. Esquí, snowboard, telemark o esquí adaptado.",
    en: "For anyone who wants the best hourly rate: a full day with an instructor, for 1 to 8 people. Ski, snowboard, telemark or adaptive ski.",
  },
  "curso-snow": {
    es: "Para grupos que quieren aprender snowboard juntos por la mañana. De 4 a 8 personas, todas las edades. El curso se confirma a partir de 4.",
    en: "For groups who want to learn snowboard together in the morning. From 4 to 8 people, all ages. The course is confirmed from 4 people.",
  },
  particular: {
    es: "Para quien quiere elegir horario y disciplina. De 1 a 8 personas, mínimo 2 horas, todos los niveles y niños desde 3 años.",
    en: "For anyone who wants to choose the time and discipline. Groups of 1 to 8, 2-hour minimum, all levels, and children from age 3.",
  },
};

export function productSeoTitle(locale: string, productId: IndexableProductId): string {
  return pickLocale(locale, SEO_TITLE[productId].es, SEO_TITLE[productId].en);
}

export function productAudience(locale: string, productId: IndexableProductId): string {
  return pickLocale(locale, AUDIENCE[productId].es, AUDIENCE[productId].en);
}

export function formatLessonEuros(amount: number, locale: string): string {
  const rounded = Math.round(amount * 100) / 100;
  const cents = Math.abs(Math.round(rounded * 100) % 100);
  const text =
    cents === 0
      ? String(Math.round(rounded))
      : rounded.toFixed(2).replace(".", locale === "en" ? "." : ",");
  return `${text} €`;
}

export function productPriceRangeCopy(
  locale: string,
  productId: IndexableProductId,
  range: ProductOfferRange,
  minPeople: number,
): string {
  const low = formatLessonEuros(range.lowPrice, locale);
  const high = formatLessonEuros(range.highPrice, locale);

  if (productId === "curso-snow") {
    const perPerson = formatLessonEuros(range.lowPrice / minPeople, locale);
    return pickLocale(
      locale,
      `Grupo de 4 personas: ${low} (${perPerson} / persona). Hasta 8 personas: ${high}. IVA incluido.`,
      `Group of 4: ${low} (${perPerson} / person). Up to 8 people: ${high}. VAT included.`,
    );
  }

  if (productId === "particular") {
    return pickLocale(
      locale,
      `El total del grupo va de ${low} a ${high} según la duración y el número de personas. IVA incluido.`,
      `The group total runs from ${low} to ${high} depending on duration and group size. VAT included.`,
    );
  }

  return pickLocale(
    locale,
    `El total del día va de ${low} a ${high} según el número de personas. IVA incluido.`,
    `The day total runs from ${low} to ${high} depending on group size. VAT included.`,
  );
}

/** Text next to the price. Same string goes into Product JSON-LD. */
export function productOfferSummary(locale: string, productId: IndexableProductId): string {
  const product = getProductBySlug(productId);
  const range = getProductOfferRange(productId);
  if (!product || !range) return "";
  const summary = pickLocale(locale, product.shortDescriptionEs, product.shortDescriptionEn);
  const rangeCopy = productPriceRangeCopy(locale, productId, range, product.minPeople ?? 1);
  return `${summary} ${rangeCopy}`;
}

export function productMetaDescription(locale: string, productId: IndexableProductId): string {
  const range = getProductOfferRange(productId);
  const from = range ? formatLessonEuros(range.lowPrice, locale) : "";

  if (productId === "curso-snow" && range) {
    const perPerson = formatLessonEuros(range.lowPrice / 4, locale);
    return pickLocale(
      locale,
      `Curso de snowboard en Sierra Nevada desde ${from} (4 personas, ${perPerson} / persona). Mañanas de 10:00 a 13:00. IVA incluido.`,
      `Snowboard course in Sierra Nevada from ${from} (4 people, ${perPerson} / person). Mornings from 10:00 to 13:00. VAT included.`,
    );
  }

  if (productId === "particular") {
    return pickLocale(
      locale,
      `Clases particulares en Sierra Nevada desde ${from} (2 h). De 1 a 8 personas y horario a elegir. IVA incluido.`,
      `Private lessons in Sierra Nevada from ${from} (2 h). Groups of 1 to 8 and a time you choose. VAT included.`,
    );
  }

  return pickLocale(
    locale,
    `Full Day en Sierra Nevada desde ${from} el día, con 5 h de clase. De 1 a 8 personas. Esquí, snowboard y telemark. IVA incluido.`,
    `Full Day in Sierra Nevada from ${from} a day, with 5 h of teaching. Groups of 1 to 8. Ski, snowboard and telemark. VAT included.`,
  );
}

export function productIncludeLines(product: Product, locale: string): string[] {
  const lines = pickLocale(locale, product.featuresEs, product.featuresEn);
  return lines.filter((line) => !/^(Desde |From )/i.test(line) && !line.includes("€"));
}
