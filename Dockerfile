# --- FASE 1: BUILD (Compilación en Debian) ---
# CAMBIO CLAVE: Usamos 'slim' (Debian) para una mejor compatibilidad con la compilación C++ de librerías nativas (canvas, sharp, puppeteer).
FROM node:20-slim AS builder

# CRÍTICO: Instalar dependencias de compilación. Usamos apt-get para Debian.
RUN apt-get update && \
    apt-get install -y \
    # Herramientas de compilación esenciales
    build-essential \
    python3 \
    pkg-config \
    # Librerías de desarrollo para 'canvas' (cairo, pango, gif) y 'sharp' (jpeg)
    libcairo-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    # Limpiamos caché para reducir el tamaño
    && rm -rf /var/lib/apt/lists/*

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del proyecto
COPY . /app/

# Ejecutamos la compilación de NestJS
RUN npm run build

# --- FASE 2: PRODUCTION (Producción / Ejecución en Debian) ---
# Usamos la misma imagen Debian optimizada.
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