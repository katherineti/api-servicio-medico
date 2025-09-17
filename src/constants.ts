import 'dotenv/config';

export const PORT_API = 3000;
export const API_URL= 'http://localhost:3000/'
export const PG_CONNECTION = 'PG_CONNECTION';
export const JWTSecret = process.env.JWT_SECRET;

export const PRODUCT_STATUS_ACTIVO = 1;
export const PRODUCT_STATUS_INACTIVO = 2;//sin stock
export const PRODUCT_STATUS_PROX_A_VENCERSE = 3;
export const PRODUCT_STATUS_CADUCADO = 4;

export const PRODUCT_TYPE_UNIFORMES = 2;

//Reporte de auditoria - Status:
export const REPORT_STATUS_FINALIZADO = 1;
export const REPORT_STATUS_ENPROCESO = 2;
export const REPORT_STATUS_DUPLICADO = 3;
export const REPORT_STATUS_INHABILITADO = 4;
export const REPORT_STATUS_COPIA_EDITADA = 5; //REPORT_STATUS_COPIA_EDITADA: La copia del reporte de auditoria, fue editada 

export const jwtConstants = {
    secret: process.env.JWT_SECRET
};

// export const membreteCIIP = "membreteCIIP.jpeg"
export const membreteCIIP = "CINTILLO-WEB-OFICIAL.jpg"