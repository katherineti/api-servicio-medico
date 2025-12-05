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
  
  await app.listen(process.env.PORT || 3000); 
  console.log(`escuchando en el puerto ${process.env.PORT || 3000}`)
}
bootstrap();