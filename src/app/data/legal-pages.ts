export interface LegalPage {
  key: 'privacy' | 'terms';
  path: string;
  navLabel: string;
  title: string;
  description: string;
  heading: string;
  bodyHtml: string;
}

export const LEGAL_PAGES: LegalPage[] = [
  {
    key: 'privacy',
    path: '/aviso-de-privacidad',
    navLabel: 'Aviso de privacidad',
    title: 'Aviso de privacidad para pacientes | Servicios Médicos RISE',
    description: 'Conoce cómo Servicios Médicos RISE trata los datos, cookies propias y mapas de Google, tus derechos ARCO y los servicios técnicos del sitio.',
    heading: 'Aviso de Privacidad — Servicios Médicos RISE',
    bodyHtml: `
      <p><strong>Última actualización:</strong> 4 de octubre de 2026</p>
      <p><strong>Servicios Médicos RISE</strong>, con domicilio en C. Benito Juárez 177, Col. Constitución, Hermosillo, Sonora, es responsable del tratamiento de los datos personales que usted nos proporcione, conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
      <h2>Qué información recibimos</h2>
      <p>Este sitio no recopila información personal de forma automática. No utilizamos cookies de rastreo propias, herramientas de analítica ni píxeles publicitarios. Algunos recursos de terceros, como las fuentes de Google, pueden funcionar con sus propias cookies.</p>
      <p>Solo recibimos los datos que usted decide compartirnos voluntariamente, por ejemplo al escribirnos por WhatsApp, llamarnos por teléfono o enviar el formulario de contacto.</p>
      <h2>Para qué los usamos</h2>
      <p>Usamos esos datos únicamente para responder a su mensaje, agendar su cita y darle seguimiento. No vendemos su información ni la compartimos con terceros con fines comerciales; solo se procesa mediante los servicios técnicos necesarios para operar el sitio y enviarnos su mensaje, o cuando la ley lo exija. La información relacionada con su atención se maneja con confidencialidad.</p>
      <h2>Sus derechos</h2>
      <p>Usted puede solicitar en cualquier momento el acceso, rectificación, cancelación u oposición (derechos ARCO) respecto de sus datos, o retirar su consentimiento, escribiendo a <a href="mailto:serviciomedicorise@gmail.com">serviciomedicorise@gmail.com</a> o por WhatsApp al <a href="tel:+526623533813">662 353 3813</a>.</p>
      <h2>Cambios a este aviso</h2>
      <p>Cualquier cambio a este aviso se publicará en este sitio, indicando la fecha de actualización.</p>
    `,
  },
  {
    key: 'terms',
    path: '/terminos',
    navLabel: 'Términos y condiciones',
    title: 'Términos de uso del sitio | Servicios Médicos RISE',
    description: 'Consulta los términos de uso de Servicios Médicos RISE, la información médica del sitio, citas, urgencias, propiedad intelectual y contacto.',
    heading: 'Términos y Condiciones — Servicios Médicos RISE',
    bodyHtml: `
      <p><strong>Última actualización:</strong> 4 de octubre de 2026</p>
      <p>Estos términos aplican al uso de este sitio de <strong>Servicios Médicos RISE</strong>, con domicilio en C. Benito Juárez 177, Col. Constitución, Hermosillo, Sonora. Al usar el sitio, usted acepta estos términos.</p>
      <h2>Información del sitio</h2>
      <p>La información sobre nuestros servicios es general e informativa. No constituye diagnóstico, tratamiento ni consejo médico personalizado; cada caso es valorado directamente por el personal de salud en consulta.</p>
      <h2>No sustituye la atención médica</h2>
      <p>El contenido del sitio no sustituye una consulta médica. <strong>Este sitio no es un medio para atender urgencias.</strong> Ante una emergencia, llame al 911 o acuda al servicio de urgencias más cercano.</p>
      <h2>Citas e información</h2>
      <p>Las citas, horarios, costos y cualquier detalle sobre nuestros servicios se confirman por WhatsApp al <a href="tel:+526623533813">662 353 3813</a>. Enviar un mensaje o formulario es una solicitud; la cita queda agendada cuando Servicios Médicos RISE la confirma.</p>
      <h2>Propiedad intelectual</h2>
      <p>La marca, los textos y el diseño del sitio pertenecen a Servicios Médicos RISE o a sus respectivos titulares y no pueden usarse sin autorización.</p>
      <h2>Ley aplicable</h2>
      <p>Estos términos se rigen por las leyes de México y del estado de Sonora. Cualquier controversia se resolverá ante los tribunales competentes de Hermosillo, Sonora.</p>
      <h2>Contacto</h2>
      <p>Para dudas sobre estos términos, escríbanos a <a href="mailto:serviciomedicorise@gmail.com">serviciomedicorise@gmail.com</a> o por WhatsApp al <a href="tel:+526623533813">662 353 3813</a>.</p>
    `,
  },
];
