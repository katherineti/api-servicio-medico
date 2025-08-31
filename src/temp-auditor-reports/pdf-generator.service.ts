// src/temp-auditor-reports/pdf-generator.service.ts

import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import PdfPrinter from 'pdfmake';
import * as fs from 'fs';
import * as path from 'path';
import { Style, StyleDictionary, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
import { Reports } from 'src/db/types/reports.types';
/**
 * Interfaz para errores personalizados del servicio
 */
interface PdfGenerationError {
  code: string;
  message: string;
  details?: any;
  originalError?: Error;
}
type CustomHeader = (currentPage: number, pageCount: number, pageSize: any) => any;
interface CustomDocumentDefinitions extends Omit<TDocumentDefinitions, 'header'> {
  header?: CustomHeader;
}
/**
 * Servicio para la generación de PDFs de informes de auditoría
 */
@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);
  private readonly MAX_IMAGES = 10;
  private readonly MAX_RETRIES = 3;
  private readonly fonts: TFontDictionary;
  private readonly STANDARD_IMAGE_WIDTH = 300;

  constructor() {
    try {
      // Definir fuentes
      this.fonts = {
        Roboto: {
          normal: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Regular.ttf'),
          bold: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Medium.ttf'),
          italics: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-Italic.ttf'),
          bolditalics: path.join(process.cwd(), 'src', 'assets', 'fonts', 'Roboto-MediumItalic.ttf')
        }
      };
      
      // Verificar que las fuentes existen
      this.verifyFonts();
    } catch (error) {
      this.logger.error('Error al inicializar el servicio de generación de PDF:', error);
      // Usar fuentes de respaldo si las personalizadas fallan
      this.fonts = {
        Roboto: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
          italics: 'Helvetica-Oblique',
          bolditalics: 'Helvetica-BoldOblique'
        }
      };
      this.logger.warn('Usando fuentes de respaldo debido a un error al cargar las fuentes personalizadas');
    }
  }

  /**
   * Verifica que las fuentes existen
   * @throws Error si alguna fuente no existe
   */
