export type ClubOffering = {
  id: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  noteEs?: string;
  noteEn?: string;
  icon: string;
};

export type ClubScheduleItem = {
  timeEs: string;
  timeEn: string;
  titleEs: string;
  titleEn: string;
};

export type ClubFaq = {
  id: string;
  questionEs: string;
  questionEn: string;
  answerEs: string;
  answerEn: string;
};

export const club = {
  name: "Club Deportivo Creando Aventuras",
  website: "https://www.creandoaventuras.com/",
  taglineEs:
    "¡Aventuras, aprendizajes y experiencias en la nieve y la montaña todo el año!",
  taglineEn:
    "Adventures, learning and experiences in the snow and mountains all year round!",
  email: "clubcreandoaventuras@gmail.com",
  phone: "+34667730498",
  phoneDisplay: "+34 667 730 498",
  whatsappUrl: "https://wa.me/34667730498",
  aboutLeadEs:
    "Creando Aventuras nació de la pasión compartida por la montaña y el deseo de crear una comunidad unida por el deporte y la naturaleza.",
  aboutLeadEn:
    "Creando Aventuras was born from a shared passion for the mountains and the desire to build a community united by sport and nature.",
  aboutBodyEs:
    "Hoy, Creando Aventuras es una familia en crecimiento, con miembros de todas las edades y niveles, unidos por la misma pasión que nos impulsó desde el primer día. Diseñado para niños de 5 a 18 años, el club busca ofrecer una progresión continua y técnica en el mundo de la nieve y la montaña, con diversas disciplinas de los deportes de invierno para asegurar una formación integral.",
  aboutBodyEn:
    "Today, Creando Aventuras is a growing family, with members of all ages and levels, united by the same passion that drove us from day one. Designed for children aged 5 to 18, the club offers continuous technical progression in snow and mountain sports, across winter disciplines for well-rounded training.",
  federativeNoteEs:
    "Al inscribirse y federarse en nuestro club, podrás aprovechar nuestras ofertas exclusivas.",
  federativeNoteEn:
    "By enrolling and registering with our club, you can take advantage of our exclusive offers.",
  scheduleNoteEs:
    "Ampliaremos las jornadas y actividades extraordinarias según la demanda y los caprichos de la meteorología.",
  scheduleNoteEn:
    "We will extend sessions and special activities based on demand and weather conditions.",
} as const;

export const clubSchedule: ClubScheduleItem[] = [
  {
    timeEs: "09:00 – 09:30",
    timeEn: "09:00 – 09:30",
    titleEs: "Bienvenida y subida express a la estación",
    titleEn: "Welcome and express ride up to the resort",
  },
  {
    timeEs: "09:30 – 13:00",
    timeEn: "09:30 – 13:00",
    titleEs: "Clases de técnica — ¡conviértete en un pro de la nieve!",
    titleEn: "Technique lessons — become a snow pro!",
  },
  {
    timeEs: "13:00 – 14:00",
    timeEn: "13:00 – 14:00",
    titleEs: "Hora de recargar energía con un buen almuerzo",
    titleEn: "Lunch break to recharge",
  },
  {
    timeEs: "14:00 – final",
    timeEn: "14:00 – end",
    titleEs: "Clases al estilo libre, snowparks y actividades divertidas",
    titleEn: "Freestyle lessons, snowparks and fun activities",
  },
];

export const clubObjectives = [
  {
    titleEs: "Fomentar el deporte",
    titleEn: "Promote sport",
    descEs:
      "Inspirar un estilo de vida activo y saludable a través de la práctica de deportes de montaña, adaptados a todos los niveles y edades.",
    descEn:
      "Inspire an active, healthy lifestyle through mountain sports, adapted to all levels and ages.",
    icon: "🏔",
  },
  {
    titleEs: "Crear comunidad",
    titleEn: "Build community",
    descEs:
      "Construir un espacio de encuentro donde la amistad, el respeto y el compañerismo sean tan importantes como la propia actividad deportiva.",
    descEn:
      "Create a meeting place where friendship, respect and camaraderie matter as much as the sport itself.",
    icon: "🤝",
  },
  {
    titleEs: "Respetar la naturaleza",
    titleEn: "Respect nature",
    descEs:
      "Promover la conciencia ambiental y el cuidado de nuestro entorno natural, para que futuras generaciones también puedan disfrutar de la montaña.",
    descEn:
      "Promote environmental awareness and care for our natural surroundings, so future generations can enjoy the mountains too.",
    icon: "🌿",
  },
];

