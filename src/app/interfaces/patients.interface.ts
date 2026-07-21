export interface Patients {
    patients: Patient[];
    total: number;
    page: number;
    limit: number;
}

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    curp: string;
    phone: string;
    email: string;
    address: string;
    occupation: string;
    educationLevel: string;
    maritalStatus: string;
    guardianName: string;
    bloodType: string;
    allergies: string;
    medicalConditions: string;
    currentMedications: string;
    initialNotes: string;
    patologicos: string,
    noPatologicos: string,
    createdById?: string;
    createdByName?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
