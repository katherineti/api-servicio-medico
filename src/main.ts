import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: "GET,PUT,PATCH,POST,DELETE", // Métodos HTTP permitidos
    credentials: false, // Si necesitas manejar cookies o autenticación
    allowedHeaders: 'Content-Type, Authorization', // Cabeceras permitidas
  });

  await app.listen(3000);
  console.log("escuchando en el puerto 3000")
}
bootstrap();