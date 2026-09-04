import { GoogleGenAI, type Part } from "@google/genai";
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
  type AffiliateProductImage,
  type AffiliateSection,
  type AffiliateSpec,
} from "@/lib/affiliate-blog-shared";
import { fetchAmazonProductMeta, formatAmazonBrief } from "@/lib/amazon-product-meta";

const MODELS = ["gemini-2.5-flash"];
const LOCATIONS = ["europe-west1", "us-central1"];
const MAX_VISION_IMAGES = 12;

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

function extractJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("generate_failed");
  return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function asStringArray(value: unknown, max = 5): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, max);
}

function parseSpecs(value: unknown): AffiliateSpec[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row as Record<string, unknown>;
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

function parseSections(value: unknown): AffiliateSection[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const item = row as Record<string, unknown>;
      return {
        headingEs: asString(item.headingEs),
        headingEn: asString(item.headingEn),
        bodyEs: asString(item.bodyEs),
        bodyEn: asString(item.bodyEn),
      };
    })
    .filter((item) => item.headingEs && item.bodyEs)
    .slice(0, 4);
}

function applyGeneratedImageCopy(
  gallery: AffiliateProductImage[],
  generated: unknown,
): AffiliateProductImage[] {
  const rows = Array.isArray(generated) ? generated : [];
  return gallery.map((image, index) => {
    const raw = (rows[index] ?? {}) as Record<string, unknown>;
    return {
      ...image,
      altEs: asString(raw.altEs, image.altEs),
      altEn: asString(raw.altEn, image.altEn),
      captionEs: asString(raw.captionEs, image.captionEs),
      captionEn: asString(raw.captionEn, image.captionEn),
    };
  });
}

