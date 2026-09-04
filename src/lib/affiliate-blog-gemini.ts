import { GoogleGenAI, type Part } from "@google/genai";
import { blogPosts } from "@/data/blog";
import { getCredentialParts } from "@/lib/firebase/admin";
import {
  ensureUniqueAffiliateSlug,
  saveAffiliatePost,
  type AffiliateBlogPost,
} from "@/lib/affiliate-blog";
import { fetchAmazonProductMeta } from "@/lib/amazon-product-meta";

const MODEL = "gemini-2.5-flash";

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

export async function generateAffiliateArticle(post: AffiliateBlogPost): Promise<AffiliateBlogPost> {
  const metas = await Promise.all(
    post.products.map((product) => fetchAmazonProductMeta(product.affiliateUrl)),
  );

  const imageParts = (
    await Promise.all(post.products.map((product) => imagePartFromUrl(product.imageSrc)))
  ).filter((part): part is Part => Boolean(part));

  const productBrief = post.products
    .map((product, index) => {
      const meta = metas[index];
      return [
        `Producto ${index + 1}`,
        `ASIN: ${product.asin || meta.asin || ""}`,
        `URL afiliado Explora: ${product.affiliateUrl}`,
        `Título Amazon/OG: ${meta.title || "(no disponible)"}`,
        `Precio visible: ${meta.priceText || "(no inventar si vacío)"}`,
        `Imagen: ${product.imageSrc ? "sí" : "no"}`,
      ].join("\n");
    })
    .join("\n\n");

  const kind = post.type === "ranking" ? "ranking de exactamente 6 productos" : "review de 1 producto";
  const prompt = `Eres editor senior de Explora School & Club, escuela de esquí, snowboard y telemark en Sierra Nevada (Granada). Redactas guías de compra de afiliados Amazon para esquiadores y snowboarders reales, no para un marketplace genérico.

Tarea: ${kind}. Devuelve SOLO un JSON válido, sin markdown.

Reglas:
- Español de España y inglés británico (en-GB), tono cercano, útil, sin hype vacío ni “el mejor del mundo”.
- No digas que Explora vende el material. Explora da clases; Amazon es la compra.
- No inventes precios. Si no hay precio, deja priceText vacío.
- Alts de imagen: describe lo que se ve (color, tipo de producto, uso en nieve). Nunca “imagen de producto”.
- Incluye siempre enlaces internos reales de esta lista (mínimo 3):
  /clases
  /clases/esqui
  /clases/snowboard
  /reserva
  /club
  /como-llegar
${editorialGuide()}
- CTAs Amazon: "Ver en Amazon" / "See on Amazon".
- winnerIndex es 0-based.
- ranking: 6 productos, comparison con 4-6 filas (peso/impermeabilidad/para quién/precio si se conoce, etc.).
- review: 1 producto, comparison puede ir vacío.
- FAQ: 4 preguntas útiles (talla, clima Sierra Nevada, clases vs comprar, etc.).
- slug en kebab-case español, corto.

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
  "methodologyEs": "",
  "methodologyEn": "",
  "winnerIndex": 0,
  "products": [{
    "nameEs": "",
    "nameEn": "",
    "priceText": "",
    "summaryEs": "",
    "summaryEn": "",
    "forWhomEs": "",
    "forWhomEn": "",
            "prosEs": ["", ""],
            "consEs": ["", ""],
            "prosEn": ["", ""],
            "consEn": ["", ""],
    "altEs": "",
    "altEn": "",
    "captionEs": "",
    "captionEn": "",
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

Datos de producto:
${productBrief}`;

  const contents: Array<{ role: string; parts: Part[] }> = [
    {
      role: "user",
      parts: [{ text: prompt }, ...imageParts],
    },
  ];

  let text = "";
  const locations = ["europe-west1", "us-central1"];
  let lastError: unknown;
  for (const location of locations) {
    try {
      const ai = getVertexClient(location);
      const response = await ai.models.generateContent({
        model: MODEL,
        contents,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      });
      text = response.text ?? "";
      if (text) break;
    } catch (error) {
      lastError = error;
      console.warn(`[affiliate-gemini] ${location} failed:`, error);
    }
  }
  if (!text) {
    console.error("[affiliate-gemini] generation failed:", lastError);
    throw new Error("generate_failed");
  }

  const json = extractJsonObject(text);
  const generatedProducts = Array.isArray(json.products) ? json.products : [];
  const products = post.products.map((product, index) => {
    const raw = (generatedProducts[index] ?? {}) as Record<string, unknown>;
    return {
      ...product,
      nameEs: asString(raw.nameEs, product.nameEs),
      nameEn: asString(raw.nameEn, product.nameEn),
      priceText: asString(raw.priceText, product.priceText),
      summaryEs: asString(raw.summaryEs),
      summaryEn: asString(raw.summaryEn),
      forWhomEs: asString(raw.forWhomEs),
      forWhomEn: asString(raw.forWhomEn),
      prosEs: asStringArray(raw.prosEs),
      consEs: asStringArray(raw.consEs),
      prosEn: asStringArray(raw.prosEn),
      consEn: asStringArray(raw.consEn),
      altEs: asString(raw.altEs, product.altEs),
      altEn: asString(raw.altEn, product.altEn),
      captionEs: asString(raw.captionEs),
      captionEn: asString(raw.captionEn),
      ctaLabelEs: asString(raw.ctaLabelEs, "Ver en Amazon"),
      ctaLabelEn: asString(raw.ctaLabelEn, "See on Amazon"),
    };
  });

  const winnerIndex = Math.min(
    Math.max(0, Number(json.winnerIndex) || 0),
    Math.max(0, products.length - 1),
  );
  const coverFromWinner = products[winnerIndex]?.imageSrc || products[0]?.imageSrc || post.coverImage;
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
    methodologyEs: asString(json.methodologyEs),
    methodologyEn: asString(json.methodologyEn),
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
          .slice(0, 6)
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
