import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MulterModule } from '@nestjs/platform-express';
import { PORT_API } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: "GET,PUT,PATCH,POST,DELETE", // Métodos HTTP permitidos
    credentials: false, // Si necesitas manejar cookies o autenticación
    allowedHeaders: 'Content-Type, Authorization', // Cabeceras permitidas
    exposedHeaders: 'Content-Disposition' //para la disponibilidad del encabezado content-disposition
  });

  const multerConfig = app.get(MulterModule)['options']; // Acceder a la configuración de Multer
  if (multerConfig?.storage?.options?.destination) {
    console.log(`[NestApp] Configuración de Multer: los archivos se guardarán en ${multerConfig.storage.options.destination}`);
  }

  await app.listen(PORT_API);
  console.log("escuchando en el puerto 3000")
}
bootstrap();