export async function generateAffiliateArticle(post: AffiliateBlogPost): Promise<AffiliateBlogPost> {
  const metas = await Promise.all(
    post.products.map((product) => fetchAmazonProductMeta(product.affiliateUrl)),
  );

  const visionUrls = post.products.flatMap((product) =>
    productGallery(product)
      .slice(0, 2)
      .map((image) => image.src),
  ).slice(0, MAX_VISION_IMAGES);

  const imageParts = (
    await Promise.all(visionUrls.map((url) => imagePartFromUrl(url)))
  ).filter((part): part is Part => Boolean(part));

  const productBrief = post.products
    .map((product, index) => {
      const meta = metas[index];
      const gallery = productGallery(product);
      return [
        `=== Producto ${index + 1} ===`,
        `URL afiliado Explora: ${product.affiliateUrl}`,
        `Fotos en galería (${gallery.length}): ${gallery.map((image) => image.src).join(" | ")}`,
        formatAmazonBrief(meta),
      ].join("\n");
    })
    .join("\n\n");

  const kind =
    post.type === "ranking"
      ? "ranking comparativo de exactamente 6 productos"
      : "review profunda de 1 producto";

  const prompt = `Eres editor senior de Explora School & Club (escuela de esquí, snowboard y telemark en Sierra Nevada, Granada). Escribes guías de compra al nivel de Wirecutter / Outdoor Gear Lab: densas, concretas, bilingües, sin relleno.

Tarea: ${kind}. Devuelve SOLO un JSON válido, sin markdown ni comentarios.

Voz:
- Español de España y inglés británico (en-GB). Tono de instructor que ha visto el material en nieve real, no de marketplace.
- Nunca digas que Explora vende el producto. Explora da clases; Amazon es la compra.
- No inventes precios, valoraciones ni número de opiniones. Si el dato Amazon está vacío, deja el campo vacío.
- No uses “el mejor del mundo”, “imprescindible”, “revolucionario”.
- Alts: describe color, tipo de producto y uso en nieve. Nunca “imagen de producto”.
- Cada campo Es y En debe ser redacción independiente, no una traducción calcada palabra a palabra.

Longitud mínima (imprescindible):
- introEs / introEn: 3 o 4 párrafos separados por \\n\\n (80–140 palabras cada párrafo).
- methodologyEs / methodologyEn: 90–140 palabras.
- howToChooseEs / howToChooseEn: 140–220 palabras (talla, clima Sierra Nevada, nivel, presupuesto).
- verdictEs / verdictEn: 50–90 palabras. En ranking, nombra al ganador y un runner-up.
- sections: 2 bloques extra (p. ej. “Qué mirar antes de comprar”, “Errores habituales”). Cada body 80–140 palabras.
- Por producto: summary 40–60 palabras; bodyEs/bodyEn 180–280 palabras en 2–3 párrafos \\n\\n; onSnowEs/onSnowEn 50–90 palabras (pistas, hielo, viento de Sierra Nevada); forWhom y skipIf concretos; 3 pros y 3 contras.
- FAQ: 6 preguntas útiles (talla, clima, clases vs comprar, mantenimiento, alternativas).
- ranking: comparison con 6 filas útiles (uso, nivel, peso/talla si se conoce, clima, precio si hay dato, veredicto corto). values: un string por producto, mismo orden.
- review: comparison vacío; winnerIndex 0.
- CTAs Amazon: "Ver en Amazon" / "See on Amazon".
- slug kebab-case español, corto.
- winnerIndex 0-based.
- relatedSlugs: 1–3 slugs reales de la lista editorial.
- internalLinks: mínimo 3 href reales de esta lista:
  /clases
  /clases/esqui
  /clases/snowboard
  /clases/telemark
  /reserva
  /club
  /como-llegar
  /contacto
${editorialGuide()}

JSON schema:
{
  "slug": "",
  "titleEs": "",
  "titleEn": "",
  "excerptEs": "",
  "excerptEn": "",
  "coverAltEs": "",
  "coverAltEn": "",
  "introEs": "",
  "introEn": "",
  "verdictEs": "",
  "verdictEn": "",
  "methodologyEs": "",
  "methodologyEn": "",
  "howToChooseEs": "",
  "howToChooseEn": "",
  "sections": [{ "headingEs": "", "headingEn": "", "bodyEs": "", "bodyEn": "" }],
  "winnerIndex": 0,
  "products": [{
    "nameEs": "",
    "nameEn": "",
    "brand": "",
    "priceText": "",
    "rating": "",
    "reviewCount": "",
    "summaryEs": "",
    "summaryEn": "",
    "bodyEs": "",
    "bodyEn": "",
    "onSnowEs": "",
    "onSnowEn": "",
    "forWhomEs": "",
    "forWhomEn": "",
    "skipIfEs": "",
    "skipIfEn": "",
    "specs": [{ "labelEs": "", "labelEn": "", "valueEs": "", "valueEn": "" }],
    "prosEs": ["", "", ""],
    "consEs": ["", "", ""],
    "prosEn": ["", "", ""],
    "consEn": ["", "", ""],
    "altEs": "",
    "altEn": "",
    "captionEs": "",
    "captionEn": "",
    "images": [{ "altEs": "", "altEn": "", "captionEs": "", "captionEn": "" }],
    "ctaLabelEs": "Ver en Amazon",
    "ctaLabelEn": "See on Amazon"
  }],
  "comparison": [{ "labelEs": "", "labelEn": "", "values": ["...uno por producto"] }],
  "faq": [{ "qEs": "", "qEn": "", "aEs": "", "aEn": "" }],
  "internalLinks": [{ "href": "/clases", "labelEs": "", "labelEn": "" }],
  "relatedSlugs": ["slug-editorial"],
  "seoTitleEs": "",
  "seoTitleEn": "",
  "seoDescriptionEs": "",
  "seoDescriptionEn": ""
}

Ficha Amazon (fuente de verdad; no contradigas estos datos):
${productBrief}`;

  const contents: Array<{ role: string; parts: Part[] }> = [
    {
      role: "user",
      parts: [{ text: prompt }, ...imageParts],
    },
  ];

  let text = "";
  let lastError: unknown;
  for (const location of LOCATIONS) {
    for (const model of MODELS) {
      try {
        const ai = getVertexClient(location);
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            temperature: 0.55,
            responseMimeType: "application/json",
            maxOutputTokens: 16384,
          },
        });
        text = response.text ?? "";
        if (text) break;
      } catch (error) {
        lastError = error;
        console.warn(`[affiliate-gemini] ${location}/${model} failed:`, error);
      }
    }
    if (text) break;
  }
  if (!text) {
    console.error("[affiliate-gemini] generation failed:", lastError);
    throw new Error("generate_failed");
  }

  const json = extractJsonObject(text);
  const generatedProducts = Array.isArray(json.products) ? json.products : [];
  const products = post.products.map((product, index) => {
    const raw = (generatedProducts[index] ?? {}) as Record<string, unknown>;
    const meta = metas[index];
    const images = applyGeneratedImageCopy(productGallery(product), raw.images);
    const first = images[0] ?? emptyProductImage(primaryProductImage(product));
    const specs = parseSpecs(raw.specs);
    const fallbackSpecs =
      specs.length > 0
        ? specs
        : meta.specs.map((spec) => ({
            labelEs: spec.label,
            labelEn: spec.label,
            valueEs: spec.value,
            valueEn: spec.value,
          }));
    return withPrimaryImage({
      ...product,
      brand: asString(raw.brand, product.brand || meta.brand),
      nameEs: asString(raw.nameEs, product.nameEs || meta.title),
      nameEn: asString(raw.nameEn, product.nameEn || meta.title),
      priceText: asString(raw.priceText, product.priceText || meta.priceText),
      rating: asString(raw.rating, product.rating || meta.rating),
      reviewCount: asString(raw.reviewCount, product.reviewCount || meta.reviewCount),
      amazonBullets: product.amazonBullets.length ? product.amazonBullets : meta.bullets,
      amazonDescription: product.amazonDescription || meta.description,
      summaryEs: asString(raw.summaryEs),
      summaryEn: asString(raw.summaryEn),
      bodyEs: asString(raw.bodyEs),
      bodyEn: asString(raw.bodyEn),
      onSnowEs: asString(raw.onSnowEs),
      onSnowEn: asString(raw.onSnowEn),
      forWhomEs: asString(raw.forWhomEs),
      forWhomEn: asString(raw.forWhomEn),
      skipIfEs: asString(raw.skipIfEs),
      skipIfEn: asString(raw.skipIfEn),
      specs: fallbackSpecs,
      prosEs: asStringArray(raw.prosEs, 4),
      consEs: asStringArray(raw.consEs, 4),
      prosEn: asStringArray(raw.prosEn, 4),
      consEn: asStringArray(raw.consEn, 4),
      altEs: asString(raw.altEs, first.altEs),
      altEn: asString(raw.altEn, first.altEn),
      captionEs: asString(raw.captionEs, first.captionEs),
      captionEn: asString(raw.captionEn, first.captionEn),
      images,
      ctaLabelEs: asString(raw.ctaLabelEs, "Ver en Amazon"),
      ctaLabelEn: asString(raw.ctaLabelEn, "See on Amazon"),
    });
  });

  const winnerIndex = Math.min(
    Math.max(0, Number(json.winnerIndex) || 0),
    Math.max(0, products.length - 1),
  );
  const coverFromWinner =
    primaryProductImage(products[winnerIndex] ?? products[0]) || post.coverImage;
  const desiredSlug =
    asString(json.slug) || asString(json.titleEs) || `guia-compra-${post.id.slice(0, 8)}`;
  const slug = await ensureUniqueAffiliateSlug(desiredSlug, post.id);

  const allowedHrefs = new Set([
    "/clases",
    "/clases/esqui",
    "/clases/snowboard",
    "/clases/telemark",
    "/reserva",
    "/club",
    "/como-llegar",
    "/contacto",
    ...blogPosts.map((item) => `/blog/${item.slug}`),
  ]);

  const next: AffiliateBlogPost = {
    ...post,
    slug,
    titleEs: asString(json.titleEs, post.titleEs),
    titleEn: asString(json.titleEn, post.titleEn),
    excerptEs: asString(json.excerptEs, post.excerptEs),
    excerptEn: asString(json.excerptEn, post.excerptEn),
    coverImage: coverFromWinner,
    coverAltEs: asString(json.coverAltEs, products[winnerIndex]?.altEs),
    coverAltEn: asString(json.coverAltEn, products[winnerIndex]?.altEn),
    introEs: asString(json.introEs),
    introEn: asString(json.introEn),
    verdictEs: asString(json.verdictEs),
    verdictEn: asString(json.verdictEn),
    methodologyEs: asString(json.methodologyEs),
    methodologyEn: asString(json.methodologyEn),
    howToChooseEs: asString(json.howToChooseEs),
    howToChooseEn: asString(json.howToChooseEn),
    sections: parseSections(json.sections),
    winnerIndex,
    products,
    comparison: Array.isArray(json.comparison)
      ? json.comparison
          .map((row) => {
            const item = row as Record<string, unknown>;
            return {
              labelEs: asString(item.labelEs),
              labelEn: asString(item.labelEn),
              values: asStringArray(item.values, products.length),
            };
          })
          .filter((row) => row.labelEs)
          .slice(0, 8)
      : [],
    faq: Array.isArray(json.faq)
      ? json.faq
          .map((row) => {
            const item = row as Record<string, unknown>;
            return {
              qEs: asString(item.qEs),
              qEn: asString(item.qEn),
              aEs: asString(item.aEs),
              aEn: asString(item.aEn),
            };
          })
          .filter((row) => row.qEs)
          .slice(0, 8)
      : [],
    internalLinks: Array.isArray(json.internalLinks)
      ? json.internalLinks
          .map((row) => {
            const item = row as Record<string, unknown>;
            return {
              href: asString(item.href),
              labelEs: asString(item.labelEs),
              labelEn: asString(item.labelEn),
            };
          })
          .filter((row) => allowedHrefs.has(row.href))
          .slice(0, 6)
      : [],
    relatedSlugs: asStringArray(json.relatedSlugs, 3).filter((slugValue) =>
      blogPosts.some((item) => item.slug === slugValue),
    ),
    seoTitleEs: asString(json.seoTitleEs),
    seoTitleEn: asString(json.seoTitleEn),
    seoDescriptionEs: asString(json.seoDescriptionEs),
    seoDescriptionEn: asString(json.seoDescriptionEn),
  };

  return saveAffiliatePost(next);
}
