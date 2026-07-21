import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  inject,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { PatientsService } from '../../services/patients.service';
import { UploadService } from '../../services/upload.service';
import {
  PODOLOGY_CONDITIONS,
  PODOLOGY_CONSENT_TEXT,
  PODOLOGY_FOOT_TYPES,
  PodologySpecialtyData,
  createEmptyPodologyData,
  parsePodologySpecialtyData,
} from '../../constants/podology-form';

type ConsultationTemplateKey = 'general' | 'podology';

type PodologyConditionRow = {
  left: (typeof PODOLOGY_CONDITIONS)[number];
  right: (typeof PODOLOGY_CONDITIONS)[number] | null;
};

interface PrescribedMedication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

interface AttachedDocument {
  fileName?: string;
  fileUrl?: string;
  storedName?: string;
  patientId?: string;
}

interface ConsultationFormModel {
  patientId: string;
  doctorId: string;
  templateKey: ConsultationTemplateKey;
  consultationTypeId: string;
  reasonForConsultation: string;
  initialObservations: string;
  diagnosis: string;
  generalInstructions: string;
  requestedStudies: string;
  bloodPressure: string;
  heartRate: string;
  respiratoryRate: string;
  temperature: string;
  oxygenSaturation: string;
  weight: string | number;
  height: string | number;
  bmi: string | number;
  physicalExam: string;
  currentCondition: string;
  systemReview: string;
  prescribedMedications: PrescribedMedication[];
  nextAppointment: string;
  additionalNotes: string;
  attachedDocuments: AttachedDocument[];
}

function createEmptyConsultationForm(): ConsultationFormModel {
  return {
    patientId: '',
    doctorId: '',
    templateKey: 'general',
    consultationTypeId: '',
    reasonForConsultation: '',
    initialObservations: '',
    diagnosis: '',
    generalInstructions: '',
    requestedStudies: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    temperature: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    bmi: '',
    physicalExam: '',
    currentCondition: '',
    systemReview: '',
    prescribedMedications: [],
    nextAppointment: '',
    additionalNotes: '',
    attachedDocuments: [],
  };
}

const PODOLOGY_CONDITION_ROWS: PodologyConditionRow[] = (() => {
  const rows: PodologyConditionRow[] = [];
  for (let i = 0; i < PODOLOGY_CONDITIONS.length; i += 2) {
    rows.push({
      left: PODOLOGY_CONDITIONS[i],
      right: PODOLOGY_CONDITIONS[i + 1] || null,
    });
  }
  return rows;
})();

