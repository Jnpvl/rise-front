export type ConsultationTemplateKey = 'general' | 'podology';

export interface ConsultationTemplateOption {
  key: ConsultationTemplateKey;
  title: string;
  description: string;
  ready: boolean;
}

export const CONSULTATION_TEMPLATES: ConsultationTemplateOption[] = [
  {
    key: 'general',
    title: 'Médico general',
    description:
      'Consulta clínica general: signos vitales, exploración, diagnóstico, indicaciones y receta.',
    ready: true,
  },
  {
    key: 'podology',
    title: 'Podología',
    description:
      'Seguimiento podológico: exploración por padecimiento, tipo de pie, diagramas dorsal y plantar, terapéutica y consentimiento.',
    ready: true,
  },
];

export function getConsultationTemplate(
  key: string | null | undefined
): ConsultationTemplateOption {
  return (
    CONSULTATION_TEMPLATES.find((t) => t.key === key) ||
    CONSULTATION_TEMPLATES[0]
  );
}
