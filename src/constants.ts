import 'dotenv/config';

export const PG_CONNECTION = 'PG_CONNECTION';
export const JWTSecret = process.env.JWT_SECRET; //accede a la variable JWT_SECRET en el archivo enviroment
export const STATUS_ACTIVO = 1;
export const STATUS_UPDATED = 5;