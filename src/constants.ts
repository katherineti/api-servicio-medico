import 'dotenv/config';

export const PG_CONNECTION = 'PG_CONNECTION';
export const JWTSecret = process.env.JWT_SECRET;

export const PRODUCT_STATUS_ACTIVO = 1;
export const PRODUCT_STATUS_INACTIVO = 2;//sin stock
export const PRODUCT_STATUS_PROX_A_VENCERSE = 3;
export const PRODUCT_STATUS_CADUCADO = 4;

export const REPORT_STATUS_FINALIZADO = 1;
export const REPORT_STATUS_ENPROCESO = 2;
export const REPORT_STATUS_DUPLICADO = 3;

export const jwtConstants = {
    secret: process.env.JWT_SECRET
};