private verifyFonts(): void {
  try {
    const fontPaths = [
      this.fonts.Roboto.normal,
      this.fonts.Roboto.bold,
      this.fonts.Roboto.italics,
      this.fonts.Roboto.bolditalics
    ];
    
    for (const fontPath of fontPaths) {
      // Usar aserción de tipo para indicar a TypeScript que fontPath es una cadena
      if (!fs.existsSync(fontPath as string)) {
        throw new Error(`La fuente ${fontPath} no existe`);
      }
    }
  } catch (error) {
    this.logger.error('Error al verificar fuentes:', error);
    throw error;
    }
  }

  /**
   * Genera un PDF para un informe de auditoría y lo envía como respuesta HTTP
   * @param report Datos del informe
   * @param res Objeto de respuesta Express
   */
  async generatePdf(report: Reports, res: Response): Promise<void> {
    try {
      // Validar el informe
      this.validateReport(report);
      
      this.logger.log(`Generando PDF para el reporte ${report.id}`);
      
      // Depurar el contenido del reporte
      this.debugReportContent(report);
      
      // Procesar imágenes si existen
      let processedImages = [];
      try {
        processedImages = await this.processImages(report);
      } catch (error) {
        this.handleError({
          code: 'IMAGE_PROCESSING_ERROR',
          message: `Error al procesar imágenes para el reporte ${report.id}`,
          details: { reportId: report.id },
          originalError: error
        });
        // Continuar sin imágenes
        processedImages = [];
      }
      
      // Crear definición del documento
      let docDefinition: TDocumentDefinitions;
      try {
        docDefinition = await this.createDocumentDefinition(report, processedImages);
      } catch (error) {
        throw this.handleError({
          code: 'DOCUMENT_DEFINITION_ERROR',
          message: `Error al crear la definición del documento para el reporte ${report.id}`,
          details: { reportId: report.id },
          originalError: error
        });
      }
      
      // Crear instancia de PdfPrinter
      const printer = new PdfPrinter(this.fonts);
      
      // Crear documento PDF
      let pdfDoc;
      try {
        pdfDoc = printer.createPdfKitDocument(docDefinition);
      } catch (error) {
        throw this.handleError({
          code: 'PDF_CREATION_ERROR',
          message: `Error al crear el documento PDF para el reporte ${report.id}`,
          details: { reportId: report.id },
          originalError: error
        });
      }
      
      // Manejar errores en la generación del PDF
      pdfDoc.on('error', (error) => {
        this.handleError({
          code: 'PDF_GENERATION_ERROR',
          message: `Error durante la generación del PDF para el reporte ${report.id}`,
          details: { reportId: report.id },
          originalError: error
        });
        
        // Si aún no se ha enviado la respuesta, enviar error
        if (!res.headersSent) {
          res.status(500).json({
            statusCode: 500,
            message: `Error al generar PDF: ${error.message}`
          });
        }
      });
      
      // Configurar encabezados de respuesta
      try {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-auditoria-${report.id}.pdf"`);
      } catch (error) {
        throw this.handleError({
          code: 'RESPONSE_HEADER_ERROR',
          message: `Error al configurar encabezados de respuesta para el reporte ${report.id}`,
          details: { reportId: report.id },
          originalError: error
        });
      }
      
      // Enviar el PDF como respuesta
      try {
        pdfDoc.pipe(res);
        pdfDoc.end();
        
        this.logger.log(`PDF generado exitosamente para el reporte ${report.id}`);
      } catch (error) {
        throw this.handleError({
          code: 'PDF_STREAMING_ERROR',
          message: `Error al enviar el PDF para el reporte ${report.id}`,
          details: { reportId: report.id },
          originalError: error
        });
      }
    } catch (error) {
      // Si es un error ya manejado, simplemente propagarlo
      if (error instanceof InternalServerErrorException || error instanceof BadRequestException) {
        throw error;
      }
      
      // Manejar cualquier otro error no capturado
      this.logger.error(`Error no manejado al generar PDF para el reporte ${report?.id}:`, error);
      
      // Si ya se ha enviado la respuesta, no hacer nada
      if (res.headersSent) {
        return;
      }
      
      // Enviar respuesta de error
      res.status(500).json({
        statusCode: 500,
        message: `Error al generar PDF: ${error.message || 'Error desconocido'}`
      });
    }
  }

  /**
   * Valida que el informe tenga los campos necesarios
   * @param report Datos del informe
   * @throws BadRequestException si el informe no es válido
   */
  private validateReport(report: any): void {
    if (!report) {
      throw new BadRequestException('El informe es requerido');
    }
    
    if (!report.id) {
      throw new BadRequestException('El ID del informe es requerido');
    }
    
    // Validar campos obligatorios
    const requiredFields = ['title', 'code', 'receiver', 'auditorId'];
    const missingFields = requiredFields.filter(field => !report[field]);
    
    if (missingFields.length > 0) {
      throw new BadRequestException(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Maneja errores de forma centralizada
   * @param error Error personalizado
   * @returns Error de NestJS para propagar
   */
  private handleError(error: PdfGenerationError): Error {
    // Registrar el error
    if (error.originalError) {
      this.logger.error(`${error.code}: ${error.message}`, error.originalError.stack);
    } else {
      this.logger.error(`${error.code}: ${error.message}`);
    }
    
    // Registrar detalles adicionales si existen
    if (error.details) {
      this.logger.error('Detalles del error:', error.details);
    }
    
    // Devolver un error de NestJS
    return new InternalServerErrorException(error.message);
  }

  /**
   * Crea la definición del documento PDF
   * @param report Datos del informe
   * @param processedImages Imágenes procesadas
   * @returns Definición del documento
   */
private async createDocumentDefinition_(
  report: any, 
  processedImages: any[]
): Promise<CustomDocumentDefinitions> {
  try {
    // Cargar logo con reintentos
    let logoData = null;
    try {
      logoData = await this.loadLogoWithRetry();
    } catch (error) {
      this.logger.warn('No se pudo cargar el logo, continuando sin él:', error.message);
    }
    
    // Definir estilos con márgenes correctamente tipados
    const styles: StyleDictionary = {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 20, 0, 10],
        color: '#003366'
      } as Style,
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 15, 0, 5],
        color: '#003366'
      } as Style,
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: '#000000',
        fillColor: '#f2f2f2'
      } as Style,
      tableCell: {
        fontSize: 11
      } as Style,
      tableCellBold: {
        fontSize: 11,
        bold: true
      } as Style,
      coverTitle: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 20, 0, 20],
        color: '#003366'
      } as Style,
      coverInfo: {
        fontSize: 14,
        margin: [0, 5, 0, 5],
        alignment: 'center'
      } as Style,
      footer: {
        fontSize: 10,
        alignment: 'center',
        color: '#666666',
        margin: [0, 10, 0, 0]
      } as Style,
      paragraph: {
        fontSize: 11,
        margin: [0, 5, 0, 10],
        alignment: 'justify'
      } as Style
    };
    
    // Crear contenido del documento
    const content: any[] = [];
    
    // Portada
    content.push(
    //  { text: '', pageBreak: 'before' },
      logoData ? { image: `data:image/png;base64,${logoData.toString('base64')}`, width: 150, alignment: 'center', margin: [0, 0, 0, 30] } : {},
      { text: 'INFORME DE AUDITORÍA', style: 'coverTitle' },
      { text: '\n\n' },
      { text: `Código: ${this.getValidContent(report.code)}`, style: 'coverInfo' },
      { text: `Título: ${this.getValidContent(report.title)}`, style: 'coverInfo' },
      { text: `Destinatario: ${this.getValidContent(report.receiver)}`, style: 'coverInfo' },
      { text: `Auditor ID: ${this.getValidContent(report.auditorId)}`, style: 'coverInfo' },
      { text: `Fecha de inicio: ${this.formatDate(report.startDate)}`, style: 'coverInfo' },
      { text: `Fecha de finalización: ${this.formatDate(report.endDate)}`, style: 'coverInfo' },
      { text: `Fecha de emisión: ${this.formatDate(new Date())}`, style: 'coverInfo' },
      { text: '', pageBreak: 'after' }
    );
    
    // Resto del contenido...
    // ...
    
    // Crear definición del documento
    return {
      content: content,
      styles: styles,
      defaultStyle: {
        font: 'Roboto'
      },
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      footer: function(currentPage, pageCount) {
        return {
          text: `Informe de Auditoría ${report.code} - Página ${currentPage} de ${pageCount}`,
          style: 'footer'
        };
      },
      header: function(currentPage, pageCount, pageSize) {
        // No mostrar encabezado en la primera página (portada)
        if (currentPage === 1) return null;
        
        // Devolver un único objeto en lugar de un array
        return {
          // Usar un stack para agrupar múltiples elementos
          stack: [
            {
              columns: [
                logoData ? {
                  image: `data:image/png;base64,${logoData.toString('base64')}`,
                  width: 60,
                  margin: [40, 10, 0, 0]
                } : {},
                {
                  text: `Informe de Auditoría - ${report.code}`,
                  alignment: 'right',
                  margin: [0, 20, 40, 0],
                  fontSize: 10,
                  color: '#666666'
                }
              ]
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 40,
                  y1: 40,
                  x2: pageSize.width - 40,
                  y2: 40,
                  lineWidth: 1,
                  lineColor: '#cccccc'
                }
              ]
            }
          ]
        };
      }
    };
  } catch (error) {
    throw this.handleError({
      code: 'DOCUMENT_DEFINITION_ERROR',
      message: `Error al crear la definición del documento para el reporte ${report.id}`,
      details: { reportId: report.id },
      originalError: error
    });
  }
}
  private async createDocumentDefinition(
    report: Reports, 
    processedImages: any[]
  ): Promise<CustomDocumentDefinitions> {
    try {
      // Cargar logo con reintentos
      let logoData = null;
      try {
        logoData = await this.loadLogoWithRetry();
      } catch (error) {
        this.logger.warn('No se pudo cargar el logo, continuando sin él:', error.message);
      }
      
      // Definir estilos con márgenes correctamente tipados
      const styles: StyleDictionary = {
        headerSection: {
          fontSize: 10,
          alignment: 'right',
          color: '#666666',
          margin: [0, 5, 0, 0]
        } as Style,
        reportTitle: {
          // fontSize: 16,
          fontSize: 12,
          bold: true,
          alignment: 'center',
          // margin: [0, 15, 0, 10],
          margin: [40, 5, 40, 10],
          color: '#003366'
        } as Style,
        reportTitle2: {
          fontSize: 14,
          bold: true,
          alignment: 'center',
          margin: [0, 15, 0, 10],
          color: '#003366'
        } as Style,
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: '#FFFFFF',
          fillColor: '#003366', // Azul oscuro similar al logo de Soriana
          alignment: 'center',
          margin: [0, 5, 0, 5]
        } as Style,
        tableCellLabel: {
          bold: true,
          fontSize: 10,
          color: '#000000',
          fillColor: '#E0E0E0', // Gris claro para las etiquetas
          margin: [5, 5, 5, 5]
        } as Style,
        tableCellValue: {
          fontSize: 10,
          color: '#000000',
          fillColor: '#F5F5F5', // Blanco para los valores
          margin: [5, 5, 5, 5]
        } as Style,
        sectionTitleBand: {
          fontSize: 12,
          bold: true,
          color: '#FFFFFF',
          fillColor: '#003366', // Azul oscuro para las bandas de título
          alignment: 'center',
          margin: [0, 10, 0, 10],
          // Ajustar padding para que se vea como una banda
          paddingLeft: 0,
          paddingRight: 0,
          paddingTop: 5,
          paddingBottom: 5
        } as Style,
        paragraph: {
          fontSize: 11,
          margin: [0, 5, 0, 5],
          alignment: 'justify'
        } as Style,
        list: {
          fontSize: 11,
          margin: [0, 5, 0, 5]
        } as Style,
        footer: {
          fontSize: 9,
          alignment: 'center',
          color: '#666666',
          margin: [0, 10, 0, 0]
        } as Style,
        // Nuevos estilos para la portada si quieres una separada
        coverTitle: {
          fontSize: 24,
          bold: true,
          alignment: 'center',
          margin: [0, 100, 0, 50], // Más margen superior para centrar
          color: '#003366'
        } as Style,
        coverInfo: {
          fontSize: 12,
          margin: [0, 5, 0, 5],
          alignment: 'center'
        } as Style,
        coverImage: {
          alignment: 'center',
          margin: [0, 0, 0, 30] // Ajustar margen inferior
        } as Style
      };
      
      // Crear contenido del documento
      const content: any[] = [];
      
      // --- Portada (opcional, si quieres una portada separada) ---
      // Si el PDF no tiene una portada separada, elimina esta sección
      // y asegúrate de que el logo y el título principal estén en la primera página del contenido.
/*       content.push(
        // Eliminado: { text: '', pageBreak: 'before' }, // Asegúrate de que no haya un pageBreak aquí
        logoData ? { image: `data:image/png;base64,${logoData.toString('base64')}`, width: 180, ...styles.coverImage } : {},
        { text: 'INFORME FINAL DE AUDITORÍA', style: 'coverTitle' },
        { text: '\n\n\n' }, // Espacio para centrar visualmente
        { text: `Reporte: ${this.getValidContent(report.title)}`, style: 'coverInfo' },
        { text: `Código de Reporte: ${this.getValidContent(report.code)}`, style: 'coverInfo' },
        { text: `Fecha de Emisión: ${this.formatDate(new Date())}`, style: 'coverInfo' },
        { text: `Destinatario: ${this.getValidContent(report.receiver)}`, style: 'coverInfo' },
        { text: '\n\n\n\n\n\n\n\n' }, // Más espacio para empujar la información al centro/inferior
        // { text: `Auditado: ${this.getValidContent(report.auditedEntityName || 'N/A')}`, style: 'coverInfo' },
        // { text: `Auditores: ${this.getValidContent(report.auditorsNames || 'N/A')}`, style: 'coverInfo' }, // Asume que report.auditorsNames es un string o array unido
        { text: '', pageBreak: 'after' } // Salto de página después de la portada
      ); */
      // --- Fin Portada ---

      // --- Encabezado de la página (similar a la imagen de referencia) ---
      // Este encabezado se construirá dinámicamente en la función 'header' de TDocumentDefinitions
      // Se aplicará a partir de la segunda página.

      // --- Contenido del reporte ---

      // Título Principal del Reporte (si no hay portada, esto sería la primera página)
/*       content.push(
         logoData ? { image: `data:image/png;base64,${logoData.toString('base64')}`, width: 180, ...styles.coverImage } : {},
        { text: 'INFORME FINAL DE AUDITORÍA', style: 'reportTitle' }
      ); */
      content.push(
        //  logoData ? { image: `data:image/png;base64,${logoData.toString('base64')}`, width: 180, ...styles.coverImage } : {},
/*         logoData ? { 
          image: `data:image/jpeg;base64,${logoData.toString('base64')}`, 
          maxWidth: 515,
          maxHeight: 150,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        } : {}, */
        { text: 'INFORME FINAL DE AUDITORÍA', style: 'reportTitle' }
      );

      // Tabla de Información General (similar a la de la imagen)
/*       content.push(
        {
          style: 'tableExample', // Puedes definir un estilo específico para la tabla si lo necesitas
          table: {
            widths: ['auto', '*', 'auto', 'auto'], // Anchos de las columnas
            body: [
              // Fila 1
              [
                { text: 'Empresa:', style: 'tableCellLabel' },
                { text: this.getValidContent(report.companyName || 'N/A'), style: 'tableCellValue' },
                { text: 'No. de Auditoría:', style: 'tableCellLabel' },
                { text: this.getValidContent(report.code), style: 'tableCellValue' }
              ],
              // Fila 2
              [
                { text: 'Proceso:', style: 'tableCellLabel' },
                { text: this.getValidContent(report.process || 'Recursos Humanos'), style: 'tableCellValue' }, // Ejemplo de un campo no solicitado, puedes eliminarlo
                { text: 'Fecha:', style: 'tableCellLabel' },
                { text: this.formatDate(report.issueDate || new Date()), style: 'tableCellValue' } // Fecha de emisión
              ],
              // Fila 3
              [
                { text: 'Auditor/Líder:', style: 'tableCellLabel' },
                { text: this.getValidContent(report.auditorLeadName || 'N/A'), style: 'tableCellValue' }, // Nombre del auditor líder
                { text: 'Revisión:', style: 'tableCellLabel' }, // Campo de revisión
                { text: this.getValidContent(report.revision || '1'), style: 'tableCellValue' } // Número de revisión
              ],
              // Fila 4
              [
                { text: 'Grupo Auditor:', style: 'tableCellLabel' },
                {
                  ul: Array.isArray(report.auditorsInvolved) && report.auditorsInvolved.length > 0
                    ? report.auditorsInvolved.map((auditor: any) => this.getValidContent(auditor.name || auditor)) // Si los auditores son objetos o solo nombres
                    : [this.getValidContent(report.auditorId)], // Usar auditorId si no hay grupo
                  style: 'list',
                  margin: [5, 5, 5, 5],
                  fillColor: '#F5F5F5'
                },
                { text: '', style: 'tableCellLabel' }, // Celda vacía
                { text: '', style: 'tableCellValue' } // Celda vacía
              ]
            ]
          },
          layout: {
            hLineWidth: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? 1 : 0.5; // Bordes horizontales
            },
            vLineWidth: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? 1 : 0.5; // Bordes verticales
            },
            hLineColor: function (i, node) {
              return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB'; // Color de bordes
            },
            vLineColor: function (i, node) {
              return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB'; // Color de bordes
            },
            paddingLeft: function (i, node) { return 10; },
            paddingRight: function (i, node) { return 10; },
            paddingTop: function (i, node) { return 5; },
            paddingBottom: function (i, node) { return 5; }
          },
          margin: [0, 10, 0, 20]
        }
      ); */

      this.TitleTable(content,report)
      this.ResumenTable(content, report);
      this.ConclusionesTable(content, report)

      // Documento de Referencia (similar a la imagen)
/*       content.push(
        {
          columns: [
            { text: 'DOCUMENTO DE REFERENCIA', style: 'tableHeader', width: 180, margin: [0, 0, 10, 0] },
            { text: this.getValidContent(report.referenceDocument || 'Manual de calidad y norma ISO 9001:2015'), style: 'tableCellValue', width: '*' }
          ],
          margin: [0, 0, 0, 20]
        }
      ); */

      // I. ASPECTOS PRELIMINARES
/*       content.push(
        { text: 'I. ASPECTOS PRELIMINARES', style: 'sectionTitleBand', margin: [0, 10, 0, 0] }
      );

      // PROPÓSITO U OBJETIVO
      content.push(
        { text: 'PROPÓSITO U OBJETIVO', style: 'sectionTitleBand' }
      );
      content.push(
        { text: this.getValidContent(report.summary_objective), style: 'paragraph' }
      );

      // ALCANCE
      content.push(
        { text: 'ALCANCE', style: 'sectionTitleBand' }
      );
      content.push(
        { text: this.getValidContent(report.summary_scope), style: 'paragraph' }
      );

      // METODOLOGÍA (Resumen)
      content.push(
        { text: 'METODOLOGÍA (RESUMEN)', style: 'sectionTitleBand' }
      );
      content.push(
        { text: this.getValidContent(report.summary_methodology), style: 'paragraph' }
      ); */

      // CONCLUSIONES (Resumen)
/*       content.push(
        { text: 'CONCLUSIONES (RESUMEN)', style: 'sectionTitleBand' }
      );
      content.push(
        { text: this.getValidContent(report.summary_conclusionAndObservation), style: 'paragraph' }
      );

      // Introducción (Nueva sección)
      content.push(
        { text: 'II. INTRODUCCIÓN', style: 'sectionTitleBand', pageBreak: 'before' } // Añadir pageBreak si quieres que inicie en nueva página
      );
      content.push(
        { text: this.getValidContent(report.introduction), style: 'paragraph' }
      );

      // Metodología detallada (Nueva sección)
      content.push(
        { text: 'III. METODOLOGÍA DETALLADA', style: 'sectionTitleBand' }
      );
      content.push(
        { text: this.getValidContent(report.detailed_methodology), style: 'paragraph' }
      );

      // Hallazgos/Observaciones (Nueva sección)
      content.push(
        { text: 'IV. HALLAZGOS Y OBSERVACIONES', style: 'sectionTitleBand' }
      );
      content.push(
        { text: this.getValidContent(report.findings), style: 'paragraph' }
      );
      
      // Conclusiones (Detalladas) (Nueva sección)
      content.push(
        { text: 'V. CONCLUSIONES', style: 'sectionTitleBand' }
      );
      content.push(
        { text: this.getValidContent(report.conclusions), style: 'paragraph' }
      ); */

      // Imágenes cargadas en el reporte (Nueva sección)
      if (processedImages && processedImages.length > 0) {
        content.push(
          { text: 'VI. IMÁGENES DE EVIDENCIA', style: 'sectionTitleBand', pageBreak: 'before' } // Añadir pageBreak si quieres que inicie en nueva página
        );
        processedImages.forEach((img) => {
          if (img.exists && img.dataUrl) {
            content.push({
              image: img.dataUrl,
              // width: 400, // Ajusta el ancho según sea necesario
              width: this.STANDARD_IMAGE_WIDTH, // Ajusta el ancho según sea necesario
              alignment: 'center',
              margin: [0, 10, 0, 10]
            });
            content.push({
              // text: `Figura ${img.index}: Evidencia - ${img.path.split('/').pop()}`,
              text: `Evidencia ${img.index}: ${img.path.split('/').pop()}`,
              alignment: 'center',
              fontSize: 9,
              color: '#666666',
              margin: [0, 0, 0, 20]
            });
          } else {
            this.logger.warn(`No se pudo incluir la imagen: ${img.path}. Razón: ${img.error}`);
            content.push({
              text: `[Imagen no disponible: ${img.path}]`,
              alignment: 'center',
              color: 'red',
              fontSize: 9,
              margin: [0, 10, 0, 10]
            });
          }
        });
      }

      // Pie de página de cierre
      content.push(
        { text: '\n\n\n' },
        { text: 'Fin del Informe de Auditoría', alignment: 'center', fontSize: 10, color: '#666666' }
      );

      // Crear definición del documento
      return {
        content: content,
        styles: styles,
        defaultStyle: {
          font: 'Roboto'
        },
/*         pageSize: 'A4',
        pageMargins: [40, 60, 40, 60], // [left, top, right, bottom] */
        pageSize: "A4",
        pageMargins: [40, 80, 40, 60],//80 margen superior en cada pagina del pdf
        background: function(currentPage, pageSize)  {
          // El logo en el fondo de cada página
          if (logoData) {
            return {
              image: `data:image/jpeg;base64,${logoData.toString("base64")}`,
              maxWidth: 515,
              maxHeight: 80,
              alignment: "center",
              margin: [0, 20, 0, 0], // Margen del logo
            };
          }
          return '' // Devuelve un texto vacío si no hay logo
        },
        header: (currentPage, pageCount, pageSize) => {
          // El header está vacío para no interferir con el contenido
          return [];
        },
        footer: function(currentPage, pageCount) {
          return {
            text: `Informe de Auditoría ${report.code} - Página ${currentPage} de ${pageCount}`,
            style: 'footer'
          };
        },
/*         header: function(currentPage, pageCount, pageSize) {
          // No mostrar encabezado en la primera página (portada)
          if (currentPage === 1) return null;
          
          return {
            stack: [
              {
                columns: [
                  logoData ? {
                    image: `data:image/png;base64,${logoData.toString('base64')}`,
                    width: 60, // Ajustar tamaño del logo en el encabezado
                    margin: [40, 10, 0, 0] // [left, top, right, bottom]
                  } : {},
                  {
                    // Contenido del encabezado a la derecha, similar a la imagen de Soriana
                    stack: [
                    //   { text: `Responsable: ${report.responsible || 'N/A'}`, style: 'headerSection' },
                      { text: `Código: ${report.code} - Página: ${currentPage} de ${pageCount}`, style: 'headerSection' },
                    //   { text: `Revisión: ${report.revision || '1'}`, style: 'headerSection' },
                    //   { text: `Emisión: ${report.issueDate ? this.formatDate(report.issueDate) : this.formatDate(new Date())}`, style: 'headerSection' }
                    ],
                    alignment: 'right',
                    margin: [0, 10, 40, 0] // [left, top, right, bottom]
                  }
                ]
              },
              {
                canvas: [
                  {
                    type: 'line',
                    x1: 40,
                    y1: 50, // Ajusta esta altura para que la línea quede debajo del texto
                    x2: pageSize.width - 40,
                    y2: 50, // La misma altura
                    lineWidth: 1,
                    lineColor: '#cccccc'
                  }
                ]
              }
            ]
          };
        }.bind(this) */ // Asegúrate de que `this` esté ligado correctamente para acceder a `this.formatDate`
      };
    } catch (error) {
      throw this.handleError({
        code: 'DOCUMENT_DEFINITION_ERROR',
        message: `Error al crear la definición del documento para el reporte ${report.id}`,
        details: { reportId: report.id },
        originalError: error
      });
    }
  }

  /**
   * Carga el logo con reintentos
   * @returns Buffer del logo o null si no se puede cargar
   */
  private async loadLogoWithRetry(): Promise<Buffer | null> {
/*     const possibleLogoPaths = [
      path.join(process.cwd(), 'src', 'logo-ciip.png'),
      path.join(process.cwd(), 'src', 'assets', 'logo-ciip.png'),
      path.join(process.cwd(), 'assets', 'logo-ciip.png'),
      path.join(process.cwd(), 'logo-ciip.png')
    ]; */
    const possibleLogoPaths = [
      path.join(process.cwd(), 'src', 'membreteCIIP.jpeg'),
      // path.join(process.cwd(), 'src', 'assets', 'membreteCIIP.jpeg'),
      // path.join(process.cwd(), 'assets', 'membreteCIIP.jpeg'),
      // path.join(process.cwd(), 'membreteCIIP.jpeg')
    ];
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        for (const logoPath of possibleLogoPaths) {
          if (fs.existsSync(logoPath)) {
            return fs.readFileSync(logoPath);
          }
        }
        
        // Si llegamos aquí, no se encontró el logo en ninguna ubicación
        this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Logo no encontrado en las ubicaciones esperadas`);
        
        // Esperar antes del siguiente intento (backoff exponencial)
        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      } catch (error) {
        this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Error al cargar el logo:`, error);
        
        // Esperar antes del siguiente intento (backoff exponencial)
        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    throw new Error('No se pudo cargar el logo después de varios intentos');
  }

  /**
   * Procesa las imágenes del informe
   * @param report Datos del informe
   * @returns Array de imágenes procesadas
   */
  private async processImages(report: any): Promise<any[]> {
    let processedImages = [];
    
    if (!report.images) {
      return processedImages;
    }
    
    try {
      // Parsear JSON de imágenes
      let images = [];
      if (typeof report.images === 'string') {
        try {
          images = JSON.parse(report.images);
        } catch (error) {
          throw this.handleError({
            code: 'IMAGE_PARSE_ERROR',
            message: `Error al parsear JSON de imágenes para el reporte ${report.id}`,
            details: { reportId: report.id, imagesRaw: report.images },
            originalError: error
          });
        }
      } else if (Array.isArray(report.images)) {
        images = report.images;
      } else {
        this.logger.warn(`Formato de imágenes no reconocido para el reporte ${report.id}:`, typeof report.images);
        return processedImages;
      }
      
      // Limitar a MAX_IMAGES imágenes
      if (images.length > this.MAX_IMAGES) {
        this.logger.log(`Limitando de ${images.length} a ${this.MAX_IMAGES} imágenes para el reporte ${report.id}`);
        images = images.slice(0, this.MAX_IMAGES);
      }
      
      // Procesar cada imagen
      for (let i = 0; i < images.length; i++) {
        const imagePath = images[i];
        
        if (!imagePath) {
          this.logger.warn(`Ruta de imagen vacía en el índice ${i} para el reporte ${report.id}`);
          processedImages.push({
            index: i + 1,
            dataUrl: '',
            path: 'Ruta vacía',
            exists: false
          });
          continue;
        }
        
        try {
          // Intentar cargar la imagen con reintentos
          const imageResult = await this.loadImageWithRetry(report.id, imagePath);
          processedImages.push({
            index: i + 1,
            ...imageResult
          });
        } catch (error) {
          this.logger.error(`Error al procesar imagen ${imagePath} para el reporte ${report.id}:`, error);
          processedImages.push({
            index: i + 1,
            dataUrl: '',
            path: imagePath,
            exists: false,
            error: error.message
          });
        }
      }
    } catch (error) {
      // Si es un error ya manejado, propagarlo
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw this.handleError({
        code: 'IMAGE_PROCESSING_ERROR',
        message: `Error al procesar imágenes para el reporte ${report.id}`,
        details: { reportId: report.id },
        originalError: error
      });
    }
    
    return processedImages;
  }

  /**
   * Carga una imagen con reintentos
   * @param reportId ID del informe
   * @param imagePath Ruta de la imagen
   * @returns Objeto con información de la imagen
   */
