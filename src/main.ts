import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
//funciona si haces request entre paginas web
  app.enableCors({
    // origin: ['*'], //colocar siempre : acepta todos
    origin: ['https://www.appfrontangular.com'], //restringo las paginas que se pueden comunicar con mi api
    methods: ['GET','POST','UPDATE','DELETE'],//si no coloco nada acepta todo
    allowedHeaders: ['content-Type', 'origin'], //headers permitidos
    credentials: false
  })

  await app.listen(3000);
  console.log("escuchando en el puerto 3000")
}
bootstrap();

//limitador de velcoidad (request) : es para evitar el error 409 cuando una pagina recibe muchas peticiones
//rey limit configurar el RATE LIMING limita la cantidad de solicitudes por segundos, si excedes el maximo se ace la conexion
