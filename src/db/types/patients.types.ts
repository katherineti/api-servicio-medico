import { patientTable } from "../schema";

export type Patients = typeof patientTable.$inferSelect;