import { site } from "./site";

export type FaqCategory = "reservas" | "estacion" | "clase";

export type Faq = {
  id: string;
  category: FaqCategory;
  questionEs: string;
  answerEs: string;
  questionEn: string;
  answerEn: string;
  sortOrder: number;
};

export const FAQ_CATEGORIES: {
  id: FaqCategory;
  labelEs: string;
  labelEn: string;
  descriptionEs: string;
  descriptionEn: string;
}[] = [
  {
    id: "reservas",
    labelEs: "Reservas y precios",
    labelEn: "Bookings & prices",
    descriptionEs: "Reserva, pago, IVA y quién cabe en la clase.",
    descriptionEn: "Booking, payment, VAT and group size.",
  },
  {
    id: "estacion",
    labelEs: "Antes de subir",
    labelEn: "Before you go up",
    descriptionEs: "Forfait, material, casco y cómo llegar a Borreguiles.",
    descriptionEn: "Lift pass, equipment, helmet and how to reach Borreguiles.",
  },
  {
    id: "clase",
    labelEs: "El día de la clase",
    labelEn: "On lesson day",
    descriptionEs: "Retrasos, idiomas y qué pasa si cierra Cetursa.",
    descriptionEn: "Delays, languages and what happens if Cetursa closes.",
  },
];

export const FAQ_HIGHLIGHTS: {
  id: string;
  faqId: string;
  titleEs: string;
  titleEn: string;
  bodyEs: string;
  bodyEn: string;
}[] = [
  {
    id: "tiempo",
    faqId: "cuanto-tiempo",
    titleEs: "Regla de 90 minutos",
    titleEn: "90-minute rule",
    bodyEs: "Estate en Pradollano al menos 1 h 30 min antes de tu clase.",
    bodyEn: "Be in Pradollano at least 1 hour 30 minutes before your lesson.",
  },
  {
    id: "forfait",
    faqId: "forfait",
    titleEs: "Forfait aparte",
    titleEn: "Lift pass separate",
    bodyEs: "Cajeros en los parkings y en la Silla del Pueblo.",
    bodyEn: "Machines in the car parks and at the Village chairlift.",
  },
  {
    id: "encuentro",
    faqId: "punto-encuentro",
    titleEs: "Punto de encuentro",
    titleEn: "Meeting point",
    bodyEs: "Salida a la nieve del Telecabina Al-Andalus, en Borreguiles.",
    bodyEn: "Snow exit of the Al-Andalus gondola, in Borreguiles.",
  },
  {
    id: "pago",
    faqId: "como-pago",
    titleEs: "Sin pago online",
    titleEn: "No online payment",
    bodyEs: "Envías la solicitud. El pago va con tu instructor/a.",
    bodyEn: "Send the request. You pay with your instructor.",
  },
];

