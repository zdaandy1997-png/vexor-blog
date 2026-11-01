// ============================================================
//  CONFIGURAÇÕES DO BLOG — é só mudar aqui
// ============================================================

export const SITE_NAME = 'VEXOR Blog';
export const SITE_TAGLINE = 'Ciencia simple para el bienestar masculino';
export const SITE_DESCRIPTION =
  'Guías claras y basadas en evidencia sobre control, ansiedad de desempeño, hábitos y bienestar íntimo masculino. Sin juicios y sin promesas milagrosas.';

// Para onde vão os botões de chamada (o quiz / página de venda do low ticket)
export const CTA_URL = 'https://vexorhealth.com/';

// Autor / equipe editorial (E-E-A-T: o Google quer saber quem escreve)
export const AUTHOR = {
  name: 'Equipo Editorial VEXOR',
  bio: 'Redactamos guías educativas sobre bienestar masculino a partir de fuentes médicas y científicas reconocidas. Nuestro contenido no sustituye la consulta con un profesional de la salud.',
};

export const CONTACT_EMAIL = 'contacto@vexorhealth.com';

// Google AdSense: cole aqui o seu ID quando o AdSense aprovar (ex.: 'ca-pub-1234567890123456').
// Enquanto estiver vazio, nenhum anúncio aparece.
export const ADSENSE_CLIENT = '';

// Categorias (temas) do blog
export const CATEGORIES = {
  control: {
    name: 'Control y duración',
    description: 'Técnicas, ejercicios y explicaciones sobre la eyaculación precoz y el control.',
  },
  ansiedad: {
    name: 'Ansiedad y mente',
    description: 'Ansiedad de desempeño, estrés, respiración y confianza en la intimidad.',
  },
  ereccion: {
    name: 'Erección y circulación',
    description: 'Cómo funciona la erección, qué la afecta y qué hábitos la cuidan.',
  },
  habitos: {
    name: 'Hábitos y energía',
    description: 'Sueño, alimentación, ejercicio y estilo de vida para el bienestar masculino.',
  },
  pareja: {
    name: 'Pareja y comunicación',
    description: 'Cómo hablar del tema, reducir la presión y mejorar la conexión.',
  },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
