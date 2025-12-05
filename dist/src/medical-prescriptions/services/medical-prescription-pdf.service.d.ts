import { MedicalPrescription } from "../dto/read-medical-prescription-dto";
export declare class RecipePdfService {
    private readonly logger;
    generateRecipePdf(data: MedicalPrescription): Promise<Buffer>;
    private generateHtmlTemplate;
    toTitleCase(str: string): string;
    toSentenceCase(str: string): string;
}