export const faqs: Faq[] = [
  {
    id: "como-reservo",
    category: "reservas",
    sortOrder: 1,
    questionEs: "¿Cómo reservo mi clase?",
    answerEs: `Reserva desde la web. Te confirmamos por email y no hay pago online.

1. Elige tus clases en [Reservar](/reserva)
2. Indica fechas y cuántas personas sois
3. Envía la solicitud

Si te va mejor hablar con nosotros:
- [WhatsApp](${site.whatsappUrl})
- [${site.phoneDisplay}](tel:${site.phone})
- [${site.email}](mailto:${site.email})

Respondemos de 9:00 a 20:00.

> 10% de descuento si reservas antes del 1 de noviembre de 2026.`,
    questionEn: "How do I book my lesson?",
    answerEn: `Book on the website. We confirm by email and there is no online payment.

1. Choose your lessons at [Book](/reserva)
2. Add dates and group size
3. Send the request

If you would rather talk to us:
- [WhatsApp](${site.whatsappUrl})
- [${site.phoneDisplay}](tel:${site.phone})
- [${site.email}](mailto:${site.email})

We reply from 9:00 am to 8:00 pm.

> 10% off if you book before 1 November 2026.`,
  },
  {
    id: "forfait",
    category: "estacion",
    sortOrder: 2,
    questionEs: "¿Necesito forfait para las clases? ¿Dónde lo saco?",
    answerEs: `Sí. Lo vende Cetursa, no Explora, y no va incluido en la clase. Cada persona que suba a los remontes necesita el suyo, también los niños.

1. Cómpralo con antelación en [sierranevada.es](https://www.sierranevada.es)
2. O recógelo el mismo día en un cajero de forfait
3. Si prefieres, también en taquilla de Plaza de Andalucía

Cajeros automáticos:
- En los parkings
- En la estación media de la Silla del Pueblo
- En la estación superior de la Silla del Pueblo

- [sierranevada.es](https://www.sierranevada.es)
- [Guía del forfait](/blog/forfait-sierra-nevada-guia-compra)

> El cajero te ahorra la cola de taquilla. Añade el seguro de accidentes.`,
    questionEn: "Do I need a lift pass for the lessons? Where do I get it?",
    answerEn: `Yes. Cetursa sells it, not Explora, and it is not included in the lesson. Everyone using the lifts needs their own pass, including children.

1. Buy it in advance at [sierranevada.es](https://www.sierranevada.es)
2. Or collect it on the day at a lift-pass machine
3. If you prefer, also at the Plaza de Andalucía ticket office

Automatic machines:
- In the car parks
- At the middle station of the Village chairlift (Silla del Pueblo)
- At the top station of the Village chairlift (Silla del Pueblo)

- [sierranevada.es](https://www.sierranevada.es)
- [Lift-pass guide](/blog/forfait-sierra-nevada-guia-compra)

> The machine skips the ticket-office queue. Add accident insurance.`,
  },
  {
    id: "punto-encuentro",
    category: "estacion",
    sortOrder: 3,
    questionEs: "¿Dónde está el punto de encuentro?",
    answerEs: `En Borreguiles (2.700 m), justo a la salida a la nieve del Telecabina Al-Andalus.

1. Sube en el Telecabina Al-Andalus
2. Sal a la nieve
3. Busca la chaqueta oficial de Explora School & Club

- [Google Maps](${site.meetingPoint.googleMapsUrl})
- [Cómo llegar](/como-llegar)

> Si tu reserva es de día completo con recogida, te confirmamos otro punto. Puede no ser Borreguiles.`,
    questionEn: "Where is the meeting point?",
    answerEn: `In Borreguiles (2,700 m), right at the snow exit of the Al-Andalus gondola.

1. Take the Al-Andalus gondola
2. Step out onto the snow
3. Look for the official Explora School & Club jacket

- [Google Maps](${site.meetingPoint.googleMapsUrl})
- [Getting here](/como-llegar)

> If your booking is a full day with pick-up, we will confirm another point. It may not be Borreguiles.`,
  },
  {
    id: "material",
    category: "estacion",
    sortOrder: 4,
    questionEs: "¿Necesito material de esquí, snowboard o telemark?",
    answerEs: `Sí. Trae el tuyo o alquila en la estación.

Recomendamos el alquiler de **José Luis Sáez**: con Explora tienes un **20% de descuento** (dilo al recoger el equipo). Está junto a los telecabinas Al-Andalus y Borreguiles, en Pradollano.

Lleva:
- Esquís o tabla, y botas
- Bastones si esquías
- Guantes, gafas y ropa impermeable
- Protección solar

- [Cómo llegar al alquiler](${site.rentalPartner.googleMapsUrl})
- [Qué llevar el primer día](/blog/que-llevar-primer-dia-nieve)
- [Reservar](/reserva)

> Si alquilas el mismo día, suma 20–40 minutos extra.`,
    questionEn: "Do I need ski, snowboard or telemark equipment?",
    answerEn: `Yes. Bring your own or rent at the resort.

We recommend **José Luis Sáez** rental: with Explora you get **20% off** (mention it when you pick up). They are next to the Al-Andalus and Borreguiles gondolas in Pradollano.

Bring:
- Skis or board, and boots
- Poles if you ski
- Gloves, goggles and waterproof clothing
- Sun protection

- [Directions to the rental shop](${site.rentalPartner.googleMapsUrl})
- [What to bring on day one](/blog/que-llevar-primer-dia-nieve)
- [Book](/reserva)

> If you rent on the day, add an extra 20–40 minutes.`,
  },
  {
    id: "que-incluye",
    category: "reservas",
    sortOrder: 5,
    questionEs: "¿Qué incluye el precio de la clase?",
    answerEs: `La enseñanza con instructor/a titulado/a. Todos los precios llevan IVA.

No incluye:
- Forfait
- Material de alquiler

El forfait se saca en [sierranevada.es](https://www.sierranevada.es), en los cajeros de los parkings y de la Silla del Pueblo, o en Plaza de Andalucía.

Para el material recomendamos **José Luis Sáez** (junto a los telecabinas Al-Andalus y Borreguiles) con un **20% de descuento** por ser alumno de Explora. Indícalo al alquilar.

- [Clases y tarifas](/clases)
- [Cómo llegar al alquiler](${site.rentalPartner.googleMapsUrl})
- [Reservar](/reserva)`,
    questionEn: "What is included in the lesson price?",
    answerEn: `Instruction with a qualified instructor. All prices include VAT.

It does not include:
- Lift pass
- Rental equipment

Get your pass at [sierranevada.es](https://www.sierranevada.es), at the machines in the car parks and at the Village chairlift (Silla del Pueblo), or at Plaza de Andalucía.

For equipment we recommend **José Luis Sáez** (next to the Al-Andalus and Borreguiles gondolas) with **20% off** as an Explora student. Mention it when you rent.

- [Lessons and prices](/clases)
- [Directions to the rental shop](${site.rentalPartner.googleMapsUrl})
- [Book](/reserva)`,
  },
  {
    id: "como-pago",
    category: "reservas",
    sortOrder: 6,
    questionEs: "¿Hay que pagar al reservar?",
    answerEs: `No. La solicitud va por email y no cobramos online.

1. Envías la reserva
2. Te confirmamos disponibilidad
3. Abonas la clase con tu instructor/a

En la confirmación verás un total estimado.

> El precio definitivo se cierra al confirmar grupo, horario y extras.`,
    questionEn: "Do I pay when I book?",
    answerEn: `No. The request goes by email and we do not charge online.

1. You send the booking
2. We confirm availability
3. You pay for the lesson with your instructor

You will see an estimated total in the confirmation.

> The final price is settled when the group, schedule and extras are confirmed.`,
  },
  {
    id: "cuanto-tiempo",
    category: "estacion",
    sortOrder: 7,
    questionEs: "¿Con cuánto tiempo debo llegar?",
    answerEs: `Estate en Pradollano al menos 1 hora y 30 minutos antes de la clase.

Entre medias suele irse ese tiempo en:
- Aparcar
- Sacar el forfait
- Alquilar material, si lo necesitas
- Subir en el Telecabina Al-Andalus

Si alquilas, ve a **José Luis Sáez** (junto a los telecabinas Al-Andalus y Borreguiles): con Explora tienes un **20% de descuento**. Di que vienes de Explora.

El telecabina tarda 10–15 minutos. En hora punta (9:30–11:00) la fila puede ser de 15–30 minutos: métete en ella 40 minutos antes.

Aparcamiento recomendado: Parking Subterráneo Plaza de Andalucía. Lleva cadenas o fundas por si son obligatorias.

- [Cómo llegar al alquiler](${site.rentalPartner.googleMapsUrl})
- [Punto de encuentro](/como-llegar)

> La regla es 90 minutos. Más vale sobrar que llegar tarde a la nieve.`,
    questionEn: "How early should I arrive?",
    answerEn: `Be in Pradollano at least 1 hour 30 minutes before the lesson.

That time usually goes on:
- Parking
- Collecting the lift pass
- Renting equipment, if you need it
- Taking the Al-Andalus gondola

If you rent, go to **José Luis Sáez** (next to the Al-Andalus and Borreguiles gondolas): with Explora you get **20% off**. Say you are with Explora.

The gondola ride is 10–15 minutes. At peak times (9:30–11:00 am) the queue can be 15–30 minutes: join it 40 minutes before.

Recommended parking: Plaza de Andalucía underground car park. Carry snow chains or socks in case they are required.

- [Directions to the rental shop](${site.rentalPartner.googleMapsUrl})
- [Meeting point](/como-llegar)

> The rule is 90 minutes. Better early than late on the snow.`,
  },
  {
    id: "casco",
    category: "estacion",
    sortOrder: 8,
    questionEs: "¿El casco es obligatorio?",
    answerEs: `No es obligatorio en la estación. En Explora sí lo recomendamos, sobre todo con niños.

Puedes:
- Traer el tuyo
- Alquilarlo con el resto del material en **José Luis Sáez** (20% de descuento con Explora; junto a los telecabinas)

- [Cómo llegar al alquiler](${site.rentalPartner.googleMapsUrl})

> En clase, el casco es la opción más segura.`,
    questionEn: "Is a helmet mandatory?",
    answerEn: `It is not mandatory at the resort. At Explora we do recommend it, especially with children.

You can:
- Bring your own
- Rent it with the rest of the equipment at **José Luis Sáez** (20% off with Explora; next to the gondolas)

- [Directions to the rental shop](${site.rentalPartner.googleMapsUrl})

> For lessons, a helmet is the safer choice.`,
  },
  {
    id: "cierre-estacion",
    category: "clase",
    sortOrder: 9,
    questionEs: "¿Qué ocurre si cierra la estación?",
    answerEs: `Si Cetursa cierra de forma obligatoria, la clase se suspende y te devolvemos el importe.

Si solo se retrasa la apertura:
1. Esperamos la hora oficial de apertura
2. La clase empieza una hora después
3. Reajustamos la sesión para aprovechar la nieve

> Así llegas al punto de encuentro sin ir a la carrera.`,
    questionEn: "What happens if the resort closes?",
    answerEn: `If Cetursa closes the resort mandatorily, the lesson is cancelled and you get a full refund.

If opening is only delayed:
1. We wait for the official opening time
2. The lesson starts one hour later
3. We rearrange the session so you still get time on snow

> That way you reach the meeting point without rushing.`,
  },
  {
    id: "llego-tarde",
    category: "clase",
    sortOrder: 10,
    questionEs: "¿Qué ocurre si llego tarde?",
    answerEs: `Si el retraso está justificado, se puede recuperar tiempo si tu instructor/a tiene hueco. Un retraso al inicio recorta la clase.

Si hay un imprevisto grave de tráfico o aparcamiento, avísanos al momento:
- [WhatsApp](${site.whatsappUrl})
- [${site.phoneDisplay}](tel:${site.phone})

> La regla de 90 minutos evita casi todos estos apuros.`,
    questionEn: "What happens if I arrive late?",
    answerEn: `With a justified delay, lost time can be recovered if your instructor has a slot. A late start cuts the lesson short.

If traffic or parking goes seriously wrong, message us straight away:
- [WhatsApp](${site.whatsappUrl})
- [${site.phoneDisplay}](tel:${site.phone})

> The 90-minute rule avoids almost all of these scrambles.`,
  },
  {
    id: "idiomas",
    category: "clase",
    sortOrder: 11,
    questionEs: "¿En qué idiomas se imparten las clases?",
    answerEs: `En español e inglés, también la atención al cliente.

Si necesitas otro idioma, dilo al reservar y vemos disponibilidad.

- [Reservar](/reserva)
- [WhatsApp](${site.whatsappUrl})`,
    questionEn: "What languages are lessons taught in?",
    answerEn: `Spanish and English, including customer service.

If you need another language, say so when you book and we will check availability.

- [Book](/reserva)
- [WhatsApp](${site.whatsappUrl})`,
  },
  {
    id: "iva",
    category: "reservas",
    sortOrder: 12,
    questionEs: "¿Los precios incluyen IVA?",
    answerEs: `Sí. Todos los precios publicados llevan el IVA incluido.

- [Clases y tarifas](/clases)

> Lo que ves es lo que pagas. Sin extras de impuesto al final.`,
    questionEn: "Do prices include VAT?",
    answerEn: `Yes. All published prices include VAT.

- [Lessons and prices](/clases)

> What you see is what you pay. No tax surprise at the end.`,
  },
  {
    id: "edades-minimas",
    category: "reservas",
    sortOrder: 13,
    questionEs: "¿Desde qué edad se pueden contratar clases?",
    answerEs: `Desde 3 años, con instructor/a. Máximo 8 participantes por sesión.

De 5 a 18 años también puedes apuntarte al Club:
- [Club Creando Aventuras](/club)
- [Reservar](/reserva)

> El Club son jornadas de progresión a lo largo de la temporada.`,
    questionEn: "What is the minimum age for lessons?",
    answerEn: `From 3 years old, with an instructor. Maximum 8 participants per session.

Ages 5 to 18 can also join the Club:
- [Club Creando Aventuras](/club)
- [Book](/reserva)

> The Club is progression days through the season.`,
  },
  {
    id: "tamano-grupo",
    category: "reservas",
    sortOrder: 14,
    questionEs: "¿Cuál es el máximo de participantes por clase?",
    answerEs: `Máximo 8 personas. Duración mínima: 2 horas.

En particulares:
- 1 y 2 personas pagan el mismo precio total
- A partir de la 3.ª persona hay un extra

- [Clases y tarifas](/clases)
- [Reservar](/reserva)`,
    questionEn: "What is the maximum number of participants per lesson?",
    answerEn: `Maximum 8 people. Minimum duration: 2 hours.

In private lessons:
- 1 and 2 people pay the same total
- From the 3rd person an extra applies

- [Lessons and prices](/clases)
- [Book](/reserva)`,
  },
  {
    id: "como-llegar",
    category: "estacion",
    sortOrder: 15,
    questionEs: "¿Cómo llego a Sierra Nevada y a Explora?",
    answerEs: `Sierra Nevada está a unos 30 km de Granada: unos 40 minutos por la A-395. Puedes ir en coche, autobús o transfer.

1. Sube a Pradollano (a partir de las 8:30–9:00 hay más tráfico)
2. Aparca: recomendamos el Parking Subterráneo Plaza de Andalucía
3. Saca el forfait si no lo tienes
4. Sube en el Telecabina Al-Andalus hasta Borreguiles

- [Cómo llegar](/como-llegar)
- [Google Maps](${site.meetingPoint.googleMapsUrl})

> Deja margen. La subida se llena pronto.`,
    questionEn: "How do I get to Sierra Nevada and Explora?",
    answerEn: `Sierra Nevada is about 30 km from Granada: around 40 minutes via the A-395. You can come by car, bus or transfer.

1. Drive up to Pradollano (from 8:30–9:00 am the road gets busier)
2. Park: we recommend the Plaza de Andalucía underground car park
3. Collect your lift pass if you do not have it yet
4. Take the Al-Andalus gondola up to Borreguiles

- [Getting here](/como-llegar)
- [Google Maps](${site.meetingPoint.googleMapsUrl})

> Leave extra time. The road up fills early.`,
  },
];

export function getFaqById(id: string): Faq | undefined {
  return faqs.find((f) => f.id === id);
}

export function getFaqsSorted(): Faq[] {
  return [...faqs].sort((a, b) => a.sortOrder - b.sortOrder);
}
