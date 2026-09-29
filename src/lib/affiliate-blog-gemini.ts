import { GoogleGenAI, ThinkingLevel, type Part } from "@google/genai";
import { blogPosts } from "@/data/blog";
import { getCredentialParts } from "@/lib/firebase/admin";
import {
  ensureUniqueAffiliateSlug,
  saveAffiliatePost,
  type AffiliateBlogPost,
} from "@/lib/affiliate-blog";
import {
  emptyProductImage,
  primaryProductImage,
  productGallery,
  withPrimaryImage,
  type AffiliateProduct,
  type AffiliateProductImage,
  type AffiliateSection,
  type AffiliateSpec,
} from "@/lib/affiliate-blog-shared";
import { formatAmazonBrief, type AmazonProductMeta } from "@/lib/amazon-product-meta";

const MODELS = ["gemini-3.5-flash-lite"];
const LOCATIONS = ["eu", "global", "us"];
const REQUEST_TIMEOUT_MS = 110_000;

const INTERNAL_HREFS = [
  "/clases",
  "/tarifas",
  "/clases/esqui",
  "/clases/snowboard",
  "/clases/telemark",
  "/reserva",
  "/club",
  "/como-llegar",
  "/contacto",
];

const VOICE_ES = `Voz:
- Español de España. Tono de instructor que ha visto el material en nieve real de Sierra Nevada, no de marketplace.
- Nunca digas que Explora vende el producto. Explora da clases; Amazon es la compra.
- No inventes precios, valoraciones ni número de opiniones. Si el dato Amazon está vacío, deja el campo vacío.
- No uses "el mejor del mundo", "imprescindible", "revolucionario".
- Alts: describe color, tipo de producto y uso en nieve. Nunca "imagen de producto".`;

const VOICE_EN = `Voz:
- Inglés británico (en-GB). Redacción independiente, no una traducción calcada palabra a palabra.
- Tono de instructor en Sierra Nevada, no de marketplace.
- Nunca digas que Explora vende el producto. Explora da clases; Amazon es la compra.
- No inventes precios, valoraciones ni número de opiniones. No añadas datos que no estén en el español de origen.
- No uses "the best in the world", "must-have", "revolutionary".
- Alts: describe colour, product type and use on snow. Never "product image".`;

const SHELL_FIELDS = [
  { base: "intro", minWords: 240, minParagraphs: 3 },
  { base: "methodology", minWords: 90, minParagraphs: 1 },
  { base: "howToChoose", minWords: 140, minParagraphs: 1 },
  { base: "verdict", minWords: 50, minParagraphs: 1 },
  { base: "instructorNote", minWords: 40, minParagraphs: 1 },
] as const;

const PRODUCT_PROSE = [
  { base: "summary", minWords: 40, minParagraphs: 1 },
  { base: "body", minWords: 180, minParagraphs: 2 },
  { base: "onSnow", minWords: 50, minParagraphs: 1 },
  { base: "forWhom", minWords: 12, minParagraphs: 1 },
  { base: "skipIf", minWords: 8, minParagraphs: 1 },
] as const;

type Lang = "es" | "en";
type JsonRecord = Record<string, unknown>;

type GeminiResponse = {
  text?: string;
  candidates?: Array<{
    finishReason?: string;
    content?: { parts?: Array<{ text?: string; thought?: boolean }> };
  }>;
  usageMetadata?: {
    thoughtsTokenCount?: number;
    candidatesTokenCount?: number;
  };
};

function editorialGuide(): string {
  return blogPosts
    .slice(0, 12)
    .map((post) => `- /blog/${post.slug} — ${post.titleEs}`)
    .join("\n");
}

function getVertexClient(location: string) {
  const creds = getCredentialParts();
  if (!creds) throw new Error("unavailable");
  return new GoogleGenAI({
    vertexai: true,
    project: creds.projectId,
    location,
    googleAuthOptions: {
      credentials: {
        client_email: creds.clientEmail,
        private_key: creds.privateKey,
      },
      projectId: creds.projectId,
    },
  });
}

async function imagePartFromUrl(url: string): Promise<Part | null> {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return null;
    const mime = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
    if (!mime.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 80 || buf.length > 8 * 1024 * 1024) return null;
    return { inlineData: { mimeType: mime, data: buf.toString("base64") } };
  } catch {
    return null;
  }
}

function extractJsonObject(raw: string): JsonRecord {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("generate_failed");
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as JsonRecord;
  } catch {
    console.error("[affiliate-gemini] invalid json", trimmed.slice(0, 160), trimmed.slice(-160));
    throw new Error("generate_failed");
  }
}

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value.trim();
  return typeof fallback === "string" ? fallback : "";
}

function asStringArray(value: unknown, max = 5): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, max);
}

function langKey(base: string, lang: Lang): string {
  return `${base}${lang === "es" ? "Es" : "En"}`;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function paragraphCount(value: string): number {
  return value
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean).length;
}

function parseSpecs(value: unknown): AffiliateSpec[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = asRecord(row);
      return {
        labelEs: asString(item.labelEs),
        labelEn: asString(item.labelEn),
        valueEs: asString(item.valueEs),
        valueEn: asString(item.valueEn),
      };
    })
    .filter((item) => item.labelEs || item.labelEn)
    .slice(0, 10);
}

function metaFromStoredProduct(product: AffiliateProduct): AmazonProductMeta {
  const gallery = productGallery(product);
  return {
    url: product.affiliateUrl,
    asin: product.asin,
    title: product.nameEs || product.nameEn,
    brand: product.brand,
    image: primaryProductImage(product),
    images: gallery.map((image) => image.src).filter(Boolean),
    priceText: product.priceText,
    rating: product.rating,
    reviewCount: product.reviewCount,
    bullets: (product.amazonBullets ?? []).slice(0, 8),
    description: (product.amazonDescription || "").slice(0, 800),
    specs: product.specs.slice(0, 8).map((spec) => ({
      label: spec.labelEs || spec.labelEn,
      value: spec.valueEs || spec.valueEn,
    })),
  };
}

function jsonTextFromResponse(response: GeminiResponse): string {
  const fromParts =
    response.candidates?.[0]?.content?.parts
      ?.filter((part) => !part.thought && part.text)
      .map((part) => part.text || "")
      .join("") ?? "";
  return (response.text || fromParts).trim();
}

function parseGeneratedJson(raw: string): JsonRecord | null {
  if (!raw.trim()) return null;
  try {
    return extractJsonObject(raw);
  } catch {
    return null;
  }
}

