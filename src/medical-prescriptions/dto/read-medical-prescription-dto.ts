
export class MedicalPrescriptionGetAll {
  total: number;
  page: number;
  list: MedicalPrescription[];
}

export class MedicalPrescription {
  id: number
  medicalReportId: number
  place: string
  expirationDate: string
  recipeContent: string
  doctorId: number
    doctorName: string
    doctorCedula: string
  mpps: string
  patientId: number
    patientName: string
    patientCedula: string
    patientBirthdate?: string
  indications?: string
  createdAt: string
  updatedAt?: string
}