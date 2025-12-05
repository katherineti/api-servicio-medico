"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_express_1 = require("@nestjs/platform-express");
const constants_1 = require("./constants");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: "GET,PUT,PATCH,POST,DELETE",
        credentials: false,
        allowedHeaders: 'Content-Type, Authorization',
        exposedHeaders: 'Content-Disposition'
    });
    const multerConfig = app.get(platform_express_1.MulterModule)['options'];
    if (multerConfig?.storage?.options?.destination) {
        console.log(`[NestApp] Configuración de Multer: los archivos se guardarán en ${multerConfig.storage.options.destination}`);
    }
    await app.listen(constants_1.PORT_API);
    console.log("escuchando en el puerto 3000");
}
bootstrap();
//# sourceMappingURL=main.js.map