function productBatches(count: number): number[][] {
  if (count <= 0) return [];
  if (count <= 3) return [Array.from({ length: count }, (_, index) => index)];
  const mid = Math.ceil(count / 2);
  return [
    Array.from({ length: mid }, (_, index) => index),
    Array.from({ length: count - mid }, (_, index) => mid + index),
  ];
}

function productBriefFor(
  post: AffiliateBlogPost,
  metas: AmazonProductMeta[],
  indexes: number[],
): string {
  return indexes
    .map((index) => {
      const product = post.products[index];
      const gallery = productGallery(product);
      return [
        `=== Producto ${index} ===`,
        `URL afiliado Explora: ${product.affiliateUrl}`,
        `Fotos en galería (${gallery.length}): ${gallery.map((image) => image.src).join(" | ")}`,
        formatAmazonBrief(metas[index]),
      ].join("\n");
    })
    .join("\n\n");
}

function kindLabel(post: AffiliateBlogPost): string {
  return post.type === "ranking"
    ? `ranking comparativo de exactamente ${post.products.length} productos`
    : "review profunda de 1 producto";
}

function outlineBrief(outline: JsonRecord, post: AffiliateBlogPost): string {
  const products = Array.isArray(outline.products) ? outline.products : [];
  const lines = post.products.map((product, index) => {
    const item = asRecord(products[index]);
    const name = asString(item.nameEs, product.nameEs || product.nameEn);
    const role = asString(item.pickRoleEs);
    const brand = asString(item.brand, product.brand);
    return `${index}. ${name} — ${role || "sin rol"} (${brand})`;
  });
  const headings = (Array.isArray(outline.sections) ? outline.sections : []).map((row, index) => {
    return `${index}. ${asString(asRecord(row).headingEs)}`;
  });
  const questions = (Array.isArray(outline.faq) ? outline.faq : []).map((row, index) => {
    return `${index}. ${asString(asRecord(row).qEs)}`;
  });
  return [
    `Título: ${asString(outline.titleEs)}`,
    `Extracto: ${asString(outline.excerptEs)}`,
    `Nota Explora: ${asString(String(outline.score ?? ""))}`,
    `Ganador (índice): ${asString(String(outline.winnerIndex ?? ""))}`,
    `Mejor de la tarjeta: ${asString(outline.tldrBestEs)}`,
    `Peor de la tarjeta: ${asString(outline.tldrWorstEs)}`,
    `Productos:\n${lines.join("\n")}`,
    headings.filter((line) => !line.endsWith(". ")).length
      ? `Secciones ya decididas:\n${headings.join("\n")}`
      : "Secciones: aún no hay titulares; crea 2.",
    questions.filter((line) => !line.endsWith(". ")).length
      ? `Preguntas FAQ ya decididas:\n${questions.join("\n")}`
      : "FAQ: aún no hay preguntas; crea 6.",
  ].join("\n");
}

async function requestJson(
  parts: Part[],
  thinking: ThinkingLevel,
  label: string,
): Promise<JsonRecord> {
  let lastError: unknown;
  for (const location of LOCATIONS) {
    for (const model of MODELS) {
      try {
        const ai = getVertexClient(location);
        const response = (await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: {
            responseMimeType: "application/json",
            maxOutputTokens: 65536,
            abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            thinkingConfig: {
              thinkingLevel: thinking,
              includeThoughts: false,
            },
          },
        })) as GeminiResponse;
        const finishReason = response.candidates?.[0]?.finishReason;
        const text = jsonTextFromResponse(response);
        console.info(
          `[affiliate-gemini] ${label} ${location}/${model} finish=${finishReason || "unknown"} thoughts=${response.usageMetadata?.thoughtsTokenCount ?? 0} out=${response.usageMetadata?.candidatesTokenCount ?? 0}`,
        );
        if (finishReason && finishReason !== "STOP") {
          console.warn(`[affiliate-gemini] ${label} ${location}/${model} finishReason=${finishReason}`);
        }
        const json = text ? parseGeneratedJson(text) : null;
        if (json) return json;
        console.warn(`[affiliate-gemini] ${label} ${location}/${model} invalid json`);
      } catch (error) {
        lastError = error;
        console.warn(`[affiliate-gemini] ${label} ${location}/${model} failed:`, error);
      }
    }
  }
  console.error(`[affiliate-gemini] ${label} failed:`, lastError);
  throw new Error("generate_failed");
}

async function requestJsonWithVision(
  prompt: string,
  images: Part[],
  thinking: ThinkingLevel,
  label: string,
): Promise<JsonRecord> {
  try {
    return await requestJson([{ text: prompt }, ...images], thinking, label);
  } catch (error) {
    if (!images.length) throw error;
    console.warn(`[affiliate-gemini] ${label} retrying without vision images`);
    return requestJson([{ text: prompt }], thinking, `${label}-novision`);
  }
}

function preferText(current: string, next: string, minWords: number, minParagraphs: number): string {
  if (!next.trim()) return current;
  const nextOk = wordCount(next) >= minWords && paragraphCount(next) >= minParagraphs;
  const currentOk = wordCount(current) >= minWords && paragraphCount(current) >= minParagraphs;
  if (nextOk && !currentOk) return next;
  if (currentOk && !nextOk) return current;
  return wordCount(next) >= wordCount(current) ? next : current;
}

function preferList(current: string[], next: string[], min: number): string[] {
  if (!next.length) return current;
  if (next.length >= min && current.length < min) return next;
  if (current.length >= min && next.length < min) return current;
  return next.length >= current.length ? next : current;
}

function proseMin(base: string): { minWords: number; minParagraphs: number } {
  const shell = SHELL_FIELDS.find((field) => field.base === base);
  if (shell) return shell;
  const product = PRODUCT_PROSE.find((field) => field.base === base);
  if (product) return product;
  return { minWords: 1, minParagraphs: 1 };
}

