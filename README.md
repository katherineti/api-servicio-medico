crea tabla de usuario y roles en BD postgres con el ORM Drizzle
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

imporaciones desde la terminal integrada del proyect
npm i @nestjs/config
npm i @neondatabase/serverless

<!-- curso -->
const id= "user cualquiera' OR '1'='1";
sql ´select * from users where usersTable.login = ''´ 

//21/02/2025

//DELETE FROM users;  tarda 1hr en borrar los registros
//TRUNCATE FROM users;  


AUTENTICACION
CONTRASEÑAS: HAY QUE ENCRIPTAR LAS CONTRASEÑAS PARA EVITAR HACKEOS O ROBOS DE INFORMACION
INYECCIONES SQL? 

QUERY BUILDER ES  SON LAS FUNCIONES QUE USO PARA CONSULTAS GRACIAS AL ORM
TAMBIEN SE PUEDE ESCRIBIR EN MODO TEXTO COMO CONSULTA NORMAL asi: db.EXECUTE('select * from users') 

instalar  https://www.npmjs.com/package/argon2 que es un algoritmo hasg para para encriptaciones de contraseña Y como es un hash no se puede desencriptar.

  async getUsers() {
    
    const result = await this.conn
    // .select()
    .select({
      id: usersTable.id,
      nombre: usersTable.name,
      apellido: usersTable.lastname,
      // role_id: usersTable.roles_id, //no. Solo hay que cargar la informacion necesaria porque la informacion viaja como texto con el protocolo de comunicacion de datos: HTTPS , y mientras menos informacion mande mas rapido viaja
      role: roleTable.code,
    })
    .from(usersTable)
    .innerJoin( roleTable, eq( usersTable.roles_id ,roleTable.id ) )

    return result; //resultado es un json con clave(nombre del campo) y valor(valor del campo)
  }

      const newUser = {
        ...createUser,
        password: hash, //reemplaza el password que viene en el ...createUser con un nuevo valor: hash. Estoy sobreescribiendo la contraseña
        roles_id: 1
      };

try{
}casj{
}
Es para  manejar los errores.
Intenta gacer lo que esta en parentesis, y si encuentra un error ejecuta lo que hay en el hash
Todo lo que coloque afuera del try para llamar algo que esta dentro del try NO lo va a reconocer porque solo existe dentro de las llaves del try, por eso el insert tambien va dentro de las llaves


Ataque DoS o 'Ataque de denegacion de servicio'? investigar. inyectan virus que lo que hacen es i nyectar scripts y cuando hacen llamadas corren millones de scripts y eso tumba un servidor. entonces el serv se vuelve vulnerable y pueden acceder a sus datos.

<!-- curso -->
tabla de usuarios:
SELECT id, name, lastname, age, email, created_at, roles_id, password, username
	FROM public.users;
	
	/*
	-inyeccion de sql de antes actualmente ya es raro pero ocurre en sistemas antiguos. asi pueden ser hackeados los sistemas para obtener todos los usuarios de un tabla
	-info sensible
	claves,cuentas de banco
	las contraseñas no se deben ver. se debe usar CIFRASDO Y HASH para cifrar esta infrmacion sensible
ejemplo los bancos cuando se hace transferencia la inform se cifra y no se descifra hasta que llega al banco
los mensj de whasap cuando en vias un  mensj a un persona. el msj de cifra y solo puede ser descifrado por el destinatario.

DIFERENCIAS ENTRE:
HASH
el cifrado puedes encriptar y desencriptar
HASH
no la puedes volver a desencriptar.
conviertes un valor 'hola' en -> HASH y no lo puedes volver a su forma original
Ejemplo usando la pagina md5.cz que coloco un valor y me da un hash. PERO ACTUAQLMENTE YA NO ES SEGURO PORQUE HAY PERSONAS QUE YA DESCRIFRARON ESTE HASH DE MD5
Ejemplo con SHA1
EJEMPLO SHA2
DIFERENCIA ENTRE SHA1 Y SHA2: SHA2 ES MAS LARGO
EJEMPLO : Argon2 . LIBRERIA node-argon2

lo recomendable es SHA256  Y SHA512 TAMBIEN PERO ES MUY LARGO ASI QUE MUUUY LENTO, PPOR ESO ES MEJOR EL ***** SHA256 ******

Y MIENTRAS MAS CORTO ES MAS INSEGURO, ENTONCERS HAY QUE BUSCAR LOS MAS LARGOS

el ***** Argon2 ****** es mas seguro que el ***** SHA256 ******
*/

--inyeccion de sql: si ejecuto ese script en la tabla de mi BD me va a traer toda la informacion. Tambien si coloco solo esto en el campo de login de m i formulario login:  'user cualquiera' OR '1'='1' , y coloco contraseña y le doy al boton entonces me voy a las herramientas de desarrollador en Network que me saldra el endpoint del login, y entonces el hacker puede tomar el endpoint y coloar en el login ese scrip y le dara toda la info
	select * from users where users.username = 'user cualquiera' OR '1'='1'

  26/02
  configurar el cors en el archivo main.ts
  //funciona si haces request entre paginas web
  app.enableCors({
    // origin: ['*'], //colocar siempre : acepta todos
    origin: ['https://www.appfrontangular.com'], //restringo las paginas que se pueden comunicar con mi api
    methods: ['GET','POST','UPDATE','DELETE'],//si no coloco nada acepta todo
    allowedHeaders: ['content-Type', 'origin'], //headers permitidos
    credentials: false
  })
//limitador de velcoidad (request) : es para evitar el error 409 cuando una pagina recibe muchas peticiones
//rey limit configurar el RATE LIMING limita la cantidad de solicitudes por segundos, si excedes el maximo se ace la conexion

*******************
  instalacion del comando: npm install --save @nestjs/jwt
  en el servicio de autenticacion INYECTAR el :JwtService

                                    es tu llave de acceso al servidor: JWT
SUB - SIGNIFICA SUBJECT 

PAGINA DE JWT: https://emn178.github.io/online-tools/sha256.html
PAGINA WEB DE DOCUMENTACION PARA token con nest.js : https://docs.nestjs.com/security/authentication

1)en el servicio del auth , en un metodo login colocar esto:
            const payload = { sub: user.id, username: user.username };
            return { //TOKEN  es la firma 
              access_token: await this.jwtService.signAsync(payload),
            };penv
2) en el mo dulo App importar el modulo JWT con una configuracion, asi:
a)en el archivo de constantes, agregar esto:
export const JWTSecret = process.env.JWT_SECRET; //accede a la variable JWT_SECRET en el archivo enviroment
a)en el enviroment agergar esto: 
JWT_SECRET = 2ca98e7b4098aad1450a7351d3598d2eeddecfa508932caafe34387534725e90 

a)agregar esto en el import dl modulo app:
    JwtModule.register({
      global: true,
      secret: JWTSecret, //jwtConstants.secret,
      // signOptions: { expiresIn: '60s' }, //se vence en una hora
      // signOptions: { expiresIn: '1d' }, //expira en 1 dia
      signOptions: { expiresIn: 60*60*24 },  //expira en 1 dia - tambien se pone asi
    }),
  

ultimo usuario creado el 05/03
{
 // "name":"kathe",
 // "lastname":"guti",
  "email":"katy@gmail.com",
 // "username":"miusername",
  "password":"12345678"
 // "age":2
}