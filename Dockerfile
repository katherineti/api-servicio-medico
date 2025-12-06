# --- FASE 1: BUILD (Compilación en Debian) ---
# Usamos 'slim' (basada en Debian) para evitar problemas de compilación con librerías C++ nativas.
FROM node:20-slim AS builder

# CRÍTICO: Instalar dependencias de compilación para C++ (build-essential, python) y librerías de desarrollo para 'canvas' y 'sharp'.
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    python3 \
    pkg-config \
    libcairo-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    # Limpiamos caché para reducir el tamaño de la capa
    && rm -rf /var/lib/apt/lists/*

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del proyecto (aquí se copian 'src/assets', etc.)
COPY . /app/

# Ejecutamos la compilación de NestJS (generará la carpeta 'dist')
RUN npm run build

# --- FASE 2: PRODUCTION (Producción / Ejecución) ---
# Usamos la misma imagen Debian optimizada para el runtime.
FROM node:20-slim AS production

# CRÍTICO: Aplica parches de seguridad a la imagen base.
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de producción necesarios
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ⬅️ CORRECCIÓN: Copiar la carpeta 'src/assets' para que las fuentes de PDF estén disponibles en /app/src/assets.
COPY --from=builder /app/src/assets ./src/assets 

# Expone el puerto en el que escucha tu aplicación (3000 según .env)
EXPOSE 3000

# Define la variable de entorno para el modo de producción
ENV NODE_ENV production

# Comando para iniciar la aplicación (ruta verificada)
CMD ["node", "dist/src/main.js"]