function buildOutlinePrompt(post: AffiliateBlogPost, brief: string): string {
  const ranking = post.type === "ranking";
  return `Eres editor senior de Explora School & Club (escuela de esquí, snowboard y telemark en Sierra Nevada, Granada). Esta fase solo DECIDE el artículo. No redactes cuerpos largos.

Tarea: juicio de ${kindLabel(post)}. Devuelve SOLO un JSON válido, sin markdown ni comentarios.

${VOICE_ES}

Reglas de esta fase:
- slug kebab-case español, corto (máx. 60). Ranking: mejores-{categoria}-esqui-sierra-nevada. Review: {categoria}-{marca}-{modelo}. Sin "review", SKU ni "los-mejores".
- score: nota Explora de 1 a 5 con un decimal (ej. 4.3). Juicio de instructor en Sierra Nevada.
- tldrBestEs y tldrWorstEs: una frase corta (máx. 18 palabras).
- excerptEs: 1 o 2 frases que abran la guía.
- seoTitleEs máx. 60 caracteres. seoDescriptionEs máx. 155 caracteres.
${
  ranking
    ? `- pickRoleEs es una etiqueta corta y distinta por producto: Nuestra elección, Finalista, Mejor calidad-precio, Para principiantes, Para nieve dura, Si buscas ligereza. winnerIndex coincide con "Nuestra elección".
- comparison: 6 filas útiles (uso, nivel, peso/talla si se conoce, clima, precio si hay dato, veredicto corto). values: un string por producto, mismo orden. Sin relleno.
- alternatives: [].`
    : `- winnerIndex: 0. pickRoleEs: "Nuestra elección". comparison: [].
- alternatives: 2 o 3 salidas honestas si el producto no encaja (clase Explora, alquiler, otro uso). href solo de la lista permitida. No inventes URLs de Amazon.`
}
- sections: 2 titulares (headingEs), por ejemplo qué mirar antes de comprar y errores habituales. Sin body.
- faq: 6 preguntas útiles (talla, clima, clases vs comprar, mantenimiento, alternativas). Solo qEs, sin respuesta.
- internalLinks: mínimo 3 href reales de esta lista (pathnames internos, nunca /es/...):
${INTERNAL_HREFS.map((href) => `  ${href}`).join("\n")}
- relatedSlugs: 1–3 slugs reales de la lista editorial.
${editorialGuide()}

JSON:
{
  "slug": "",
  "titleEs": "",
  "excerptEs": "",
  "coverAltEs": "",
  "score": 4.3,
  "tldrBestEs": "",
  "tldrWorstEs": "",
  "seoTitleEs": "",
  "seoDescriptionEs": "",
  "winnerIndex": 0,
  "products": [{ "nameEs": "", "brand": "", "pickRoleEs": "" }],
  "comparison": [{ "labelEs": "", "values": ["uno por producto"] }],
  "sections": [{ "headingEs": "" }],
  "faq": [{ "qEs": "" }],
  "alternatives": [{ "titleEs": "", "whyEs": "", "href": "/clases/esqui" }],
  "internalLinks": [{ "href": "/clases", "labelEs": "" }],
  "relatedSlugs": ["slug-editorial"]
}

El array products tiene exactamente ${post.products.length} objetos, en el mismo orden de la ficha.

Ficha Amazon (fuente de verdad; no contradigas estos datos):
${brief}`;
}

function buildShellPrompt(post: AffiliateBlogPost, judgment: string): string {
  return `Eres editor senior de Explora School & Club. Esta fase redacta SOLO el español del cuerpo del artículo. El juicio ya está cerrado: no cambies ganador, nota ni roles.

Tarea: ${kindLabel(post)}. Devuelve SOLO un JSON válido.

${VOICE_ES}

Longitud mínima:
- introEs: 3 o 4 párrafos separados por \\n\\n (80–140 palabras cada párrafo).
- methodologyEs: 90–140 palabras. Cómo se juzga el material en Sierra Nevada, sin fingir un laboratorio.
- howToChooseEs: 140–220 palabras (talla, clima Sierra Nevada, nivel, presupuesto).
- verdictEs: 50–90 palabras. En ranking, nombra al ganador y un runner-up.
- instructorNoteEs: consejo de pista, 40–80 palabras (talla, hielo, viento, forfait).
- sections: un bodyEs por cada titular ya decidido, en el mismo orden. Cada body 80–140 palabras. Si no hay titulares, crea 2 con headingEs y bodyEs.
- faq: una aEs por cada pregunta ya decidida, en el mismo orden. Cada respuesta 40–80 palabras. Si no hay preguntas, crea 6 con qEs y aEs.

Juicio cerrado:
${judgment}

JSON:
{
  "introEs": "",
  "methodologyEs": "",
  "howToChooseEs": "",
  "verdictEs": "",
  "instructorNoteEs": "",
  "sections": [{ "bodyEs": "" }],
  "faq": [{ "aEs": "" }]
}`;
}

function buildProductPrompt(
  post: AffiliateBlogPost,
  indexes: number[],
  judgment: string,
  brief: string,
  attached: number[],
): string {
  const imageNote = attached.length
    ? `Imágenes adjuntas, en este orden de productos: ${attached.join(", ")}. La primera foto de cada uno de esos índices va pegada al mensaje. El resto de la galería no se ve: descríbela como detalle del mismo producto sin inventar colores que no aparezcan.`
    : "No hay fotos adjuntas. No inventes colores concretos.";
  return `Eres editor senior de Explora School & Club. Esta fase redacta SOLO el español de estos productos. El juicio ya está cerrado.

Tarea: fichas de los productos ${indexes.join(", ")} dentro de ${kindLabel(post)}. Devuelve SOLO un JSON válido.

${VOICE_ES}
${imageNote}

Longitud mínima por producto:
- summaryEs: 40–60 palabras.
- bodyEs: 180–280 palabras en 2–3 párrafos separados por \\n\\n.
- onSnowEs: 50–90 palabras (pistas, hielo, viento de Sierra Nevada).
- forWhomEs y skipIfEs: concretos, no genéricos.
- prosEs y consEs: 3 cada uno.
- specs: solo datos que estén en la ficha Amazon. Si no hay dato, omite la fila.
- images: un objeto por cada foto de la galería, en el mismo orden de las URLs.
- ctaLabelEs: acción concreta. Ej. "Comprobar talla y precio en Amazon".
- Incluye "index" con el índice indicado. No reordenes.

Juicio cerrado:
${judgment}

JSON:
{
  "products": [{
    "index": 0,
    "nameEs": "",
    "brand": "",
    "priceText": "",
    "rating": "",
    "reviewCount": "",
    "summaryEs": "",
    "bodyEs": "",
    "onSnowEs": "",
    "forWhomEs": "",
    "skipIfEs": "",
    "specs": [{ "labelEs": "", "valueEs": "" }],
    "prosEs": ["", "", ""],
    "consEs": ["", "", ""],
    "altEs": "",
    "captionEs": "",
    "images": [{ "altEs": "", "captionEs": "" }],
    "ctaLabelEs": "Comprobar talla y precio en Amazon"
  }]
}

Ficha Amazon:
${brief}`;
}

