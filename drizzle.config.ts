import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',// Directorio donde Drizzle Kit generará los archivos de migración
  schema: './src/db/schema.ts',// Ruta al archivo de esquema de la base de datos
  dialect: 'postgresql',// Especifica el sistema de base de datos (PostgreSQL en este caso)
  dbCredentials: {
    url: process.env.DATABASE_URL!,// URL de conexión a la base de datos desde las variables de entorno
  },
});