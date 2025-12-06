"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const platform_express_1 = require("@nestjs/platform-express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        allowedHeaders: 'Content-Type, Authorization',
        exposedHeaders: 'Content-Disposition',
        credentials: true
    });
    const multerConfig = app.get(platform_express_1.MulterModule)['options'];
    if (multerConfig?.storage?.options?.destination) {
        console.log(`[NestApp] Configuración de Multer: los archivos se guardarán en ${multerConfig.storage.options.destination}`);
    }
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`escuchando en el puerto ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map