function spanishArticleSource(outline: JsonRecord, shell: JsonRecord): string {
  const headings = Array.isArray(outline.sections) ? outline.sections : [];
  const bodies = Array.isArray(shell.sections) ? shell.sections : [];
  const questions = Array.isArray(outline.faq) ? outline.faq : [];
  const answers = Array.isArray(shell.faq) ? shell.faq : [];
  const sectionCount = Math.max(headings.length, bodies.length);
  const faqCount = Math.max(questions.length, answers.length);
  return JSON.stringify(
    {
      titleEs: asString(outline.titleEs),
      excerptEs: asString(outline.excerptEs),
      coverAltEs: asString(outline.coverAltEs),
      tldrBestEs: asString(outline.tldrBestEs),
      tldrWorstEs: asString(outline.tldrWorstEs),
      seoTitleEs: asString(outline.seoTitleEs),
      seoDescriptionEs: asString(outline.seoDescriptionEs),
      introEs: asString(shell.introEs),
      methodologyEs: asString(shell.methodologyEs),
      howToChooseEs: asString(shell.howToChooseEs),
      verdictEs: asString(shell.verdictEs),
      instructorNoteEs: asString(shell.instructorNoteEs),
      sections: Array.from({ length: sectionCount }, (_, index) => ({
        headingEs: asString(asRecord(headings[index]).headingEs) || asString(asRecord(bodies[index]).headingEs),
        bodyEs: asString(asRecord(bodies[index]).bodyEs),
      })),
      faq: Array.from({ length: faqCount }, (_, index) => ({
        qEs: asString(asRecord(questions[index]).qEs) || asString(asRecord(answers[index]).qEs),
        aEs: asString(asRecord(answers[index]).aEs),
      })),
      comparison: Array.isArray(outline.comparison) ? outline.comparison : [],
      alternatives: Array.isArray(outline.alternatives) ? outline.alternatives : [],
      internalLinks: Array.isArray(outline.internalLinks) ? outline.internalLinks : [],
    },
    null,
    2,
  );
}

function buildEnglishShellPrompt(source: string, ranking: boolean): string {
  return `Eres editor senior de Explora School & Club. Esta fase adapta al inglés británico el cuerpo ya escrito en español. No cambies hechos, ganador, nota ni href.

${VOICE_EN}

Longitud mínima, equivalente a la del español:
- introEn: 3 o 4 párrafos separados por \\n\\n (80–140 palabras cada uno).
- methodologyEn: 90–140 palabras.
- howToChooseEn: 140–220 palabras.
- verdictEn: 50–90 palabras.
- instructorNoteEn: 40–80 palabras.
- Cada bodyEn: 80–140 palabras. Cada aEn: 40–80 palabras.
- slugEn kebab-case inglés (best-{category}-ski-sierra-nevada o {category}-{brand}-{model}). Sin "review".
- tldrBestEn y tldrWorstEn: máx. 18 palabras.
- seoTitleEn máx. 60 caracteres. seoDescriptionEn máx. 155 caracteres.
- sections, faq, alternatives e internalLinks: el mismo número y el mismo orden. Los href no se traducen.
${ranking ? "- comparison: solo labelEn, mismo orden. No cambies values; no los incluyas." : "- comparison: []."}

Devuelve SOLO un JSON válido:
{
  "slugEn": "",
  "titleEn": "",
  "excerptEn": "",
  "coverAltEn": "",
  "tldrBestEn": "",
  "tldrWorstEn": "",
  "seoTitleEn": "",
  "seoDescriptionEn": "",
  "introEn": "",
  "methodologyEn": "",
  "howToChooseEn": "",
  "verdictEn": "",
  "instructorNoteEn": "",
  "sections": [{ "headingEn": "", "bodyEn": "" }],
  "faq": [{ "qEn": "", "aEn": "" }],
  "comparison": [{ "labelEn": "" }],
  "alternatives": [{ "titleEn": "", "whyEn": "", "href": "" }],
  "internalLinks": [{ "href": "", "labelEn": "" }]
}

Español de origen:
${source}`;
}

function spanishProductSource(
  post: AffiliateBlogPost,
  outline: JsonRecord,
  products: Map<number, JsonRecord>,
): string {
  const outlineProducts = Array.isArray(outline.products) ? outline.products : [];
  return JSON.stringify(
    post.products.map((product, index) => {
      const es = products.get(index) ?? {};
      const decided = asRecord(outlineProducts[index]);
      return {
        index,
        nameEs: asString(es.nameEs, asString(decided.nameEs, product.nameEs)),
        brand: asString(es.brand, asString(decided.brand, product.brand)),
        pickRoleEs: asString(decided.pickRoleEs, asString(es.pickRoleEs)),
        summaryEs: asString(es.summaryEs),
        bodyEs: asString(es.bodyEs),
        onSnowEs: asString(es.onSnowEs),
        forWhomEs: asString(es.forWhomEs),
        skipIfEs: asString(es.skipIfEs),
        prosEs: asStringArray(es.prosEs, 4),
        consEs: asStringArray(es.consEs, 4),
        specs: Array.isArray(es.specs) ? es.specs : [],
        altEs: asString(es.altEs),
        captionEs: asString(es.captionEs),
        images: Array.isArray(es.images) ? es.images : [],
        ctaLabelEs: asString(es.ctaLabelEs),
      };
    }),
    null,
    2,
  );
}

function buildEnglishProductsPrompt(source: string): string {
  return `Eres editor senior de Explora School & Club. Adapta al inglés británico las fichas de producto ya escritas en español. Mismo orden, mismos hechos.

${VOICE_EN}

Longitud mínima por producto:
- summaryEn: 40–60 palabras.
- bodyEn: 180–280 palabras en 2–3 párrafos separados por \\n\\n.
- onSnowEn: 50–90 palabras.
- forWhomEn y skipIfEn: concretos.
- prosEn y consEn: 3 cada uno.
- specs: labelEn y valueEn en el mismo orden. Cifras, tallas y marcas se quedan igual.
- images: un objeto por cada foto, en el mismo orden.
- pickRoleEn: equivalente corto del pickRoleEs (Our pick, Runner-up, Best value, For beginners, For hard snow, If you want it light).
- ctaLabelEn: acción concreta. Ej. "Check size and price on Amazon".
- Incluye index.

Devuelve SOLO un JSON válido:
{
  "products": [{
    "index": 0,
    "nameEn": "",
    "pickRoleEn": "",
    "summaryEn": "",
    "bodyEn": "",
    "onSnowEn": "",
    "forWhomEn": "",
    "skipIfEn": "",
    "specs": [{ "labelEn": "", "valueEn": "" }],
    "prosEn": ["", "", ""],
    "consEn": ["", "", ""],
    "altEn": "",
    "captionEn": "",
    "images": [{ "altEn": "", "captionEn": "" }],
    "ctaLabelEn": "Check size and price on Amazon"
  }]
}

Español de origen:
${source}`;
}

