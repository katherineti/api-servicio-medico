1.- En .env
reemplazar con:
     DATABASE_URL=postgresql://curso_owner:m5pPjogD3FhW@ep-quiet-term-a5biz3w7.us-east-2.aws.neon.tech@localhost:5432/ciip_medical_service
o agregar:
     DATABASE_URL_LOCAL=postgresql://curso_owner:m5pPjogD3FhW@ep-quiet-term-a5biz3w7.us-east-2.aws.neon.tech@localhost:5432/ciip_medical_service

2.- Ajustar el driver de Drizzle en DrizzleDbConecctionModule
Cuando te conectas a Neon, usas el driver drizzle-orm/neon-http porque Neon funciona sobre HTTP. Para una base de datos PostgreSQL local, que es una conexión directa TCP, lo más común y eficiente es usar drizzle-orm/node-postgres (que es el wrapper de Drizzle sobre el popular paquete pg).

eliminar:
import { drizzle } from 'drizzle-orm/neon-http';
const db = drizzle(connectionString)

entonces en DrizzleDbConecctionModule agregar:
import * as schema from '../db/schema'; // ¡Importante! Asegúrate de pasar tu esquema
import { Pool } from 'pg'; 

// Creamos un Pool de conexiones usando el driver 'pg' (node-postgres)
 const pool = new Pool({
    connectionString
});
// Inicializamos Drizzle con el Pool y tu esquema
const db = drizzle(pool, { schema }); // Pasamos el pool y el esquema

3.-  Instalar LOS paquetes pg , @types/pg (ya esta instalado)
npm install pg
npm install -D @types/pg # Si usas TypeScript y 'pg'

4.- Ajustar la inyección en tus servicios (tipo)
En tu servicio MedicalSuppliesExpiredService, el tipo de la base de datos inyectada también cambiará, de NeonDatabase a NodePgDatabase.


5-
Mira tu inyección: private db: NeonDatabase. Cuando usas drizzle(connectionString, { schema }), el tipo inferido de db es NeonDatabase<typeof schema>. Sin el { schema }, el tipo sería solo NeonDatabase, lo que te daría menos ayuda de TypeScript al escribir tus consultas.


En los servicio 
agregar

import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/db/schema';// Importa tu esquema
    constructor(
        // ¡Aquí es donde usas el tipo! Directamente en la anotación del parámetro 'db'
        @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>
    ) {}