import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DrizzleDbConecctionModule } from './db.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    DrizzleDbConecctionModule, //moduleDrizzel
    ConfigModule.forRoot({isGlobal:true}),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
/*
En tu archivo auth.module.ts, donde importas y configuras JwtModule, 
cambia el valor de expiresIn a '1d'. Esto indica que el token expirará después de un día.
explicacion
Explicación de expiresIn

La opción expiresIn acepta varios formatos para especificar la duración de expiración:
Segundos: '60s' (60 segundos)
Minutos: '10m' (10 minutos)
Horas: '2h' (2 horas)
Días: '1d' (1 día).

Consideraciones Importantes
-Seguridad: Un día puede ser un tiempo de expiración largo, dependiendo de la sensibilidad de los datos que proteges. Considera si necesitas un tiempo de expiración más corto o un mecanismo de refresco de tokens para mayor seguridad.
-Refresco de Tokens: Si eliges un tiempo de expiración largo, implementa un mecanismo para refrescar los tokens antes de que expiren. Esto permite a los usuarios mantener sus sesiones activas sin tener que volver a iniciar sesión con frecuencia, al mismo tiempo que limitas el riesgo de que un token comprometido sea válido por mucho tiemp
-Variables de Entorno: Recuerda que la clave secreta (jwtConstants.secret) debe almacenarse de forma segura, preferiblemente en variables de entorno, y no directamente en el código.
 */