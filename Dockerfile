# --- FASE 1: BUILD (Compilación) ---
FROM node:20-alpine AS builder

# CRÍTICO: Instalar dependencias de compilación completas.
# Se añade pkgconfig y las librerías -dev necesarias para compilar 'canvas', 'sharp' y 'puppeteer'.
RUN apk add --no-cache build-base g++ python3 pkgconfig cairo-dev jpeg-dev pango-dev giflib-dev

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del proyecto (Sintaxis corregida)
COPY . /app/

# Ejecutamos la compilación de NestJS
RUN npm run build

# --- FASE 2: PRODUCTION (Producción / Ejecución) ---
# Usamos 'slim' como probaste.
FROM node:20-slim AS production

# CRÍTICO: Aplica parches de seguridad para eliminar vulnerabilidades de la imagen base (Debian).
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de producción necesarios
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expone el puerto en el que escucha tu aplicación
EXPOSE 3000

# Define la variable de entorno para el modo de producción
ENV NODE_ENV production

# Comando para iniciar la aplicación (ruta verificada)
CMD ["node", "dist/src/main.js"]