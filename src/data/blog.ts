/**
 * Blog posts — slugs conservados del WordPress original.
 * Posts con contentEs vacío pendientes de migración HTML (ver legacy/INVENTORY.md).
 */
export type BlogPost = {
  slug: string;
  titleEs: string;
  titleEn: string;
  excerptEs: string;
  excerptEn: string;
  date: string;
  author: string;
  contentEs: string;
  contentEn: string;
  migrated: boolean;
};

const CTA_ES = `
---

**¿Listo para la nieve?** [Reserva tu clase en Sierra Nevada](/es/clases) o escríbenos por [WhatsApp](https://api.whatsapp.com/send?phone=34660262790).
`.trim();

const CTA_EN = `
---

**Ready for the snow?** [Book your lesson in Sierra Nevada](/en/clases) or message us on [WhatsApp](https://api.whatsapp.com/send?phone=34660262790).
`.trim();

function stub(
  slug: string,
  titleEs: string,
  titleEn: string,
  excerptEs: string,
  excerptEn: string,
  date = "2025-01-01",
): BlogPost {
  return {
    slug,
    titleEs,
    titleEn,
    excerptEs,
    excerptEn,
    date,
    author: "Explora School & Club",
    migrated: false,
    contentEs: `Este artículo se está migrando desde la web anterior. Mientras tanto, ${excerptEs}\n\n${CTA_ES}`,
    contentEn: `This article is being migrated from the previous website. In the meantime, ${excerptEn}\n\n${CTA_EN}`,
  };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "consejos-primera-vez-sierra-nevada",
    titleEs: "Cómo afrontar el primer día de temporada en Sierra Nevada",
    titleEn: "How to tackle your first day of the season in Sierra Nevada",
    excerptEs: "Qué llevar, cómo reservar forfait y por qué reservar clases con antelación.",
    excerptEn: "What to bring, how to buy a lift pass and why to book lessons in advance.",
    date: "2025-11-15",
    author: "Explora School & Club",
    migrated: true,
    contentEs: `## Prepara tu día en la nieve

Si es tu primera vez en Sierra Nevada, te recomendamos reservar clases con antelación. Así eliges instructor/a y horario con calma.

### Forfait y seguro

Recuerda que el forfait se compra aparte en Plaza de Andalucía o en sierranevada.es. También es aconsejable contratar el seguro de accidentes.

### Punto de encuentro

Nos vemos en la salida del telecabina Al-Andalus, área de Borreguiles. Tu instructor/a llevará el uniforme Explora.

${CTA_ES}`,
    contentEn: `## Prepare your day on the snow

If it is your first time in Sierra Nevada, we recommend booking lessons in advance so you can choose your instructor and schedule with ease.

### Lift pass and insurance

Remember that the lift pass is purchased separately at Plaza de Andalucía or sierranevada.es. We also recommend accident insurance.

### Meeting point

We meet at the exit of the Al-Andalus gondola, Borreguiles area. Your instructor wears the Explora uniform.

${CTA_EN}`,
  },
  {
    slug: "full-day-experiencia-explora",
    titleEs: "Full Day: la experiencia Explora",
    titleEn: "Full Day: the Explora experience",
    excerptEs: "5 horas de clase, 1 hora de comodín y punto de encuentro personalizado.",
    excerptEn: "5 hours of lessons, 1 hour buffer and a personalised meeting point.",
    date: "2025-10-01",
    author: "Explora School & Club",
    migrated: true,
    contentEs: `## Un día completo a tu medida

Nuestro Full Day incluye 5 horas de clase efectivas y 1 hora de comodín para recogida en hotel, descansos o comidas.

Es la opción preferida de familias y grupos que buscan una experiencia exclusiva en Sierra Nevada.

${CTA_ES}`,
    contentEn: `## A full day tailored to you

Our Full Day includes 5 hours of effective lesson time and 1 hour buffer for hotel pick-up, breaks or meals.

It is the preferred option for families and groups seeking an exclusive experience in Sierra Nevada.

${CTA_EN}`,
  },
  stub("guia-de-regalos", "Guía de regalos para amantes de la nieve", "Gift guide for snow lovers", "Ideas de regalo para esquiadores y snowboarders.", "Gift ideas for skiers and snowboarders."),
  stub("guia-completa-de-material-de-alta-montana-crampones-mochilas-palas", "Guía de material de alta montaña", "High-mountain gear guide", "Crampones, mochilas y palas para montaña.", "Crampons, backpacks and shovels for mountaineering."),
  stub("arva-pack-safety-box-evo4-seguridad-y-prevencion-en-la-nieve", "ARVA Pack Safety Box EVO4", "ARVA Pack Safety Box EVO4", "Seguridad y prevención en la nieve.", "Safety and prevention in the snow."),
  stub("bastones-de-esqui-2025", "Bastones de esquí 2025", "Ski poles 2025", "Guía de compra de bastones de esquí.", "Ski poles buying guide."),
  stub("equipamiento-de-aventura-para-ninos", "Equipamiento de aventura para niños", "Adventure gear for kids", "Material recomendado para los más pequeños.", "Recommended gear for children."),
  stub("las-10-mejores-gafas-para-esquiar-o-hacer-snowboard-en-sierra-nevada", "Las 10 mejores gafas para esquiar en Sierra Nevada", "Top 10 ski goggles for Sierra Nevada", "Guía de gafas para deportes de invierno.", "Goggles guide for winter sports."),
  stub("los-10-mejores-guantes-para-esquiar", "Los 10 mejores guantes para esquiar", "Top 10 ski gloves", "Guía de compra de guantes.", "Gloves buying guide."),
  stub("las-5-mejores-cremas-protectoras", "Las 5 mejores cremas protectoras", "Top 5 protective creams", "Protección solar en la nieve.", "Sun protection on the snow."),
  stub("mejores-cascos-para-esqui-y-snowboard", "Mejores cascos para esquí y snowboard", "Best ski and snowboard helmets", "Guía de cascos para deportes de invierno.", "Helmet guide for winter sports."),
  stub("los-5-mejores-relojes-para-esqui-y-snowboard-en-2025", "Los 5 mejores relojes para esquí 2025", "Top 5 ski watches 2025", "Relojes para deportes de invierno.", "Watches for winter sports."),
  stub("las-mejores-chaquetas-de-esqui-y-snowboard-para-hombre-en-2025-guia-de-compra-completa", "Mejores chaquetas de esquí 2025", "Best ski jackets 2025", "Guía de compra de chaquetas.", "Jacket buying guide."),
  stub("por-que-es-necesario-contratar-clases-de-esqui-o-snowboard", "Por qué contratar clases de esquí o snowboard", "Why book ski or snowboard lessons", "Ventajas de aprender con un instructor.", "Benefits of learning with an instructor."),
  stub("como-aprovechar-al-maximo-tu-tiempo-en-las-pistas-de-sierra-nevada-y-evitar-las-colas", "Cómo aprovechar tu tiempo en Sierra Nevada", "Make the most of your time in Sierra Nevada", "Evitar colas y optimizar tu día.", "Avoid queues and optimise your day."),
  stub("guia-completa-sobre-los-diferentes-tipos-de-esquis-y-cual-elegir-2025", "Tipos de esquís y cuál elegir 2025", "Types of skis and how to choose 2025", "Guía completa de esquís.", "Complete ski guide."),
  stub("colapso-en-sierra-nevada-atascos-riesgos-y-como-evitar-el-caos", "Colapso en Sierra Nevada: cómo evitar el caos", "Sierra Nevada crowds: how to avoid chaos", "Atascos, riesgos y consejos.", "Traffic, risks and tips."),
  stub("mejora-tu-tecnica-de-snowboard-y-el-equipamiento-que-necesitas-2025", "Mejora tu técnica de snowboard 2025", "Improve your snowboard technique 2025", "Técnica y equipamiento necesario.", "Technique and essential gear."),
  stub("aprende-a-esquiar-y-hacer-snowboard-con-explora-school-club-en-sierra-nevada", "Aprende con Explora School & Club", "Learn with Explora School & Club", "Clases de esquí y snowboard en Sierra Nevada.", "Ski and snowboard lessons in Sierra Nevada."),
  stub("los-mejores-accesorios-para-snowboard-en-2025-guia-completa", "Mejores accesorios para snowboard 2025", "Best snowboard accessories 2025", "Guía completa de accesorios.", "Complete accessories guide."),
  stub("los-mejores-guantes-para-esqui-y-snowboard-hestra-heli-ski", "Guantes Hestra Heli Ski", "Hestra Heli Ski gloves", "Review de guantes premium.", "Premium gloves review."),
  stub("10-trucos-secretos-para-dominar-el-snowboard-en-sierra-nevada-que-ni-los-expertos-conocen", "10 trucos de snowboard en Sierra Nevada", "10 snowboard tricks in Sierra Nevada", "Consejos para mejorar en la nieve.", "Tips to improve on the snow."),
  stub("los-diferentes-tipos-de-tablas-de-snowboard-cual-es-la-ideal-para-ti-2025", "Tipos de tablas de snowboard 2025", "Types of snowboards 2025", "Cuál es la ideal para ti.", "Which one is right for you."),
  stub("como-afrontar-el-primer-dia-de-temporada-en-sierra-nevada", "Primer día de temporada en Sierra Nevada", "First day of the season in Sierra Nevada", "Consejos para empezar bien la temporada.", "Tips to start the season right."),
  stub("plano-de-pistas-de-sierra-nevada", "Plano de pistas de Sierra Nevada", "Sierra Nevada piste map", "Orientación en la estación.", "Finding your way around the resort."),
  stub("gafas-fotocromaticas-para-deportes-de-nieve-y-montana-2025", "Gafas fotocromáticas 2025", "Photochromic goggles 2025", "Para deportes de nieve y montaña.", "For snow and mountain sports."),
  stub("5-mejores-opciones-de-protector-labial", "5 mejores protectores labiales", "Top 5 lip balms", "Protección labial en la nieve.", "Lip protection on the snow."),
  stub("guia-completa-sobre-cadenas-de-nieve-2025-seguridad-y-traccion", "Guía de cadenas de nieve 2025", "Snow chains guide 2025", "Seguridad y tracción.", "Safety and traction."),
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogSlugs = blogPosts.map((p) => p.slug);