export const clubOfferings: ClubOffering[] = [
  {
    id: "dias-sueltos",
    titleEs: "Días sueltos",
    titleEn: "Single days",
    descriptionEs: "Prueba nuestras actividades sin compromiso. Precios diferenciados para socios y no socios.",
    descriptionEn: "Try our activities with no commitment. Different prices for members and non-members.",
    icon: "📅",
  },
  {
    id: "membresia",
    titleEs: "Membresía del club",
    titleEn: "Club membership",
    descriptionEs:
      "Únete a nuestra comunidad y disfruta de todos los beneficios: descuentos, seguro de actividades, seguimiento personalizado y acceso prioritario a reservas.",
    descriptionEn:
      "Join our community and enjoy all the benefits: discounts, activity insurance, personalised follow-up and priority booking access.",
    icon: "⭐",
  },
  {
    id: "bonos",
    titleEs: "Bonos de días",
    titleEn: "Day bundles",
    descriptionEs: "Ahorra más con nuestros paquetes de días. Exclusivo para socios del club.",
    descriptionEn: "Save more with our day packages. Exclusive for club members.",
    noteEs: "Solo socios",
    noteEn: "Members only",
    icon: "🎟",
  },
  {
    id: "extras",
    titleEs: "Servicios extras",
    titleEn: "Extra services",
    descriptionEs: "Mejora tu experiencia con servicios adicionales: material, seguros ampliados y más.",
    descriptionEn: "Enhance your experience with additional services: equipment, extended insurance and more.",
    icon: "✨",
  },
];

export const membershipBenefits = [
  {
    textEs: "Acceso a todas las actividades del club",
    textEn: "Access to all club activities",
  },
  {
    textEs: "Descuentos especiales en días sueltos y bonos",
    textEn: "Special discounts on single days and bundles",
  },
  {
    textEs: "Seguro de actividades incluido",
    textEn: "Activity insurance included",
  },
  {
    textEs: "Seguimiento personalizado de tu progresión",
    textEn: "Personalised progression tracking",
  },
  {
    textEs: "Acceso prioritario a reservas",
    textEn: "Priority booking access",
  },
  {
    textEs: "Grupos reducidos (máximo 8 personas)",
    textEn: "Small groups (maximum 8 people)",
  },
];

export const clubNotIncluded = [
  {
    textEs: "Forfait de remonte mecánico",
    textEn: "Lift pass",
  },
  {
    textEs:
      "Material de alquiler — José Luis Sáez (20% dto. con Explora; junto a telecabinas)",
    textEn:
      "Rental equipment — José Luis Sáez (20% off with Explora; next to gondolas)",
  },
  {
    textEs: "Comidas y bebidas",
    textEn: "Food and drinks",
  },
  {
    textEs: "Gastos personales",
    textEn: "Personal expenses",
  },
  {
    textEs: "Transporte desde domicilio",
    textEn: "Transport from home",
  },
];

export const clubConditions = [
  {
    textEs: "Reservas sujetas a disponibilidad",
    textEn: "Bookings subject to availability",
  },
  {
    textEs: "Cancelación gratuita 48 h antes",
    textEn: "Free cancellation 48 h in advance",
  },
  {
    textEs: "Actividades sujetas a condiciones meteorológicas",
    textEn: "Activities subject to weather conditions",
  },
  {
    textEs: "Seguro básico incluido en todas las actividades",
    textEn: "Basic insurance included in all activities",
  },
  {
    textEs: "Descuentos no acumulables",
    textEn: "Discounts cannot be combined",
  },
];

export const clubFaqs: ClubFaq[] = [
  {
    id: "experience",
    questionEs: "¿Necesito experiencia previa para unirme?",
    questionEn: "Do I need previous experience to join?",
    answerEs:
      "¡Para nada! Tenemos grupos para todos los niveles, desde principiantes absolutos hasta expertos. Nuestros instructores se adaptan a tu nivel.",
    answerEn:
      "Not at all! We have groups for all levels, from complete beginners to experts. Our instructors adapt to your level.",
  },
  {
    id: "membership",
    questionEs: "¿Qué incluye la membresía del club?",
    questionEn: "What does club membership include?",
    answerEs:
      "La membresía incluye acceso a todas las actividades, descuentos especiales, seguro de actividades, seguimiento personalizado y acceso prioritario a reservas.",
    answerEn:
      "Membership includes access to all activities, special discounts, activity insurance, personalised follow-up and priority booking access.",
  },
  {
    id: "groups",
    questionEs: "¿Cómo son los grupos de actividades?",
    questionEn: "What are the activity groups like?",
    answerEs:
      "Mantenemos grupos reducidos (máximo 8 personas) para garantizar atención personalizada y seguridad en todas las actividades.",
    answerEn:
      "We keep small groups (maximum 8 people) to ensure personalised attention and safety in all activities.",
  },
];