/*   private async loadImageWithRetry(reportId: number | string, imagePath: string): Promise<any> {
    // Posibles rutas donde puede estar la imagen
    const possiblePaths = [
      path.join(API_URL, 'uploads', 'reports', `Id ${reportId}`, imagePath.split('/').pop()),
      // path.join(process.cwd(), 'uploads', 'reports', `Id ${reportId}`, imagePath.split('/').pop()),
      // path.join(process.cwd(), 'uploads', 'reports', imagePath.split('/').pop()),
      // path.join(process.cwd(), 'uploads', imagePath),
      imagePath // Ruta absoluta si se proporciona
    ];
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        for (const fullPath of possiblePaths) {
          if (fs.existsSync(fullPath)) {
            // Leer la imagen
            const imageBuffer = fs.readFileSync(fullPath);
            
            // Convertir a base64
            const base64Image = imageBuffer.toString('base64');
            const mimeType = this.getMimeType(fullPath);
            
            return {
              dataUrl: `data:${mimeType};base64,${base64Image}`,
              path: imagePath,
              exists: true,
              fullPath: fullPath
            };
          }
        }
        
        // Si llegamos aquí, no se encontró la imagen en ninguna ubicación
        this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Imagen no encontrada para el reporte ${reportId}: ${imagePath}`);
        
        // Esperar antes del siguiente intento (backoff exponencial)
        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      } catch (error) {
        this.logger.warn(`Intento ${attempt + 1}/${this.MAX_RETRIES}: Error al cargar imagen para el reporte ${reportId}:`, error);
        
        // Esperar antes del siguiente intento (backoff exponencial)
        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
        }
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    return {
      dataUrl: '',
      path: imagePath,
      exists: false,
      error: 'No se pudo cargar la imagen después de varios intentos'
    };
  } */