function shortShellIds(shell: JsonRecord, lang: Lang, outline: JsonRecord): string[] {
  const short: string[] = [];
  for (const field of SHELL_FIELDS) {
    const text = asString(shell[langKey(field.base, lang)]);
    if (wordCount(text) < field.minWords || paragraphCount(text) < field.minParagraphs) {
      short.push(field.base);
    }
  }
  const headingCount = Array.isArray(outline.sections) ? outline.sections.length : 0;
  const sectionCount = Math.max(2, headingCount, Array.isArray(shell.sections) ? shell.sections.length : 0);
  const sections = Array.isArray(shell.sections) ? shell.sections : [];
  for (let index = 0; index < sectionCount; index += 1) {
    const body = asString(asRecord(sections[index])[langKey("body", lang)]);
    if (wordCount(body) < 80) short.push(`section:${index}`);
  }
  const questionCount = Array.isArray(outline.faq) ? outline.faq.length : 0;
  const faqCount = Math.max(6, questionCount, Array.isArray(shell.faq) ? shell.faq.length : 0);
  const faq = Array.isArray(shell.faq) ? shell.faq : [];
  for (let index = 0; index < Math.min(faqCount, 8); index += 1) {
    const row = asRecord(faq[index]);
    const answerShort = wordCount(asString(row[langKey("a", lang)])) < 40;
    const questionShort = lang === "en" && wordCount(asString(row.qEn)) < 4;
    if (answerShort || questionShort) short.push(`faq:${index}`);
  }
  return short;
}

function buildShellRetryPrompt(
  shell: JsonRecord,
  lang: Lang,
  outline: JsonRecord,
  shortIds: string[],
  judgment: string,
): string {
  const voice = lang === "es" ? VOICE_ES : VOICE_EN;
  const fields = shortIds.filter((id) => !id.includes(":"));
  const sections = shortIds
    .filter((id) => id.startsWith("section:"))
    .map((id) => Number(id.split(":")[1]));
  const faq = shortIds.filter((id) => id.startsWith("faq:")).map((id) => Number(id.split(":")[1]));
  const current: JsonRecord = {};
  for (const base of fields) current[langKey(base, lang)] = asString(shell[langKey(base, lang)]);
  if (sections.length) {
    current.sections = sections.map((index) => ({
      index,
      heading: asString(asRecord((outline.sections as unknown[] | undefined)?.[index]).headingEs),
      body: asString(asRecord((shell.sections as unknown[] | undefined)?.[index])[langKey("body", lang)]),
    }));
  }
  if (faq.length) {
    current.faq = faq.map((index) => ({
      index,
      q: asString(asRecord((outline.faq as unknown[] | undefined)?.[index])[langKey("q", "es")]) ||
        asString(asRecord((shell.faq as unknown[] | undefined)?.[index])[langKey("q", lang)]),
      a: asString(asRecord((shell.faq as unknown[] | undefined)?.[index])[langKey("a", lang)]),
    }));
  }
  const suffix = lang === "es" ? "Es" : "En";
  const schema: string[] = fields.map((base) => `"${base}${suffix}": ""`);
  if (sections.length) schema.push(`"sections": [{ "index": 0, "body${suffix}": "" }]`);
  if (faq.length) {
    schema.push(
      `"faq": [{ "index": 0, "a${suffix}": ""${lang === "en" ? ', "qEn": ""' : ""} }]`,
    );
  }
  return `El borrador siguiente se quedó corto. Reescribe SOLO los campos listados, en ${lang === "es" ? "español de España" : "inglés británico"}. No toques el resto. Devuelve SOLO JSON.

${voice}

Mínimos: intro 240 palabras y 3 párrafos (\\n\\n); methodology 90; howToChoose 140; verdict 50; instructorNote 40; cada body de sección 80; cada respuesta FAQ 40.

Juicio cerrado:
${judgment}

Texto corto:
${JSON.stringify(current, null, 2)}

JSON con solo lo que falte:
{
  ${schema.join(",\n  ")}
}`;
}

function mergeIndexedBodies(
  currentValue: unknown,
  retryValue: unknown,
  lang: Lang,
  indexes: number[],
  base: "body" | "a",
  minWords: number,
): unknown[] {
  const current = Array.isArray(currentValue) ? currentValue.map(asRecord) : [];
  const retryRows = Array.isArray(retryValue) ? retryValue : [];
  const retryByIndex = new Map<number, JsonRecord>();
  retryRows.forEach((row, position) => {
    const item = asRecord(row);
    const declared = Number(item.index);
    retryByIndex.set(Number.isFinite(declared) ? declared : position, item);
  });
  const max = Math.max(current.length - 1, ...indexes, ...retryByIndex.keys());
  const key = langKey(base, lang);
  const out: JsonRecord[] = [];
  for (let index = 0; index <= max; index += 1) {
    const cur = current[index] ?? {};
    const incoming = retryByIndex.get(index);
    if (!indexes.includes(index) || !incoming) {
      out.push(cur);
      continue;
    }
    const merged: JsonRecord = {
      ...cur,
      [key]: preferText(asString(cur[key]), asString(incoming[key]), minWords, 1),
    };
    if (lang === "en" && base === "a") {
      merged.qEn = preferText(asString(cur.qEn), asString(incoming.qEn), 4, 1);
    }
    out.push(merged);
  }
  return out;
}

