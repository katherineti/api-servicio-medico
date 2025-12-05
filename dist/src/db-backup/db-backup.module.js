"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbBackupModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const db_module_1 = require("../db.module");
const db_backup_controller_1 = require("./db-backup.controller");
const db_backup_restore_service_1 = require("./db-backup-restore.service");
let DbBackupModule = class DbBackupModule {
};
exports.DbBackupModule = DbBackupModule;
exports.DbBackupModule = DbBackupModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, db_module_1.DrizzleDbConecctionModule],
        controllers: [db_backup_controller_1.DbBackupController],
        providers: [db_backup_restore_service_1.DbBackupService],
    })
], DbBackupModule);
//# sourceMappingURL=db-backup.module.js.map