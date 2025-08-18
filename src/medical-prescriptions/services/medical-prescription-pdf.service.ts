import { Injectable, Logger } from "@nestjs/common"
import * as puppeteer from "puppeteer"
import type { GenerateRecipePdfDto } from "../dto/generate-medical-prescription-pdf.dto"
import { API_URL } from "src/constants"

@Injectable()
export class RecipePdfService {
  private readonly logger = new Logger(RecipePdfService.name)

  async generateRecipePdf(data: GenerateRecipePdfDto): Promise<Buffer> {
    let browser: puppeteer.Browser

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })

      const page = await browser.newPage()

      await page.setViewport({ width: 1123, height: 794 })

      const html = this.generateHtmlTemplate(data)

      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 30000,
      })

      const pdf = await page.pdf({
        format: "A4",
        landscape: true,
        printBackground: true,
        margin: {
          top: "10mm",
          right: "10mm",
          bottom: "10mm",
          left: "10mm",
        },
      })

      return Buffer.from(pdf)
    } catch (error) {
      this.logger.error("Error generating recipe PDF:", error)
      throw new Error("Failed to generate recipe PDF")
    } finally {
      if (browser) {
        await browser.close()
      }
    }
  }

  private generateHtmlTemplate(data: GenerateRecipePdfDto): string {
    return `
<!DOCTYPE html>
<html>

<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Receta Médica - CIIP</title>

  <style>
    * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.3;
  color: #000;
  background: white;
}

.page {
  width: 297mm;
//   min-height: 210mm;
  min-height: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  background: white;
}

.section {
  width: 50%;
  height: 100%;
//   padding: 10mm;
  padding: 5mm 5mm 5mm 5mm; /* Modificado: 5mm arriba, 5mm derecha, 10mm abajo, 5mm izquierda */
  position: relative;
  display: flex;
  flex-direction: column;
  margin-bottom: 0px;
}

.cintillo-cip{
  width: 100%;
}

.section:first-child {
   border-right: 1px solid #000;
}

.header {
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.header h1 {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
}

.header .address {
  font-size: 10px;
  margin-bottom: 3px;
}

.header .rif {
  font-size: 10px;
  font-weight: bold;
//   margin-bottom: 15px;
}

.form-fields {
  margin-bottom: 20px;
}

.field-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  align-items: center;
}

.field-row.single {
  justify-content: flex-start;
}

.field {
  display: flex;
  align-items: center;
  gap: 5px;
}

.field label {
  font-size: 11px;
  white-space: nowrap;
}

.field .line {
  border-bottom: 1px solid #000;
  min-width: 120px;
  height: 16px;
  display: inline-block;
  padding: 0 3px;
  font-size: 10px;
}

/* .content-area {
  flex-grow: 1;
  margin-bottom: 20px;
} */

.content-area {
    /* flex-grow: 1;  */
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
}

.content-title {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 10px;
}

.content-box {
  border: 1px solid #000;
  /* min-height: 200px; */
  padding: 10px;
  font-size: 11px;
  /* white-space: pre-wrap; */
}
.content-recipe {
  border: 1px solid #ffffff;
  min-height: 240px;
  /* padding: 10px; */
  /* font-size: 11px; */
  white-space: pre-wrap;
}

.width-indicaciones{
  height: 350px; 
}

.bottom-section {
  margin-top: auto;
}

.seal-and-doctor {
  margin-bottom: 15px;  display: flex; flex-direction: column;
}

.seal-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  align-self: flex-end; 
}

.seal-box {
  border: 1px solid #000;
  width: 80px;
  height: 40px;
  display: inline-block;
}

.doctor-info h4 {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 8px;
}

.doctor-name {
  margin-bottom: 8px;
}

.doctor-name .line {
  min-width: 250px;
}

.doctor-details {
    display: flex;
    justify-content: space-between; /* Distribuye los elementos uniformemente */
    align-items: center; /* Alinea los elementos verticalmente en el centro */
}

.doctor-details .field .line {
  min-width: 80px;
}

.patient-info {
  /* border-top: 1px solid #ccc;
            padding-top: 15px; */
}

.patient-info h4 {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 8px;
}

.patient-name {
  margin-bottom: 8px;
}

.patient-name .line {
  min-width: 250px;
}

.patient-details {
  display: flex;
  gap: 30px;
}

/*         .code {
            position: absolute;
            bottom: 15mm;
            right: 15mm;
            font-size: 10px;
            font-weight: bold;
        } */
.code {
  font-size: 10px;
  font-weight: bold;
}

@media print {
  .page {
    margin: 0;
    padding: 0;
  }
}

  </style>

  
</head>
<body>
  <div class="page">
        <!-- RECIPE Section (Left) -->
        <div class="section">
        
        <img src="${API_URL}uploads/membreteCIIP.jpeg" class="cintillo-cip" alt="Logo CIIP">

            <div class="header">
                <h1>SERVICIO MÉDICO DEL CIIP</h1>
                <div class="address">Av. Venezuela, Municipio Chacao, Urb. El Rosal, Torre Épsilon, Caracas - Venezuela</div>
                <div class="rif">RIF: G-20016252-0</div>
            </div>
            
            <div class="form-fields">
                <div class="field-row">
                    <div class="field">
                        <label>Lugar:</label>
                        <span class="line">${data.place || ""}</span>
                    </div>
                    <div class="field">
                        <label>Fecha de Emisión:</label>
                        <span class="line">${data.emissionDate || ""}</span>
                    </div>
                </div>
                
                <div class="field-row single">
                    <div class="field">
                        <label>Fecha de Expiración:</label>
                        <span class="line">${data.expirationDate || ""}</span>
                    </div>
                </div>
            </div>
            
            <div class="content-area">

                <div>
                    <div class="content-box">
                      <div class="content-title">RECIPE:</div>

                      <div class="content-recipe">${data.recipe || ""}</div>

                      <div class="bottom-section">
                        <div class="seal-and-doctor">

                              <div class="seal-row">
                                  <div class="field">
                                      <label>Sello:</label>
                                      <span class="line"></span>
                                  </div>
                              </div>
                              
                              <div class="doctor-info">
                                  <h4>Datos del Médico:</h4>
                                  <div class="doctor-name">
                                      <div class="field">
                                          <label>Nombre y Apellido:</label>
                                          <span class="line">${data.doctorName || ""}</span>
                                      </div>
                                  </div>
                        <div class="doctor-details">
                            <div class="field">
                                <label>Nº C. I:</label>
                                <span class="line">${data.doctorId || ""}</span>
                            </div>
                            <div class="field">
                                <label>M.P.P.S.:</label>
                                <span class="line">${data.doctorMpps || ""}</span>
                            </div>
                            <div class="field">
                                <label>Firma:</label>
                                <span class="line"></span>
                            </div>
                        </div>
                              </div>
                          </div>
                      </div>    
                    </div>
                </div>
                <!-- </div> -->
            </div>
            
            <div class=" content-box" style="margin-top: 0;">
                <div class="patient-info">
                    <h4>Datos del Paciente:</h4>
                    <div class="patient-name">
                        <div class="field">
                            <label>Nombre y Apellido:</label>
                            <span class="line">${data.patientName || ""}</span>
                        </div>
                    </div>
                    <div class="patient-details">
                        <div class="field">
                            <label>Nº C. I:</label>
                            <span class="line">${data.patientId || ""}</span>
                        </div>
                        <div class="field">
                            <label>Año de Nacimiento:</label>
                            <span class="line">${data.patientBirthYear || ""}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="code">GGH-310414-RP-006</div>
        </div>
        
        <!-- INDICACIONES Section (Right) -->
        <div class="section">
            <img src="${API_URL}uploads/membreteCIIP.jpeg" class="cintillo-cip" alt="Logo CIIP">

            <div class="header">
                <h1>SERVICIO MÉDICO DEL CIIP</h1>
                <div class="address">Av. Venezuela, Municipio Chacao, Urb. El Rosal, Torre Épsilon, Caracas - Venezuela</div>
                <div class="rif">RIF: G-20016252-0</div>
            </div>
            
            <div class="form-fields">
                <div class="field-row">
                    <div class="field">
                        <label>Lugar:</label>
                        <span class="line">${data.place || ""}</span>
                    </div>
                    <div class="field">
                        <label>Fecha de Emisión:</label>
                        <span class="line">${data.emissionDate || ""}</span>
                    </div>
                </div>
                
                <div class="field-row single">
                    <div class="field">
                        <label>Fecha de Expiración:</label>
                        <span class="line">${data.expirationDate || ""}</span>
                    </div>
                </div>
            </div>

            <div class="content-area">
              <div class="content-box">
                <div class="content-title">INDICACIONES:</div>
                <div class="content-recipe width-indicaciones">${data.indications || ""}</div>
              </div>
            </div>
            
           
            <div class=" content-box"  style="margin-top: 0;">
                <div class="patient-info">
                    <h4>Datos del Paciente:</h4>
                    <div class="patient-name">
                        <div class="field">
                            <label>Nombre y Apellido:</label>
                            <span class="line">${data.patientName || ""}</span>
                        </div>
                    </div>
                    <div class="patient-details">
                        <div class="field">
                            <label>Nº C. I:</label>
                            <span class="line">${data.patientId || ""}</span>
                        </div>
                        <div class="field">
                            <label>Año de Nacimiento:</label>
                            <span class="line">${data.patientBirthYear || ""}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="code">GGH-310414-IR-007</div>
        </div>
    </div>

  <script>
    
  </script>
</body>
</html>

    `
  }
}
