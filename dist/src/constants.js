"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membreteCIIP = exports.jwtConstants = exports.REPORT_STATUS_COPIA_EDITADA = exports.REPORT_STATUS_INHABILITADO = exports.REPORT_STATUS_DUPLICADO = exports.REPORT_STATUS_ENPROCESO = exports.REPORT_STATUS_FINALIZADO = exports.PRODUCT_TYPE_UNIFORMES = exports.PRODUCT_STATUS_CADUCADO = exports.PRODUCT_STATUS_PROX_A_VENCERSE = exports.PRODUCT_STATUS_INACTIVO = exports.PRODUCT_STATUS_ACTIVO = exports.JWTSecret = exports.PG_CONNECTION = exports.API_URL = exports.PORT_API = void 0;
require("dotenv/config");
exports.PORT_API = 3000;
exports.API_URL = 'http://localhost:3000/';
exports.PG_CONNECTION = 'PG_CONNECTION';
exports.JWTSecret = process.env.JWT_SECRET;
exports.PRODUCT_STATUS_ACTIVO = 1;
exports.PRODUCT_STATUS_INACTIVO = 2;
exports.PRODUCT_STATUS_PROX_A_VENCERSE = 3;
exports.PRODUCT_STATUS_CADUCADO = 4;
exports.PRODUCT_TYPE_UNIFORMES = 2;
exports.REPORT_STATUS_FINALIZADO = 1;
exports.REPORT_STATUS_ENPROCESO = 2;
exports.REPORT_STATUS_DUPLICADO = 3;
exports.REPORT_STATUS_INHABILITADO = 4;
exports.REPORT_STATUS_COPIA_EDITADA = 5;
exports.jwtConstants = {
    secret: process.env.JWT_SECRET
};
exports.membreteCIIP = "CINTILLO-WEB-OFICIAL.jpg";
//# sourceMappingURL=constants.js.map