private async loadImageWithRetry(reportId: number | string, imagePath: string): Promise<any> {
  // Obtener solo el nombre del archivo
  const fileName = imagePath.split('/').pop() || imagePath;
  
  // ✅ RUTAS CORRECTAS del sistema de archivos
  const possiblePaths = [
    // Ruta principal donde Multer guarda los archivos
    path.join(process.cwd(), 'uploads', 'reports', `Id ${reportId}`, fileName),
    
/*     // Ruta alternativa desde la carpeta del proyecto
     path.join(__dirname, '..', '..', 'uploads', 'reports', `Id ${reportId}`, fileName), */
    
/*     // Si imagePath es una ruta completa
    path.join(process.cwd(), imagePath.replace(/^\//, '')) */
  ];
  
  console.log(`Buscando imagen: ${fileName} para reporte ${reportId}`);
  
  for (const fullPath of possiblePaths) {
    console.log(`Verificando: ${fullPath}`);
    
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ¡Imagen encontrada!: ${fullPath}`);
      
      // Leer y convertir la imagen
      const imageBuffer = fs.readFileSync(fullPath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(fullPath);
      
      return {
        dataUrl: `data:${mimeType};base64,${base64Image}`,
        path: imagePath,
        exists: true,
        fullPath: fullPath
      };
    }
  }
  
  // Si no se encuentra la imagen
  console.error(`❌ Imagen NO encontrada: ${fileName}`);
  return {
    dataUrl: '',
    path: imagePath,
    exists: false,
    error: 'Imagen no encontrada en el sistema de archivos'
  };
}
  /**
   * Obtiene el tipo MIME de un archivo basado en su extensión
   * @param filePath Ruta del archivo
   * @returns Tipo MIME
   */
  private getMimeType(filePath: string): string {
    try {
      const ext = path.extname(filePath).toLowerCase();
      
      switch (ext) {
        case '.png':
          return 'image/png';
        case '.jpg':
        case '.jpeg':
          return 'image/jpeg';
        case '.gif':
          return 'image/gif';
        case '.svg':
          return 'image/svg+xml';
        case '.webp':
          return 'image/webp';
        case '.bmp':
          return 'image/bmp';
        default:
          this.logger.warn(`Tipo de archivo no reconocido: ${ext}, usando tipo genérico`);
          return 'application/octet-stream';
      }
    } catch (error) {
      this.logger.error('Error al determinar el tipo MIME:', error);
      return 'application/octet-stream';
    }
  }

  /**
   * Formatea una fecha en formato legible
   * @param date Fecha a formatear
   * @returns Fecha formateada
   */
  private formatDate(date: Date | string): string {
    try {
      if (!date) return 'N/A';
      
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Fecha inválida';
      
      return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      this.logger.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  }

  /**
   * Método auxiliar para validar y procesar el contenido de texto
   * @param content Contenido a validar
   * @returns Contenido validado o mensaje por defecto
   */
  private getValidContent(content: any): string {
    try {
      // Si el contenido es null o undefined
      if (content === null || content === undefined) {
        return 'No se ha proporcionado información.';
      }
      
      // Si el contenido es una cadena vacía o solo espacios
      if (typeof content === 'string' && content.trim() === '') {
        return 'No se ha proporcionado información.';
      }
      
      // Si el contenido es un objeto o array, convertirlo a string
      if (typeof content === 'object') {
        try {
          return JSON.stringify(content, null, 2);
        } catch (error) {
          this.logger.error('Error al convertir objeto a JSON:', error);
          return 'Contenido en formato no compatible.';
        }
      }
      
      // Devolver el contenido como string
    //   return String(content);
      return this.capitalizarOracion(content);
    } catch (error) {
      this.logger.error('Error al procesar contenido:', error);
      return 'Error al procesar contenido.';
    }
  }

  capitalizarOracion(oracion) {
  if (oracion.length === 0) {
    return ""; // Devuelve una cadena vacía si la entrada está vacía
  }
  return oracion.charAt(0).toUpperCase() + oracion.slice(1);
}
  /**
   * Método para depurar el contenido del reporte
   * @param report Objeto del reporte
   */
  private debugReportContent(report: any): void {
    try {
      this.logger.log('=== DEPURACIÓN DEL CONTENIDO DEL REPORTE ===');
      this.logger.log(`ID: ${report.id}`);
      this.logger.log(`Título: ${report.title}`);
      this.logger.log(`Código: ${report.code}`);
      this.logger.log(`Receptor: ${report.receiver}`);
      this.logger.log(`ID Auditor: ${report.auditorId}`);
      this.logger.log(`Fecha inicio: ${report.startDate}`);
      this.logger.log(`Fecha fin: ${report.endDate}`);
      
      // Contenido de las secciones
      this.logSectionContent('Objetivo', report.summary_objective);
      this.logSectionContent('Alcance', report.summary_scope);
      this.logSectionContent('Metodología (resumen)', report.summary_methodology);
      this.logSectionContent('Conclusiones (resumen)', report.summary_conclusionAndObservation);
      this.logSectionContent('Introducción', report.introduction);
      this.logSectionContent('Metodología detallada', report.detailed_methodology);
      this.logSectionContent('Hallazgos', report.findings);
      this.logSectionContent('Conclusiones', report.conclusions);
      
      // Imágenes
      if (report.images) {
        try {
          const images = typeof report.images === 'string' ? JSON.parse(report.images) : report.images;
          this.logger.log(`Imágenes: ${images.length}`);
          images.forEach((img: string, index: number) => {
            if (index < 5) { // Mostrar solo las primeras 5 imágenes
              this.logger.log(`  - Imagen ${index + 1}: ${img}`);
            }
          });
          if (images.length > 5) {
            this.logger.log(`  ... y ${images.length - 5} más`);
          }
        } catch (error) {
          this.logger.error('Error al parsear imágenes:', error);
          this.logger.log(`Imágenes (raw): ${report.images}`);
        }
      } else {
        this.logger.log('No hay imágenes en el reporte');
      }
      
      this.logger.log('=== FIN DE DEPURACIÓN ===');
    } catch (error) {
      this.logger.error('Error al depurar contenido del reporte:', error);
    }
  }

  /**
   * Método auxiliar para registrar el contenido de una sección
   * @param sectionName Nombre de la sección
   * @param content Contenido de la sección
   */
  private logSectionContent(sectionName: string, content: any): void {
    try {
      const contentType = typeof content;
      let preview = '';
      
      if (content === null || content === undefined) {
        preview = 'null/undefined';
      } else if (contentType === 'string') {
        preview = content.length > 50 ? `${content.substring(0, 50)}...` : content;
      } else if (contentType === 'object') {
        preview = 'Objeto/Array';
      } else {
        preview = String(content);
      }
      
      this.logger.log(`${sectionName}: ${contentType} - ${preview}`);
    } catch (error) {
      this.logger.error(`Error al registrar contenido de sección ${sectionName}:`, error);
    }
  }

  TitleTable(content, report){
   return   content.push(
        {
          // Puedes ajustar el margen de la tabla según sea necesario
          margin: [0, 10, 0, 10], // [left, top, right, bottom]
          table: {
            // Define los anchos de las columnas para 3 columnas.
            // Usamos '*' para que las columnas tomen el espacio disponible de forma equitativa.
            widths: ['*', '*', '*'],
            
            // Puedes mantener el layout que ya tienes para los bordes y el padding,
            // o usar uno más simple si esta tabla no necesita los mismos bordes complejos.
            // Por simplicidad y consistencia, mantendremos el layout existente.
            layout: {
              hLineWidth: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 1 : 0.5; // Bordes horizontales
              },
              vLineWidth: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? 1 : 0.5; // Bordes verticales
              },
              hLineColor: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              vLineColor: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              paddingLeft: function (i, node) { return 10; },
              paddingRight: function (i, node) { return 10; },
              paddingTop: function (i, node) { return 5; },
              paddingBottom: function (i, node) { return 5; }
            },

            body: [
               [
                { text: 'Destinatario', style: 'tableHeader' },
                { text: 'Auditor', style: 'tableHeader' },
                { text: 'Fecha de finalizado', style: 'tableHeader' }
              ],
              [
                { text: this.getValidContent(report.receiver), style: 'tableCellValue' },
                { text: this.getValidContent(report.auditor || report.auditorId), style: 'tableCellValue' }, // Usa auditor si existe, sino auditorId
                { text: this.formatDate( report.endDate || new Date()), style: 'tableCellValue' } // Usa  endDate, sino la fecha actual
              ]
            ]
          }
        }
      );
  }
    /**
   * Agrega una tabla de dos columnas con encabezados y su información correspondiente.
   * @param content El array de contenido del PDF.
   * @param report El objeto del reporte con los datos.
   */
  private ResumenTable(content: any[], report: Reports): void { console.log("report en ResumenTable() " , report)
    content.push(
      { text: 'Resumen', style: 'reportTitle' },
      {
        style: 'tableExample',
        table: {
          widths: ['30%', '70%'],
          body: [
            [{ text: 'Objetivos:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_objective || 'N/A'), style: 'tableCellValue' }],
            [{ text: 'Alcance:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_scope || 'N/A'), style: 'tableCellValue' }],
            [{ text: 'Metodología:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_methodology || 'N/A'), style: 'tableCellValue' }],
            [{ text: 'Conclusiones/observaciones:', style: 'tableCellLabel' }, { text: this.getValidContent(report.summary_conclusionAndObservation || 'N/A'), style: 'tableCellValue' }],
          ]
        },
        layout: {
          hLineWidth: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
          },
          vLineWidth: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
          },
          hLineColor: function (i, node) {
            return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB';
          },
          vLineColor: function (i, node) {
            return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB';
          },
          paddingLeft: function (i, node) { return 10; },
          paddingRight: function (i, node) { return 10; },
          paddingTop: function (i, node) { return 5; },
          paddingBottom: function (i, node) { return 5; }
        },
        margin: [0, 10, 0, 20]
      }
    );
  }

  ConclusionesTable(content, report){
    content.push(
        // { text: 'Conclusiones', style: 'reportTitle2' },
        { text: 'Conclusiones', style: 'reportTitle' },
        {
          style: 'tableExample',
          widths: ['100%'],
          headerRows: 1,
        //   margin: [0, 20, 0, 0], // [left, top, right, bottom]
          margin: [0, 10, 0, 10], // [left, top, right, bottom]
          table: {            
            layout: {
              hLineWidth: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 1 : 0.5; // Bordes horizontales
              },
              vLineWidth: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? 1 : 0.5; // Bordes verticales
              },
              hLineColor: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              vLineColor: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              paddingLeft: function (i, node) { return 10; },
              paddingRight: function (i, node) { return 10; },
              paddingTop: function (i, node) { return 5; },
              paddingBottom: function (i, node) { return 5; }
            },
            widths: ['*'],
            body: [
              [{ text: 'Introducción', style: 'tableHeader' }  ],
              [  { text: this.getValidContent(report.introduction), style: 'tableCellValue' } ]
            ]
          }
        }
      );
   
    content.push( {
          table: {

            widths: ['*'],
            layout: {
              hLineWidth: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 1 : 0.5; // Bordes horizontales
              },
              vLineWidth: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? 1 : 0.5; // Bordes verticales
              },
              hLineColor: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              vLineColor: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              paddingLeft: function (i, node) { return 10; },
              paddingRight: function (i, node) { return 10; },
              paddingTop: function (i, node) { return 5; },
              paddingBottom: function (i, node) { return 5; }
            },
            body: [
              [ { text: 'Metodología', style: 'tableHeader' } ],
              [  { text: this.getValidContent(report.detailed_methodology), style: 'tableCellValue' }  ]
            ]
          }
        }
      );
   
    content.push( {
          table: {
            widths: ['*'],
            layout: {
              hLineWidth: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 1 : 0.5; // Bordes horizontales
              },
              vLineWidth: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? 1 : 0.5; // Bordes verticales
              },
              hLineColor: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              vLineColor: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              paddingLeft: function (i, node) { return 10; },
              paddingRight: function (i, node) { return 10; },
              paddingTop: function (i, node) { return 5; },
              paddingBottom: function (i, node) { return 5; }
            },
            body: [
              [ { text: 'Hallazgos', style: 'tableHeader' }  ],
              [ { text: this.getValidContent(report.findings), style: 'tableCellValue' } ]
            ]
          }
        }
      );
    content.push( {
          table: {
             widths: ['*'],
            layout: {
              hLineWidth: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? 1 : 0.5; // Bordes horizontales
              },
              vLineWidth: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? 1 : 0.5; // Bordes verticales
              },
              hLineColor: function (i, node) {
                return (i === 0 || i === node.table.body.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              vLineColor: function (i, node) {
                return (i === 0 || i === node.table.widths.length) ? '#003366' : '#BBBBBB'; // Color de bordes
              },
              paddingLeft: function (i, node) { return 10; },
              paddingRight: function (i, node) { return 10; },
              paddingTop: function (i, node) { return 5; },
              paddingBottom: function (i, node) { return 5; }
            },
            body: [
              [ { text: 'Conclusiones', style: 'tableHeader' } ],
              [ { text: this.getValidContent(report.conclusions), style: 'tableCellValue' } ]
            ]
          }
        }
      );
      return content
  }

}