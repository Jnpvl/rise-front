import copy from './servicios.json';

export type HomeServiceCard = {
  key: string;
  name: string;
  slug: string;
  summary: string;
  icon: 'stethoscope' | 'foot' | 'bandage' | 'flask' | 'clipboard' | 'bone';
};

export const HOME_COPY = {
  h1: copy.home.h1,
  heroLead: 'Levántate, recupérate, mejora.',
  heroSupport: 'En Servicios Médicos RISE te recibimos con atención cercana, clara y profesional, con tiempo para escucharte y resolver tus dudas.',
  processIntro: 'En RISE acompañamos tu salud con procesos claros: desde la primera valoración hasta el seguimiento.',
  servicesIntro: 'Ofrecemos consulta de medicina general, podología y revisión de pie diabético, curaciones, análisis clínicos, antidoping, yesos e inmovilización, y suturas y retiro de puntos, además de sueros y procedimientos menores. En cada caso, el médico valora y decide qué procede.',
  serviceCards: [
    { key: 'consulta', name: 'Consulta de medicina general', slug: '/servicios/consulta-medicina-general', summary: 'En Servicios Médicos RISE te atendemos en consulta de medicina general en Hermosillo, con tiempo para escucharte y resolver tus dudas. Es un buen punto de partida cuando no sabes con quién acudir o quieres una valoración de tu salud.', icon: 'stethoscope' },
    { key: 'podologia', name: 'Podología y pie diabético', slug: '/servicios/podologia-pie-diabetico', summary: 'En Servicios Médicos RISE ofrecemos atención podológica en Hermosillo: revisamos tus pies y uñas y, según tu caso, te orientamos sobre el cuidado que corresponde. Si vives con diabetes, también damos revisión y cuidado preventivo del pie, con indicaciones claras para el día a día.', icon: 'foot' },
    { key: 'curaciones', name: 'Curaciones', slug: '/servicios/curaciones', summary: 'En Servicios Médicos RISE realizamos curaciones en Hermosillo: limpieza y cuidado de heridas menores y cambio de vendajes o apósitos, siempre con valoración del médico. Es un servicio pensado para quien necesita atender una herida o darle seguimiento con indicaciones claras.', icon: 'bandage' },
    { key: 'analisis', name: 'Análisis clínicos', slug: '/servicios/analisis-clinicos', summary: 'En Servicios Médicos RISE puedes consultar por análisis clínicos en Hermosillo. Son estudios que ayudan al médico a conocer mejor tu estado de salud y a dar seguimiento a tu caso. Ofrecemos una variedad de estudios, y el médico te orienta sobre cuáles convienen según tu situación.', icon: 'flask' },
    { key: 'antidoping', name: 'Antidoping', slug: '/servicios/antidoping', summary: 'En Servicios Médicos RISE ofrecemos el servicio de antidoping en Hermosillo. Es una prueba que algunas empresas, escuelas o trámites piden como parte de un proceso, y aquí puedes resolver tus dudas con atención cercana y clara.', icon: 'clipboard' },
    { key: 'yesos', name: 'Yesos, férulas y retiro de puntos', slug: '/servicios/yesos-puntos', summary: 'En Servicios Médicos RISE te atendemos en Hermosillo cuando necesitas inmovilización con yeso o férula, suturas (puntos) en heridas menores o retiro de puntos. Todo parte de una valoración del médico, quien decide qué procede según tu situación.', icon: 'bone' },
  ] as HomeServiceCard[],
  steps: [
    { number: '1', title: 'Agenda', text: 'Elige un horario o déjanos tus datos y te confirmamos.' },
    { number: '2', title: 'Consulta', text: 'Atención médica con tiempo para escucharte y resolver dudas.' },
    { number: '3', title: 'Seguimiento', text: 'Indicaciones, próxima cita si hace falta y tu historial al día.' },
  ],
  agendaIntro: 'Completa el formulario y nos pondremos en contacto para confirmar el horario. Estamos en la Col. Constitución, en Hermosillo, de lunes a viernes de 9:00 a 13:00. Para información detallada de cualquier servicio, escríbenos por WhatsApp al 662 353 3813. Ante una urgencia grave, acude a urgencias o llama al 911.',
};
