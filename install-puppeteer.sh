#!/bin/bash
echo "Instalar Puppeteer para la generación de PDFs..."
npm install puppeteer
npm install -D @types/puppeteer

echo "✅ Puppeteer instalado correctamente"
echo ""
echo "📋 Endpoints disponibles:"
echo "GET /medical-prescriptions/{id}/pdf - Descargar PDF de receta"
# echo "GET /medical-prescriptions/{id}/pdf/preview - Previsualizar PDF en navegador"
echo ""
echo "🔧 Ejemplo de uso:"
echo "curl -X GET 'http://localhost:3000/medical-prescriptions/1/pdf' --output receta.pdf"
