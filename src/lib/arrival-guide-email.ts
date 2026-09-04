const FORFAIT_URL = "https://www.sierranevada.es";

/** Keep in sync with functions/src/arrival-guide.ts */

export type ArrivalGuideBrand = {
  pizarra: string;
  hielo: string;
  nieve: string;
  muted: string;
  border: string;
  white: string;
  accent: string;
};

export type ArrivalGuideLinks = {
  mapsUrl: string;
  whatsappUrl: string;
};

function pick(isEn: boolean, es: string, en: string): string {
  return isEn ? en : es;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type GuideCopy = {
  kicker: string;
  title: string;
  intro: string;
  ruleTitle: string;
  ruleBody: string;
  ruleHighlight: string;
  parkingTitle: string;
  parkingDrive: string;
  parkingRecommended: string;
  parkingForfait: string;
  parkingTraffic: string;
  parkingChains: string;
  gearTitle: string;
  gearIntro: string;
  gearForfait: string;
  gearRental: string;
  gearPersonal: string;
  gondolaTitle: string;
  gondolaAltitude: string;
  gondolaHow: string;
  gondolaTime: string;
  gondolaQueue: string;
  meetTitle: string;
  meetWait: string;
  meetExact: string;
  meetIdentify: string;
  meetFullDay: string;
  mapsCta: string;
  forfaitCta: string;
  checklistTitle: string;
  checklist: string[];
  dayOfTitle: string;
  dayOfBody: string;
  dayOfCta: string;
};

function copy(isEn: boolean): GuideCopy {
  return {
    kicker: pick(isEn, "Guía de llegada", "Arrival guide"),
    title: pick(
      isEn,
      "Disfruta de tu clase sin prisas ni estrés",
      "Enjoy your lesson without rushing",
    ),
    intro: pick(
      isEn,
      "Para que tu día de esquí o snowboard comience de la mejor manera y aproveches cada minuto de tu clase, sigue esta guía para llegar al punto de encuentro con tiempo y sin agobios.",
      "So your ski or snowboard day starts well and you make the most of every minute of your lesson, follow this guide to reach the meeting point with time and without stress.",
    ),
    ruleTitle: pick(isEn, "La regla de los 90 minutos", "The 90-minute rule"),
    ruleBody: pick(
      isEn,
      "En Sierra Nevada, el tiempo no depende solo del coche. En temporada, entre aparcar, alquilar material, sacar los forfaits y subir en el telecabina, se puede tardar entre 1 hora y 1 hora y media.",
      "In Sierra Nevada, time is not just about the drive. In season, parking, renting equipment, collecting lift passes and taking the gondola can take between 1 hour and 1 hour 30 minutes.",
    ),
    ruleHighlight: pick(
      isEn,
      "Planifica estar en Pradollano mínimo 1 h 30 min antes de la hora de tu clase.",
      "Plan to be in Pradollano at least 1 hour 30 minutes before your lesson.",
    ),
    parkingTitle: pick(isEn, "1. Cómo llegar y dónde aparcar", "1. Getting there and parking"),
    parkingDrive: pick(
      isEn,
      "Sierra Nevada está a unos 40 minutos en coche desde Granada por la carretera A-395.",
      "Sierra Nevada is about a 40-minute drive from Granada city via the A-395.",
    ),
    parkingRecommended: pick(
      isEn,
      "Aparcamiento recomendado: Parking Subterráneo Plaza de Andalucía en Pradollano. Te deja en la plaza principal, justo debajo de alquileres, taquillas y accesos a telecabinas.",
      "Recommended parking: Plaza de Andalucía underground car park in Pradollano. It drops you at the main square, right below rentals, ticket offices and gondola access.",
    ),
    parkingForfait: pick(
      isEn,
      "En los parkings hay cajeros automáticos para sacar el forfait sin pasar por taquilla. También los encontrarás en la estación media y superior de la Silla del Pueblo.",
      "The car parks have automatic machines to collect your lift pass without going to the ticket office. There are also machines at the middle and top stations of the Village chairlift (Silla del Pueblo).",
    ),
    parkingTraffic: pick(
      isEn,
      "Tráfico: a partir de las 8:30–9:00 h la subida a la estación se vuelve más densa. Sube con margen.",
      "Traffic: from 8:30–9:00 am the road up to the resort gets busier. Leave extra time.",
    ),
    parkingChains: pick(
      isEn,
      "Cadenas: revisa la predicción del tiempo y lleva siempre cadenas o fundas en el maletero por si son obligatorias.",
      "Snow chains: check the forecast and always carry chains or snow socks in the boot in case they are required.",
    ),
    gearTitle: pick(
      isEn,
      "2. Forfaits y material (listos antes de subir)",
      "2. Lift passes and equipment (ready before you go up)",
    ),
    gearIntro: pick(
      isEn,
      "Para no perder minutos de tu clase, lleva todo el equipamiento listo antes de montarte en el telecabina:",
      "To avoid losing minutes of your lesson, have all your equipment ready before you board the gondola:",
    ),
    gearForfait: pick(
      isEn,
      "Forfait: lo más cómodo es comprarlo con antelación en sierranevada.es. El mismo día puedes sacarlo en los cajeros automáticos de forfait: hay en los parkings y en la estación media y superior de la Silla del Pueblo. Así evitas las colas de taquilla de Plaza de Andalucía. Recomendamos el seguro de accidentes.",
      "Lift pass: the easiest option is to buy it in advance at sierranevada.es. On the day you can collect it at the automatic forfait machines in the car parks and at the middle and top stations of the Village chairlift (Silla del Pueblo). That way you skip the ticket-office queues at Plaza de Andalucía. We recommend accident insurance.",
    ),
    gearRental: pick(
      isEn,
      "Material de alquiler: recomendamos José Luis Sáez, junto a los telecabinas Al-Andalus y Borreguiles. Con Explora tienes un 20% de descuento: dilo al recoger el equipo. Reserva o recoge con tiempo (20–40 minutos).",
      "Rental: we recommend José Luis Sáez, next to the Al-Andalus and Borreguiles gondolas. With Explora you get 20% off: mention it when you pick up. Book or collect with time to spare (20–40 minutes).",
    ),
    gearPersonal: pick(
      isEn,
      "Equipamiento personal: ropa de abrigo impermeable, guantes de nieve, gafas de sol/ventisca y crema solar.",
      "What to wear: waterproof warm layers, snow gloves, sunglasses or goggles, and sunscreen.",
    ),
    gondolaTitle: pick(
      isEn,
      "3. Subida en el Telecabina Al-Andalus",
      "3. Al-Andalus gondola",
    ),
    gondolaAltitude: pick(
      isEn,
      "Las clases se imparten en la zona alta de la estación (Borreguiles, a 2.700 m).",
      "Lessons take place in the upper area of the resort (Borreguiles, 2,700 m).",
    ),
    gondolaHow: pick(
      isEn,
      "Debes subir en el Telecabina Al-Andalus desde la plaza principal de Pradollano.",
      "Take the Al-Andalus gondola from Pradollano’s main square.",
    ),
    gondolaTime: pick(
      isEn,
      "El trayecto dura unos 10–15 minutos, pero en horas de máxima afluencia (9:30 a 11:00 h) la fila para embarcar puede ser de 15 a 30 minutos.",
      "The ride takes about 10–15 minutes, but at peak times (9:30–11:00 am) the boarding queue can be 15–30 minutes.",
    ),
    gondolaQueue: pick(
      isEn,
      "Calcula hacer la fila del telecabina al menos 40 minutos antes de tu clase.",
      "Plan to join the gondola queue at least 40 minutes before your lesson.",
    ),
    meetTitle: pick(isEn, "4. Punto de encuentro", "4. Meeting point"),
    meetWait: pick(
      isEn,
      "Tu instructor te estará esperando arriba en Borreguiles.",
      "Your instructor will be waiting for you at the top in Borreguiles.",
    ),
    meetExact: pick(
      isEn,
      "Ubicación exacta: justo a la salida a la nieve al llegar arriba en el Telecabina Al-Andalus.",
      "Exact location: right at the snow exit when you arrive on the Al-Andalus gondola.",
    ),
    meetIdentify: pick(
      isEn,
      "Cómo identificarlo: nada más salir del edificio del telecabina y pisar la nieve, verás a tu instructor de Explora School & Club con la chaqueta oficial de la escuela.",
      "How to spot them: as soon as you leave the gondola building and step onto the snow, you will see your Explora School & Club instructor in the school’s official jacket.",
    ),
    meetFullDay: pick(
      isEn,
      "Si tu reserva es de día completo con recogida, tu instructor te confirmará el punto de encuentro (puede no ser Borreguiles).",
      "If your booking is a full day with pick-up, your instructor will confirm the meeting point (it may not be Borreguiles).",
    ),
    mapsCta: pick(isEn, "Abrir en Google Maps", "Open in Google Maps"),
    forfaitCta: pick(isEn, "Comprar forfait en sierranevada.es", "Buy a lift pass at sierranevada.es"),
    checklistTitle: pick(isEn, "Check-list de tiempos", "Timing checklist"),
    checklist: isEn
      ? [
          "Park in Pradollano: 1 h 30 min before",
          "Collect lift pass (website, car-park machine or Silla del Pueblo) and equipment: 1 h before",
          "Join the Al-Andalus gondola queue: 40 min before",
          "Arrive at the meeting point (Al-Andalus snow exit): 10 min before",
        ]
      : [
          "Aparcar en Pradollano: 1 h 30 min antes",
          "Sacar forfait (web, cajero del parking o Silla del Pueblo) y equipo: 1 h antes",
          "Entrar a la fila del Telecabina Al-Andalus: 40 min antes",
          "Llegada al punto de encuentro (salida nieve Al-Andalus): 10 min antes",
        ],
    dayOfTitle: pick(isEn, "Contacto el día de tu reserva", "Contact on the day"),
    dayOfBody: pick(
      isEn,
      "Si tienes cualquier imprevisto grave durante el trayecto o el aparcamiento, avísanos inmediatamente por WhatsApp para gestionar el horario con tu instructor.",
      "If you have a serious delay on the way or with parking, message us immediately on WhatsApp so we can rearrange the time with your instructor.",
    ),
    dayOfCta: pick(isEn, "Avisar por WhatsApp", "Message us on WhatsApp"),
  };
}

export function buildArrivalGuideText(isEn: boolean, links: ArrivalGuideLinks): string {
  const c = copy(isEn);
  const checklist = c.checklist.map((item) => `□ ${item}`).join("\n");
  return [
    `${c.kicker}: ${c.title}`,
    "Explora School & Club · Sierra Nevada",
    "",
    c.intro,
    "",
    c.ruleTitle,
    c.ruleBody,
    c.ruleHighlight,
    "",
    c.parkingTitle,
    c.parkingDrive,
    c.parkingRecommended,
    c.parkingForfait,
    c.parkingTraffic,
    c.parkingChains,
    "",
    c.gearTitle,
    c.gearIntro,
    c.gearForfait,
    FORFAIT_URL,
    c.gearRental,
    c.gearPersonal,
    "",
    c.gondolaTitle,
    c.gondolaAltitude,
    c.gondolaHow,
    c.gondolaTime,
    c.gondolaQueue,
    "",
    c.meetTitle,
    c.meetWait,
    c.meetExact,
    c.meetIdentify,
    c.meetFullDay,
    links.mapsUrl,
    "",
    c.checklistTitle,
    checklist,
    "",
    c.dayOfTitle,
    c.dayOfBody,
    links.whatsappUrl,
  ].join("\n");
}

function p(text: string, brand: ArrivalGuideBrand, margin = "0 0 10px"): string {
  return `<p style="margin:${margin};font-size:14px;line-height:1.55;color:${brand.pizarra};">${escapeHtml(text)}</p>`;
}

function sectionTitle(text: string, brand: ArrivalGuideBrand): string {
  return `<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:${brand.hielo};font-weight:700;">${escapeHtml(text)}</p>`;
}

function card(inner: string, brand: ArrivalGuideBrand, marginTop: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${marginTop} 0 0;">
      <tr>
        <td style="padding:16px 18px;background:${brand.nieve};border:1px solid ${brand.border};border-radius:14px;">
          ${inner}
        </td>
      </tr>
    </table>`;
}

export function buildArrivalGuideHtml(
  isEn: boolean,
  links: ArrivalGuideLinks,
  brand: ArrivalGuideBrand,
): string {
  const c = copy(isEn);
  const checklistRows = c.checklist
    .map(
      (item) => `
        <tr>
          <td style="width:22px;padding:5px 0;vertical-align:top;font-size:15px;line-height:1.45;color:${brand.hielo};font-weight:700;">□</td>
          <td style="padding:5px 0;font-size:14px;line-height:1.45;color:${brand.pizarra};">${escapeHtml(item)}</td>
        </tr>`,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr>
        <td>
          ${sectionTitle(c.kicker, brand)}
          <p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:${brand.pizarra};font-weight:700;">
            ${escapeHtml(c.title)}
          </p>
          ${p(c.intro, brand, "0 0 4px")}
        </td>
      </tr>
    </table>

    ${card(
      `
        ${sectionTitle(c.ruleTitle, brand)}
        ${p(c.ruleBody, brand)}
        <p style="margin:0;font-size:14px;line-height:1.55;color:${brand.pizarra};font-weight:700;">
          ${escapeHtml(c.ruleHighlight)}
        </p>
      `,
      brand,
      "16px",
    )}

    ${card(
      `
        ${sectionTitle(c.parkingTitle, brand)}
        ${p(c.parkingDrive, brand)}
        ${p(c.parkingRecommended, brand)}
        ${p(c.parkingForfait, brand)}
        ${p(c.parkingTraffic, brand)}
        ${p(c.parkingChains, brand, "0")}
      `,
      brand,
      "12px",
    )}

    ${card(
      `
        ${sectionTitle(c.gearTitle, brand)}
        ${p(c.gearIntro, brand)}
        ${p(c.gearForfait, brand)}
        <p style="margin:0 0 10px;">
          <a href="${escapeHtml(FORFAIT_URL)}" style="font-size:14px;font-weight:700;color:${brand.hielo};text-decoration:underline;">
            ${escapeHtml(c.forfaitCta)}
          </a>
        </p>
        ${p(c.gearRental, brand)}
        ${p(c.gearPersonal, brand, "0")}
      `,
      brand,
      "12px",
    )}

    ${card(
      `
        ${sectionTitle(c.gondolaTitle, brand)}
        ${p(c.gondolaAltitude, brand)}
        ${p(c.gondolaHow, brand)}
        ${p(c.gondolaTime, brand)}
        <p style="margin:0;font-size:14px;line-height:1.55;color:${brand.pizarra};font-weight:700;">
          ${escapeHtml(c.gondolaQueue)}
        </p>
      `,
      brand,
      "12px",
    )}

    ${card(
      `
        ${sectionTitle(c.meetTitle, brand)}
        ${p(c.meetWait, brand)}
        ${p(c.meetExact, brand)}
        ${p(c.meetIdentify, brand)}
        ${p(c.meetFullDay, brand)}
        <a href="${escapeHtml(links.mapsUrl)}" style="display:inline-block;font-size:14px;font-weight:700;color:${brand.hielo};text-decoration:underline;">
          ${escapeHtml(c.mapsCta)}
        </a>
      `,
      brand,
      "12px",
    )}

    ${card(
      `
        ${sectionTitle(c.checklistTitle, brand)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${checklistRows}</table>
      `,
      brand,
      "12px",
    )}

    ${card(
      `
        ${sectionTitle(c.dayOfTitle, brand)}
        ${p(c.dayOfBody, brand)}
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-radius:999px;background:${brand.accent};">
              <a href="${escapeHtml(links.whatsappUrl)}" style="display:inline-block;padding:11px 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${brand.white};text-decoration:none;">
                ${escapeHtml(c.dayOfCta)}
              </a>
            </td>
          </tr>
        </table>
      `,
      brand,
      "12px",
    )}
`;
}
