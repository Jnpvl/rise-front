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
    weight?: number | string | null;
    height?: number | string | null;
    shoeSize?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    emergencyContactAddress?: string | null;
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
