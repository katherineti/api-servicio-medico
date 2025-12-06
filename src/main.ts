import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MulterModule } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'Content-Disposition',
    credentials: true
  });

  const multerConfig = app.get(MulterModule)['options']; // Acceder a la configuración de Multer
  if (multerConfig?.storage?.options?.destination) {
    console.log(`[NestApp] Configuración de Multer: los archivos se guardarán en ${multerConfig.storage.options.destination}`);
  }

// AHORA: Escucha en 0.0.0.0 (todas las interfaces) para ser accesible desde Docker.
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); 
  console.log(`escuchando en el puerto ${port}`)

}
bootstrap();