async function ensureShellLength(
  shell: JsonRecord,
  lang: Lang,
  outline: JsonRecord,
  judgment: string,
): Promise<JsonRecord> {
  const shortIds = shortShellIds(shell, lang, outline);
  if (!shortIds.length) return shell;
  console.info(`[affiliate-gemini] shell-${lang} short: ${shortIds.join(", ")}`);
  try {
    const retry = await requestJson(
      [{ text: buildShellRetryPrompt(shell, lang, outline, shortIds, judgment) }],
      lang === "es" ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW,
      `shell-${lang}-retry`,
    );
    const next: JsonRecord = { ...shell };
    for (const base of shortIds.filter((id) => !id.includes(":"))) {
      const key = langKey(base, lang);
      const min = proseMin(base);
      next[key] = preferText(asString(shell[key]), asString(retry[key]), min.minWords, min.minParagraphs);
    }
    const sectionIndexes = shortIds
      .filter((id) => id.startsWith("section:"))
      .map((id) => Number(id.split(":")[1]));
    if (sectionIndexes.length) {
      next.sections = mergeIndexedBodies(shell.sections, retry.sections, lang, sectionIndexes, "body", 80);
    }
    const faqIndexes = shortIds
      .filter((id) => id.startsWith("faq:"))
      .map((id) => Number(id.split(":")[1]));
    if (faqIndexes.length) {
      next.faq = mergeIndexedBodies(shell.faq, retry.faq, lang, faqIndexes, "a", 40);
    }
    return next;
  } catch (error) {
    console.warn(`[affiliate-gemini] shell-${lang}-retry failed:`, error);
    return shell;
  }
}

function shortProductFields(product: JsonRecord, lang: Lang): string[] {
  const short: string[] = PRODUCT_PROSE.filter((field) => {
    const text = asString(product[langKey(field.base, lang)]);
    return wordCount(text) < field.minWords || paragraphCount(text) < field.minParagraphs;
  }).map((field) => field.base);
  if (asStringArray(product[langKey("pros", lang)], 4).length < 3) short.push("pros");
  if (asStringArray(product[langKey("cons", lang)], 4).length < 3) short.push("cons");
  return short;
}

function buildProductRetryPrompt(
  products: Map<number, JsonRecord>,
  shortByIndex: Map<number, string[]>,
  lang: Lang,
  judgment: string,
): string {
  const voice = lang === "es" ? VOICE_ES : VOICE_EN;
  const payload = [...shortByIndex.entries()].map(([index, fields]) => {
    const product = products.get(index) ?? {};
    const current: JsonRecord = { index };
    for (const base of fields) {
      const key = langKey(base, lang);
      current[key] = base === "pros" || base === "cons" ? asStringArray(product[key], 4) : asString(product[key]);
    }
    return current;
  });
  return `Estas fichas se quedaron cortas. Reescribe SOLO los campos incluidos de cada producto, en ${lang === "es" ? "español de España" : "inglés británico"}. Mantén el index. Devuelve SOLO JSON.

${voice}

Mínimos: summary 40 palabras; body 180 palabras y 2 párrafos (\\n\\n); onSnow 50; forWhom 12; skipIf 8; pros y cons, 3 cada uno.

Juicio cerrado:
${judgment}

Texto corto:
${JSON.stringify(payload, null, 2)}

JSON:
{ "products": [{ "index": 0 }] }`;
}

function mergeProductRetry(
  current: JsonRecord,
  incoming: JsonRecord,
  lang: Lang,
  fields: string[],
): JsonRecord {
  const next: JsonRecord = { ...current };
  for (const base of fields) {
    const key = langKey(base, lang);
    if (base === "pros" || base === "cons") {
      next[key] = preferList(asStringArray(current[key], 4), asStringArray(incoming[key], 4), 3);
      continue;
    }
    const min = proseMin(base);
    next[key] = preferText(asString(current[key]), asString(incoming[key]), min.minWords, min.minParagraphs);
  }
  return next;
}

async function ensureProductLength(
  products: Map<number, JsonRecord>,
  lang: Lang,
  judgment: string,
): Promise<Map<number, JsonRecord>> {
  const shortByIndex = new Map<number, string[]>();
  for (const [index, product] of products) {
    const short = shortProductFields(product, lang);
    if (short.length) shortByIndex.set(index, short);
  }
  if (!shortByIndex.size) return products;
  console.info(
    `[affiliate-gemini] products-${lang} short: ${[...shortByIndex.entries()].map(([index, fields]) => `${index}:${fields.join("+")}`).join(", ")}`,
  );
  try {
    const retry = await requestJson(
      [{ text: buildProductRetryPrompt(products, shortByIndex, lang, judgment) }],
      lang === "es" ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW,
      `products-${lang}-retry`,
    );
    const rows = Array.isArray(retry.products) ? retry.products : [];
    const next = new Map(products);
    for (const row of rows) {
      const incoming = asRecord(row);
      const index = Number(incoming.index);
      const fields = shortByIndex.get(index);
      const current = next.get(index);
      if (!fields || !current) continue;
      next.set(index, mergeProductRetry(current, incoming, lang, fields));
    }
    return next;
  } catch (error) {
    console.warn(`[affiliate-gemini] products-${lang}-retry failed:`, error);
    return products;
  }
}

async function visionFor(
  post: AffiliateBlogPost,
  indexes: number[],
): Promise<{ parts: Part[]; attached: number[] }> {
  const loaded = await Promise.all(
    indexes.map(async (index) => {
      const src = productGallery(post.products[index])[0]?.src || "";
      return { index, part: await imagePartFromUrl(src) };
    }),
  );
  const attached = loaded.filter((item): item is { index: number; part: Part } => Boolean(item.part));
  return { parts: attached.map((item) => item.part), attached: attached.map((item) => item.index) };
}

function alignProducts(json: JsonRecord, indexes: number[]): Map<number, JsonRecord> {
  const rows = Array.isArray(json.products) ? json.products : [];
  const map = new Map<number, JsonRecord>();
  rows.forEach((row, position) => {
    const item = asRecord(row);
    const declared = Number(item.index);
    const index = indexes.includes(declared) ? declared : indexes[position];
    if (index === undefined || map.has(index)) return;
    map.set(index, item);
  });
  for (const index of indexes) {
    if (!map.has(index)) map.set(index, { index });
  }
  return map;
}

function applyImageLang(
  gallery: AffiliateProductImage[],
  generated: unknown,
  lang: Lang,
): AffiliateProductImage[] {
  const rows = Array.isArray(generated) ? generated : [];
  return gallery.map((image, index) => {
    const raw = asRecord(rows[index]);
    if (lang === "es") {
      return {
        ...image,
        altEs: asString(raw.altEs, image.altEs),
        captionEs: asString(raw.captionEs, image.captionEs),
      };
    }
    return {
      ...image,
      altEn: asString(raw.altEn, image.altEn),
      captionEn: asString(raw.captionEn, image.captionEn),
    };
  });
}

