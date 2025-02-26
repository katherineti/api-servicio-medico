import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
//funciona si haces request entre paginas web
  app.enableCors({
    origin: ['*'], //colocar siempre
    methods: ['GET','POST','UPDATE','DELETE'],//si no coloco nada acepta todo
    allowedHeaders: ['content-Type', 'origin'], //headers permitidos
    credentials: false
  })

  await app.listen(3000);
}
bootstrap();
