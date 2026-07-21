export interface LabResultRow {
  id: string;
  name: string;
  value: string;
  unit: string;
  /** Opcional: subtítulo de grupo (ej. Fórmula Roja). Si vacío, no divide. */
  section: string;
  /** Opcional: contexto clínico (ej. Diabético, Fase folicular). Si vacío, no se muestra. */
  status: string;
  /** Texto libre de referencias (rangos, varias líneas, etc.). */
  reference: string;
  note?: string;
}

export interface LabPanel {
  id: string;
  title: string;
  method?: string;
  rows: LabResultRow[];
  notes?: string;
}

export interface LabCaptureDraft {
  studyDate: string;
  panels: LabPanel[];
  generalNotes: string;
}

export interface LabPreviewBlock {
  section: string | null;
  rows: LabResultRow[];
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function todayIsoDate(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function createEmptyLabRow(): LabResultRow {
  return {
    id: uid('row'),
    name: '',
    value: '',
    unit: '',
    section: '',
    status: '',
    reference: '',
    note: '',
  };
}

export function createEmptyPanel(title = 'Nuevo panel'): LabPanel {
  return {
    id: uid('panel'),
    title,
    method: '',
    rows: [createEmptyLabRow()],
    notes: '',
  };
}

export function createEmptyLabDraft(date = new Date()): LabCaptureDraft {
  return {
    studyDate: todayIsoDate(date),
    generalNotes: '',
    panels: [createEmptyPanel('Panel 1')],
  };
}

/** Agrupa filas consecutivas por sección para la vista previa. */
export function groupRowsBySection(rows: LabResultRow[]): LabPreviewBlock[] {
  const blocks: LabPreviewBlock[] = [];

  for (const item of rows) {
    const section = item.section?.trim() || null;
    const last = blocks[blocks.length - 1];
    if (last && last.section === section) {
      last.rows.push(item);
    } else {
      blocks.push({ section, rows: [item] });
    }
  }

  return blocks;
}
