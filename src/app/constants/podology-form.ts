export type FootSideSelection = {
  left: boolean;
  right: boolean;
};

export type FootTypeKey = 'griego' | 'egipcio' | 'polinesio' | '';

export interface PodologySpecialtyData {
  followUpDate: string;
  initialObservations: string;
  conditions: Record<string, FootSideSelection>;
  footTypeRight: FootTypeKey;
  footTypeLeft: FootTypeKey;
  feetDiagramDataUrl: string;
  explorationNotes: string;
  hasReferral: boolean | null;
  referralTo: string;
  therapeutics: string;
  treatment: string;
  consentAccepted: boolean;
  patientSignatureDataUrl: string;
  podologistSignatureDataUrl: string;
}

/** Padecimientos en el mismo orden del documento SEGUIMIENTO (dos columnas). */
export const PODOLOGY_CONDITIONS: { key: string; label: string }[] = [
  { key: 'palidez', label: 'Palidez' },
  { key: 'leuconiquia', label: 'Leuconiquia' },
  { key: 'eritema', label: 'Eritema' },
  { key: 'melanoniquia', label: 'Melanoniquia' },
  { key: 'hematoma', label: 'Hematoma' },
  { key: 'oniquia', label: 'Oniquia' },
  { key: 'dermatitis', label: 'Dermatitis' },
  { key: 'coiloniquia', label: 'Coiloniquia' },
  { key: 'alteracionesOseas', label: 'Alteraciones óseas' },
  { key: 'onicoquizia', label: 'Onicoquizia' },
  { key: 'polidactilia', label: 'Polidactilia' },
  { key: 'unaEnDedal', label: 'Uña en dedal' },
  { key: 'sindactilia', label: 'Sindactilia' },
  { key: 'unaMitadYMitad', label: 'Uña mitad y mitad' },
  { key: 'hiperqueratosis', label: 'Hiperqueratosis' },
  { key: 'unasHipocraticas', label: 'Uñas hipocráticas' },
  { key: 'onicomicosis', label: 'Onicomicosis' },
  { key: 'micosisPlantar', label: 'Micosis plantar' },
  { key: 'onicogrifosis', label: 'Onicogrifosis' },
  { key: 'micosisInterdigital', label: 'Micosis interdigital' },
  { key: 'descamacion', label: 'Descamación' },
  { key: 'ulceras', label: 'Úlceras' },
  { key: 'heloma', label: 'Heloma' },
  { key: 'tatuajes', label: 'Tatuajes' },
  { key: 'halluxValgus', label: 'Hallux valgus' },
  { key: 'onicocriptosis', label: 'Onicocriptosis' },
  { key: 'onicolisis', label: 'Onicolisis' },
  { key: 'paroniquia', label: 'Paroniquia' },
  { key: 'onicomadesis', label: 'Onicomadesis' },
  { key: 'onicodistrofia', label: 'Onicodistrofia' },
  { key: 'juaneteSastre', label: 'Juanete sastre' },
];

export const PODOLOGY_FOOT_TYPES: {
  key: Exclude<FootTypeKey, ''>;
  label: string;
}[] = [
  { key: 'griego', label: 'Pie griego' },
  { key: 'egipcio', label: 'Pie egipcio' },
  { key: 'polinesio', label: 'Pie polinesio o cuadrado' },
];

export const PODOLOGY_CONSENT_TEXT =
  'En este documento quedan impresos los datos que he proporcionado y afirmo que son veredictos, después de conocer el tratamiento a seguir que me ha sugerido el Podólogo recibiendo con atención la información respectiva sobre el mismo, lo acepto y autorizo. De acuerdo con el artículo 4° de la Conamed este documento es confidencial e intransferible.';

export function createEmptyPodologyData(
  date = new Date()
): PodologySpecialtyData {
  const pad = (n: number) => String(n).padStart(2, '0');
  const followUpDate = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;

  const conditions: Record<string, FootSideSelection> = {};
  for (const item of PODOLOGY_CONDITIONS) {
    conditions[item.key] = { left: false, right: false };
  }

  return {
    followUpDate,
    initialObservations: '',
    conditions,
    footTypeRight: '',
    footTypeLeft: '',
    feetDiagramDataUrl: '',
    explorationNotes: '',
    hasReferral: null,
    referralTo: '',
    therapeutics: '',
    treatment: '',
    consentAccepted: false,
    patientSignatureDataUrl: '',
    podologistSignatureDataUrl: '',
  };
}

export function parsePodologySpecialtyData(
  raw: unknown
): PodologySpecialtyData {
  const base = createEmptyPodologyData();
  if (!raw) return base;

  let parsed: Partial<PodologySpecialtyData> = {};
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return base;
    }
  } else if (typeof raw === 'object') {
    parsed = raw as Partial<PodologySpecialtyData>;
  }

  const conditions = { ...base.conditions };
  if (parsed.conditions && typeof parsed.conditions === 'object') {
    for (const item of PODOLOGY_CONDITIONS) {
      const value = parsed.conditions[item.key];
      if (value && typeof value === 'object') {
        conditions[item.key] = {
          left: Boolean(value.left),
          right: Boolean(value.right),
        };
      }
    }
  }

  return {
    ...base,
    ...parsed,
    conditions,
    hasReferral:
      parsed.hasReferral === true
        ? true
        : parsed.hasReferral === false
          ? false
          : null,
  };
}
