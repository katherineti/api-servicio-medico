# --- FASE 1: BUILD (Compilación) ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . /app/

# Ejecutamos la compilación de NestJS (generará la carpeta 'dist')
RUN npm run build

# --- FASE 2: PRODUCTION (Producción / Ejecución) ---
FROM node:20-slim AS production

WORKDIR /app

# Copiamos solo los archivos de producción necesarios
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expone el puerto en el que escucha tu aplicación (Puerto por defecto de NestJS es 3000)
EXPOSE 3000

# Define la variable de entorno para el modo de producción
ENV NODE_ENV production

# Comando para iniciar la aplicación, usando la ruta correcta de tu package.json: dist/src/main.js
CMD ["node", "dist/src/main.js"]