function mergeSpecs(esRaw: unknown, enRaw: unknown, meta: AmazonProductMeta): AffiliateSpec[] {
  const es = parseSpecs(esRaw);
  const en = parseSpecs(enRaw);
  const base =
    es.length > 0
      ? es
      : meta.specs.map((spec) => ({
          labelEs: spec.label,
          labelEn: spec.label,
          valueEs: spec.value,
          valueEn: spec.value,
        }));
  return base
    .map((spec, index) => {
      const enSpec = en[index];
      return {
        labelEs: spec.labelEs,
        labelEn: enSpec?.labelEn || spec.labelEn || spec.labelEs,
        valueEs: spec.valueEs,
        valueEn: enSpec?.valueEn || spec.valueEn || spec.valueEs,
      };
    })
    .slice(0, 10);
}

function buildSections(outline: JsonRecord, shellEs: JsonRecord, shellEn: JsonRecord): AffiliateSection[] {
  const headings = Array.isArray(outline.sections) ? outline.sections : [];
  const esBodies = Array.isArray(shellEs.sections) ? shellEs.sections : [];
  const enRows = Array.isArray(shellEn.sections) ? shellEn.sections : [];
  const count = Math.max(headings.length, esBodies.length, enRows.length);
  const sections: AffiliateSection[] = [];
  for (let index = 0; index < count && sections.length < 4; index += 1) {
    const heading = asRecord(headings[index]);
    const es = asRecord(esBodies[index]);
    const en = asRecord(enRows[index]);
    const headingEs = asString(heading.headingEs) || asString(es.headingEs);
    const bodyEs = asString(es.bodyEs);
    if (!headingEs || !bodyEs) continue;
    sections.push({
      headingEs,
      headingEn: asString(en.headingEn, headingEs),
      bodyEs,
      bodyEn: asString(en.bodyEn),
    });
  }
  return sections;
}

function buildFaq(outline: JsonRecord, shellEs: JsonRecord, shellEn: JsonRecord) {
  const questions = Array.isArray(outline.faq) ? outline.faq : [];
  const esRows = Array.isArray(shellEs.faq) ? shellEs.faq : [];
  const enRows = Array.isArray(shellEn.faq) ? shellEn.faq : [];
  const count = Math.max(questions.length, esRows.length, enRows.length);
  const faq = [];
  for (let index = 0; index < count && faq.length < 8; index += 1) {
    const question = asRecord(questions[index]);
    const es = asRecord(esRows[index]);
    const en = asRecord(enRows[index]);
    const qEs = asString(question.qEs) || asString(es.qEs);
    if (!qEs) continue;
    faq.push({
      qEs,
      qEn: asString(en.qEn),
      aEs: asString(es.aEs),
      aEn: asString(en.aEn),
    });
  }
  return faq;
}

function buildComparison(outline: JsonRecord, shellEn: JsonRecord, productCount: number, ranking: boolean) {
  if (!ranking) return [];
  const rows = Array.isArray(outline.comparison) ? outline.comparison : [];
  const enRows = Array.isArray(shellEn.comparison) ? shellEn.comparison : [];
  return rows
    .map((row, index) => {
      const item = asRecord(row);
      const en = asRecord(enRows[index]);
      return {
        labelEs: asString(item.labelEs),
        labelEn: asString(en.labelEn, asString(item.labelEn)),
        values: asStringArray(item.values, productCount),
      };
    })
    .filter((row) => row.labelEs)
    .slice(0, 8);
}

