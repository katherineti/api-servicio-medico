# --- FASE 1: BUILD (Compilación) ---
# Se mantiene 'alpine' para la compilación, que funciona con 'apk add' para canvas.
FROM node:20-alpine AS builder

# CRÍTICO: Instalar dependencias de compilación para librerías nativas (como 'canvas' y 'sharp').
RUN apk add --no-cache build-base g++ python3

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto de los archivos del proyecto (Corregido el estilo para dockerfile-utils)
COPY . /app/

# Ejecutamos la compilación de NestJS (generará la carpeta 'dist')
RUN npm run build

# --- FASE 2: PRODUCTION (Producción / Ejecución) ---
# Usamos 'slim' (Debian) como probaste.
FROM node:20-slim AS production

# CRÍTICO: Aplica parches de seguridad para eliminar vulnerabilidades de la imagen base.
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos solo los archivos de producción necesarios
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expone el puerto en el que escucha tu aplicación (Puerto Back4App: 3000)
EXPOSE 3000

# Define la variable de entorno para el modo de producción
ENV NODE_ENV production

# Comando para iniciar la aplicación (ruta verificada)
CMD ["node", "dist/src/main.js"]