@Component({
  selector: 'app-consultation-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './consultation-form.component.html',
})
export class ConsultationFormComponent implements OnInit {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input()
  set consultationData(data: Partial<ConsultationFormModel> & Record<string, unknown> | null) {
    if (!data) return;
    this.form = {
      ...this.form,
      ...this.pickFormFields(data),
      templateKey: data['templateKey'] === 'podology' ? 'podology' : 'general',
    };
    if (!Array.isArray(this.form.attachedDocuments)) {
      this.form.attachedDocuments = [];
    }
    if (!Array.isArray(this.form.prescribedMedications)) {
      this.form.prescribedMedications = [];
    }
    if (data['nextAppointment']) {
      const d = new Date(String(data['nextAppointment']));
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => String(n).padStart(2, '0');
        this.form.nextAppointment = `${d.getFullYear()}-${pad(
          d.getMonth() + 1
        )}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
    }
    if (data['patientId']) {
      void this.loadSelectedPatient(String(data['patientId']));
    }
    if (this.form.templateKey === 'podology') {
      this.podology = parsePodologySpecialtyData(data['specialtyData']);
      this.scheduleCanvasInit();
    }
  }
  @Input() showBackButton = true;
  @Input() allowChangeTemplate = false;

  @Input() patientsList: any[] = [];
  @Input() staffMap: { [id: string]: any } = {};
  @Input() getStaffNameFn: (id: string) => string = (id: string) => id;

  @Output() formSubmitted = new EventEmitter<Record<string, unknown>>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() goBackClicked = new EventEmitter<void>();
  @Output() changeTemplateClicked = new EventEmitter<void>();

  @ViewChild('feetCanvas') feetCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('patientSignCanvas')
  patientSignCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('podologistSignCanvas')
  podologistSignCanvasRef?: ElementRef<HTMLCanvasElement>;

  readonly podologyConditions = PODOLOGY_CONDITIONS;
  readonly podologyFootTypes = PODOLOGY_FOOT_TYPES;
  readonly podologyConsentText = PODOLOGY_CONSENT_TEXT;
  readonly podologyConditionRows = PODOLOGY_CONDITION_ROWS;

  form: ConsultationFormModel = createEmptyConsultationForm();

  podology: PodologySpecialtyData = createEmptyPodologyData();

  isLoading = false;
  isUploading = false;
  uploadError = '';
  pendingFileDeletes: Array<{ patientId: string; storedName: string }> = [];

  selectedPatient: any = null;
  showPatientSidebar = false;

  private patientsService = inject(PatientsService);
  private uploadService = inject(UploadService);

  private drawingTarget: 'feet' | 'patient' | 'podologist' | null = null;
  private drawing = false;
  private canvasInitToken = 0;

  async ngOnInit() {
    if (this.form.patientId) {
      await this.loadSelectedPatient(this.form.patientId);
    }
    if (this.isPodologyTemplate) {
      this.scheduleCanvasInit();
    }
  }

  get isPodologyTemplate(): boolean {
    return this.form.templateKey === 'podology';
  }

  get templateLabel(): string {
    return this.isPodologyTemplate ? 'Podología' : 'Médico general';
  }

  get patientDisplayName(): string {
    if (!this.selectedPatient) return '';
    return `${this.selectedPatient.firstName || ''} ${
      this.selectedPatient.lastName || ''
    }`.trim();
  }

  changeTemplate() {
    this.changeTemplateClicked.emit();
  }

  trackConditionRow(_index: number, row: PodologyConditionRow): string {
    return row.left.key;
  }

  async loadSelectedPatient(patientId: string) {
    try {
      this.selectedPatient = await this.patientsService.getPatientById(
        String(patientId)
      );
      this.showPatientSidebar = !!this.selectedPatient;
    } catch {
      this.selectedPatient = null;
      this.showPatientSidebar = false;
    }
  }

  onWeightOrHeightChange() {
    const weight = parseFloat(this.form.weight as any);
    const height = parseFloat(this.form.height as any);
    if (weight > 0 && height > 0) {
      this.form.bmi = +(weight / (height * height)).toFixed(2);
    } else {
      this.form.bmi = '';
    }
  }

  submit(formRef: NgForm) {
    if (formRef.invalid || this.isLoading || this.isUploading) return;

    if (this.isPodologyTemplate) {
      this.capturePodologyCanvases();
      if (!this.form.patientId) return;
      if (!this.podology.consentAccepted) return;
      if (
        !this.podology.patientSignatureDataUrl ||
        !this.podology.podologistSignatureDataUrl
      ) {
        return;
      }

      this.isLoading = true;
      this.formSubmitted.emit({
        patientId: this.form.patientId,
        doctorId: this.form.doctorId,
        templateKey: 'podology',
        consultationTypeId: 'Seguimiento podológico',
        reasonForConsultation:
          this.podology.initialObservations || 'Seguimiento podológico',
        diagnosis: this.podology.treatment || 'Seguimiento podológico',
        generalInstructions:
          this.podology.therapeutics ||
          this.podology.treatment ||
          'Ver terapéutica y tratamiento',
        initialObservations: this.podology.initialObservations,
        additionalNotes: this.podology.explorationNotes,
        specialtyData: { ...this.podology },
        prescribedMedications: [],
        attachedDocuments: this.form.attachedDocuments || [],
        __pendingFileDeletes: [...this.pendingFileDeletes],
      });
      return;
    }

    this.isLoading = true;
    this.formSubmitted.emit({
      ...this.form,
      templateKey: this.form.templateKey || 'general',
      __pendingFileDeletes: [...this.pendingFileDeletes],
    });
  }

  clearPendingFileDeletes() {
    this.pendingFileDeletes = [];
  }

  resetLoading() {
    this.isLoading = false;
  }

  cancel() {
    this.formCancelled.emit();
  }

  goBack() {
    this.goBackClicked.emit();
  }

  addMedication() {
    if (!this.form.prescribedMedications) {
      this.form.prescribedMedications = [];
    }
    this.form.prescribedMedications.push({
      name: '',
      dose: '',
      frequency: '',
      duration: '',
    });
  }

  removeMedication(index: number) {
    this.form.prescribedMedications?.splice(index, 1);
  }

  removeDocument(index: number) {
    const docs = this.form.attachedDocuments;
    if (!docs?.[index]) return;

    const doc = docs[index];
    const parsed =
      doc.storedName && (doc.patientId || this.form.patientId)
        ? {
            patientId: String(doc.patientId || this.form.patientId),
            storedName: String(doc.storedName),
          }
        : this.uploadService.parseUploadUrl(doc.fileUrl || '');

    if (parsed) {
      this.pendingFileDeletes.push(parsed);
    }

    docs.splice(index, 1);
  }

  async onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    const patientId = String(this.form.patientId || '').trim();
    if (!patientId) {
      this.uploadError = 'Selecciona un paciente antes de subir archivos';
      input.value = '';
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    try {
      if (!this.form.attachedDocuments) this.form.attachedDocuments = [];
      for (const file of Array.from(files)) {
        const uploaded = await this.uploadService.uploadFile(file, patientId);
        this.form.attachedDocuments.push({
          fileName: uploaded.fileName,
          fileUrl: uploaded.fileUrl,
          storedName: uploaded.storedName,
          patientId: uploaded.patientId || patientId,
        });
      }
    } catch (error: any) {
      this.uploadError =
        error?.error?.message || error?.message || 'Error al subir archivo';
    } finally {
      this.isUploading = false;
      input.value = '';
    }
  }

  clearSelectedPatient() {
    this.selectedPatient = null;
    this.form.patientId = '';
    this.showPatientSidebar = false;
  }

  async onPatientSelected(event: any) {
    await this.loadSelectedPatient(event.target.value);
  }

  onReferralChange(value: string) {
    this.podology.hasReferral = value === 'yes';
    if (!this.podology.hasReferral) {
      this.podology.referralTo = '';
    }
  }

  startDraw(
    target: 'feet' | 'patient' | 'podologist',
    event: MouseEvent | TouchEvent
  ) {
    event.preventDefault();
    this.drawingTarget = target;
    this.drawing = true;
    const ctx = this.getCtx(target);
    const point = this.getPoint(target, event);
    if (!ctx || !point) return;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }

  moveDraw(event: MouseEvent | TouchEvent) {
    if (!this.drawing || !this.drawingTarget) return;
    event.preventDefault();
    const ctx = this.getCtx(this.drawingTarget);
    const point = this.getPoint(this.drawingTarget, event);
    if (!ctx || !point) return;
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  endDraw() {
    this.drawing = false;
    this.drawingTarget = null;
  }

  clearCanvas(target: 'feet' | 'patient' | 'podologist') {
    const canvas = this.getCanvas(target);
    const ctx = this.getCtx(target);
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (target === 'feet') {
      this.podology.feetDiagramDataUrl = '';
      this.drawFeetBackground(canvas, ctx);
    } else if (target === 'patient') {
      this.podology.patientSignatureDataUrl = '';
    } else {
      this.podology.podologistSignatureDataUrl = '';
    }
  }

  private scheduleCanvasInit() {
    const token = ++this.canvasInitToken;
    setTimeout(() => {
      if (token !== this.canvasInitToken || !this.isPodologyTemplate) return;
      this.initPodologyCanvases();
    }, 0);
  }

  private initPodologyCanvases() {
    const setups: Array<'feet' | 'patient' | 'podologist'> = [
      'feet',
      'patient',
      'podologist',
    ];
    for (const target of setups) {
      const canvas = this.getCanvas(target);
      const ctx = this.getCtx(target);
      if (!canvas || !ctx) continue;

      const rect = canvas.getBoundingClientRect();
      const width = Math.max(320, Math.floor(rect.width || canvas.clientWidth || 640));
      const height =
        target === 'feet'
          ? Math.max(280, Math.floor(width * 0.55))
          : 160;
      canvas.width = width;
      canvas.height = height;
      ctx.lineWidth = target === 'feet' ? 2.5 : 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#15202b';

      if (target === 'feet') {
        if (this.podology.feetDiagramDataUrl) {
          this.restoreImage(canvas, ctx, this.podology.feetDiagramDataUrl);
        } else {
          this.drawFeetBackground(canvas, ctx);
        }
      } else if (target === 'patient' && this.podology.patientSignatureDataUrl) {
        this.restoreImage(canvas, ctx, this.podology.patientSignatureDataUrl);
      } else if (
        target === 'podologist' &&
        this.podology.podologistSignatureDataUrl
      ) {
        this.restoreImage(canvas, ctx, this.podology.podologistSignatureDataUrl);
      }
    }
  }

  private capturePodologyCanvases() {
    const feet = this.getCanvas('feet');
    const patient = this.getCanvas('patient');
    const podologist = this.getCanvas('podologist');
    if (feet) this.podology.feetDiagramDataUrl = feet.toDataURL('image/png');
    if (patient) {
      this.podology.patientSignatureDataUrl = patient.toDataURL('image/png');
    }
    if (podologist) {
      this.podology.podologistSignatureDataUrl =
        podologist.toDataURL('image/png');
    }
  }

  private getCanvas(target: 'feet' | 'patient' | 'podologist') {
    if (target === 'feet') return this.feetCanvasRef?.nativeElement;
    if (target === 'patient') return this.patientSignCanvasRef?.nativeElement;
    return this.podologistSignCanvasRef?.nativeElement;
  }

  private getCtx(target: 'feet' | 'patient' | 'podologist') {
    const canvas = this.getCanvas(target);
    return canvas?.getContext('2d') || null;
  }

  private getPoint(
    target: 'feet' | 'patient' | 'podologist',
    event: MouseEvent | TouchEvent
  ) {
    const canvas = this.getCanvas(target);
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX =
      'touches' in event
        ? event.touches[0]?.clientX ?? event.changedTouches[0]?.clientX
        : event.clientX;
    const clientY =
      'touches' in event
        ? event.touches[0]?.clientY ?? event.changedTouches[0]?.clientY
        : event.clientY;
    if (clientX == null || clientY == null) return null;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  private drawFeetBackground(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    };
    img.src = '/podology/diagrama-pies.jpeg';
  }

  private restoreImage(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    dataUrl: string
  ) {
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = dataUrl;
  }

  private pickFormFields(
    data: Record<string, unknown>
  ): Partial<ConsultationFormModel> {
    const keys: (keyof ConsultationFormModel)[] = [
      'patientId',
      'doctorId',
      'templateKey',
      'consultationTypeId',
      'reasonForConsultation',
      'initialObservations',
      'diagnosis',
      'generalInstructions',
      'requestedStudies',
      'bloodPressure',
      'heartRate',
      'respiratoryRate',
      'temperature',
      'oxygenSaturation',
      'weight',
      'height',
      'bmi',
      'physicalExam',
      'currentCondition',
      'systemReview',
      'prescribedMedications',
      'nextAppointment',
      'additionalNotes',
      'attachedDocuments',
    ];

    const picked: Partial<ConsultationFormModel> = {};
    for (const key of keys) {
      if (data[key] !== undefined) {
        (picked as Record<string, unknown>)[key] = data[key];
      }
    }
    return picked;
  }
}