export async function generateAffiliateArticle(post: AffiliateBlogPost): Promise<AffiliateBlogPost> {
  const metas = post.products.map(metaFromStoredProduct);
  const allIndexes = post.products.map((_, index) => index);
  const ranking = post.type === "ranking";
  const brief = productBriefFor(post, metas, allIndexes);

  const outline = await requestJson(
    [{ text: buildOutlinePrompt(post, brief) }],
    ThinkingLevel.MEDIUM,
    "outline",
  );
  const judgment = outlineBrief(outline, post);
  const batches = productBatches(post.products.length);

  const [shellEsRaw, ...productJson] = await Promise.all([
    requestJson([{ text: buildShellPrompt(post, judgment) }], ThinkingLevel.MEDIUM, "shell-es"),
    ...batches.map(async (indexes, batchIndex) => {
      const { parts, attached } = await visionFor(post, indexes);
      const prompt = buildProductPrompt(
        post,
        indexes,
        judgment,
        productBriefFor(post, metas, indexes),
        attached,
      );
      return requestJsonWithVision(prompt, parts, ThinkingLevel.MEDIUM, `products-es-${batchIndex}`);
    }),
  ]);

  const [shellEs, esProducts] = await Promise.all([
    ensureShellLength(shellEsRaw, "es", outline, judgment),
    ensureProductLength(
      productJson.reduce((map, json, batchIndex) => {
        const batch = batches[batchIndex] ?? [];
        for (const [index, product] of alignProducts(json, batch)) map.set(index, product);
        return map;
      }, new Map<number, JsonRecord>()),
      "es",
      judgment,
    ),
  ]);

  const [shellEnRaw, productsEnRaw] = await Promise.all([
    requestJson(
      [{ text: buildEnglishShellPrompt(spanishArticleSource(outline, shellEs), ranking) }],
      ThinkingLevel.LOW,
      "shell-en",
    ),
    requestJson(
      [{ text: buildEnglishProductsPrompt(spanishProductSource(post, outline, esProducts)) }],
      ThinkingLevel.LOW,
      "products-en",
    ),
  ]);

  const [shellEn, enProducts] = await Promise.all([
    ensureShellLength(shellEnRaw, "en", outline, judgment),
    ensureProductLength(alignProducts(productsEnRaw, allIndexes), "en", judgment),
  ]);

  const generatedProducts = Array.isArray(outline.products) ? outline.products : [];
  const products = post.products.map((product, index) => {
    const decided = asRecord(generatedProducts[index]);
    const es = esProducts.get(index) ?? {};
    const en = enProducts.get(index) ?? {};
    const meta = metas[index];
    const images = applyImageLang(applyImageLang(productGallery(product), es.images, "es"), en.images, "en");
    const first = images[0] ?? emptyProductImage(primaryProductImage(product));
    return withPrimaryImage({
      ...product,
      brand: asString(es.brand, asString(decided.brand, product.brand || meta.brand)),
      nameEs: asString(es.nameEs, asString(decided.nameEs, product.nameEs || meta.title)),
      nameEn: asString(en.nameEn, product.nameEn || meta.title),
      priceText: asString(es.priceText, product.priceText || meta.priceText),
      rating: asString(es.rating, product.rating || meta.rating),
      reviewCount: asString(es.reviewCount, product.reviewCount || meta.reviewCount),
      amazonBullets: product.amazonBullets.length ? product.amazonBullets : meta.bullets,
      amazonDescription: product.amazonDescription || meta.description,
      summaryEs: asString(es.summaryEs),
      summaryEn: asString(en.summaryEn),
      bodyEs: asString(es.bodyEs),
      bodyEn: asString(en.bodyEn),
      onSnowEs: asString(es.onSnowEs),
      onSnowEn: asString(en.onSnowEn),
      forWhomEs: asString(es.forWhomEs),
      forWhomEn: asString(en.forWhomEn),
      skipIfEs: asString(es.skipIfEs),
      skipIfEn: asString(en.skipIfEn),
      specs: mergeSpecs(es.specs, en.specs, meta),
      prosEs: asStringArray(es.prosEs, 4),
      consEs: asStringArray(es.consEs, 4),
      prosEn: asStringArray(en.prosEn, 4),
      consEn: asStringArray(en.consEn, 4),
      altEs: asString(es.altEs, first.altEs),
      altEn: asString(en.altEn, first.altEn),
      captionEs: asString(es.captionEs, first.captionEs),
      captionEn: asString(en.captionEn, first.captionEn),
      images,
      ctaLabelEs: asString(es.ctaLabelEs, "Comprobar talla y precio en Amazon"),
      ctaLabelEn: asString(en.ctaLabelEn, "Check size and price on Amazon"),
      pickRoleEs: asString(decided.pickRoleEs, asString(es.pickRoleEs)),
      pickRoleEn: asString(en.pickRoleEn, asString(decided.pickRoleEn)),
    });
  });

  const winnerIndex = Math.min(
    Math.max(0, Number(outline.winnerIndex) || 0),
    Math.max(0, products.length - 1),
  );
  const coverFromWinner =
    primaryProductImage(products[winnerIndex] ?? products[0]) || post.coverImage;
  const desiredSlug =
    asString(outline.slug) || asString(outline.titleEs) || `guia-compra-${post.id.slice(0, 8)}`;
  const slug = await ensureUniqueAffiliateSlug(desiredSlug, post.id);
  const desiredSlugEn = asString(shellEn.slugEn) || asString(shellEn.titleEn) || slug;
  const slugEn = await ensureUniqueAffiliateSlug(desiredSlugEn, post.id);
  const legacySlugs = Array.from(
    new Set(
      [
        ...(post.legacySlugs || []),
        post.slug && post.slug !== slug ? post.slug : "",
        post.slugEn && post.slugEn !== slugEn ? post.slugEn : "",
      ].filter(Boolean),
    ),
  );

  const allowedHrefs = new Set([
    ...INTERNAL_HREFS,
    ...blogPosts.map((item) => `/blog/${item.slug}`),
  ]);

  const enLinks = Array.isArray(shellEn.internalLinks) ? shellEn.internalLinks : [];
  const enLinkByHref = new Map(
    enLinks.map((row) => {
      const item = asRecord(row);
      return [asString(item.href), item] as const;
    }),
  );
  const enAlternatives = Array.isArray(shellEn.alternatives) ? shellEn.alternatives : [];
  const enAlternativeByHref = new Map(
    enAlternatives.map((row) => {
      const item = asRecord(row);
      return [asString(item.href), item] as const;
    }),
  );

  const next: AffiliateBlogPost = {
    ...post,
    slug,
    slugEn,
    legacySlugs,
    titleEs: asString(outline.titleEs, post.titleEs),
    titleEn: asString(shellEn.titleEn, post.titleEn),
    excerptEs: asString(outline.excerptEs, post.excerptEs),
    excerptEn: asString(shellEn.excerptEn, post.excerptEn),
    coverImage: coverFromWinner,
    coverAltEs: asString(outline.coverAltEs, products[winnerIndex]?.altEs || ""),
    coverAltEn: asString(shellEn.coverAltEn, products[winnerIndex]?.altEn || ""),
    introEs: asString(shellEs.introEs),
    introEn: asString(shellEn.introEn),
    verdictEs: asString(shellEs.verdictEs),
    verdictEn: asString(shellEn.verdictEn),
    score: (() => {
      const parsed = Number(outline.score);
      return Number.isFinite(parsed) ? Math.min(5, Math.max(0, parsed)) : 0;
    })(),
    tldrBestEs: asString(outline.tldrBestEs),
    tldrBestEn: asString(shellEn.tldrBestEn),
    tldrWorstEs: asString(outline.tldrWorstEs),
    tldrWorstEn: asString(shellEn.tldrWorstEn),
    instructorNoteEs: asString(shellEs.instructorNoteEs),
    instructorNoteEn: asString(shellEn.instructorNoteEn),
    methodologyEs: asString(shellEs.methodologyEs),
    methodologyEn: asString(shellEn.methodologyEn),
    howToChooseEs: asString(shellEs.howToChooseEs),
    howToChooseEn: asString(shellEn.howToChooseEn),
    sections: buildSections(outline, shellEs, shellEn),
    winnerIndex,
    products,
    comparison: buildComparison(outline, shellEn, products.length, ranking),
    faq: buildFaq(outline, shellEs, shellEn),
    alternatives: (Array.isArray(outline.alternatives) ? outline.alternatives : [])
      .map((row) => {
        const item = asRecord(row);
        const href = asString(item.href);
        const en = enAlternativeByHref.get(href) ?? {};
        return {
          titleEs: asString(item.titleEs),
          titleEn: asString(en.titleEn),
          whyEs: asString(item.whyEs),
          whyEn: asString(en.whyEn),
          href,
        };
      })
      .filter((row) => row.titleEs && allowedHrefs.has(row.href))
      .slice(0, 3),
    internalLinks: (Array.isArray(outline.internalLinks) ? outline.internalLinks : [])
      .map((row) => {
        const item = asRecord(row);
        const href = asString(item.href);
        const en = enLinkByHref.get(href) ?? {};
        return {
          href,
          labelEs: asString(item.labelEs),
          labelEn: asString(en.labelEn),
        };
      })
      .filter((row) => allowedHrefs.has(row.href))
      .slice(0, 6),
    relatedSlugs: asStringArray(outline.relatedSlugs, 3).filter((slugValue) =>
      blogPosts.some((item) => item.slug === slugValue),
    ),
    seoTitleEs: asString(outline.seoTitleEs),
    seoTitleEn: asString(shellEn.seoTitleEn),
    seoDescriptionEs: asString(outline.seoDescriptionEs),
    seoDescriptionEn: asString(shellEn.seoDescriptionEn),
  };

  return saveAffiliatePost(next);
}
