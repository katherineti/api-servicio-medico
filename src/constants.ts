import 'dotenv/config';

export const PG_CONNECTION = 'PG_CONNECTION';
export const JWTSecret = process.env.JWT_SECRET;
export const STATUS_ACTIVO = 1;
export const STATUS_INACTIVO = 2;//sin stock
export const STATUS_PROX_A_VENCER = 3;
export const STATUS_CADUCADO = 4;

export const jwtConstants = {
    secret: process.env.JWT_SECRET
  };