"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentController = void 0;
const common_1 = require("@nestjs/common");
const assignment_service_1 = require("./assignment.service");
const create_assignment_dto_1 = require("./dto/create-assignment.dto");
const create_family_dto_1 = require("./dto/create-family.dto");
const usersesion_decorator_1 = require("../auth/strategies/usersesion.decorator");
let AssignmentController = class AssignmentController {
    constructor(assignmentService) {
        this.assignmentService = assignmentService;
    }
    async createAssignment(createAssignmentDto, user, clienteIp, req) {
        let client = {
            ip: clienteIp,
            hostname: req.headers['host']
        };
        return this.assignmentService.createAssignment(createAssignmentDto, user.sub, client);
    }
    getUsers() {
        return this.assignmentService.getAllEmployees();
    }
    getFamiliesByEmployee(employeeId) {
        console.log("this.assignmentService.getFamiliesByEmployee(employeeId) -> ", this.assignmentService.getFamiliesByEmployee(employeeId));
        return this.assignmentService.getFamiliesByEmployee(employeeId);
    }
    getAllTypesAssignment() {
        return this.assignmentService.getAllTypesAssignment();
    }
    addFamilyMember(createFamilyDto) {
        return this.assignmentService.addFamilyMember(createFamilyDto);
    }
    addEmployee(createEmployeeDto) {
        return this.assignmentService.addEmployee(createEmployeeDto);
    }
};
exports.AssignmentController = AssignmentController;
__decorate([
    (0, common_1.Post)('create-assignment'),
    (0, common_1.UsePipes)(common_1.ValidationPipe),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, usersesion_decorator_1.Usersesion)()),
    __param(2, (0, common_1.Ip)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_assignment_dto_1.CreateAssignmentDto, Object, String, Request]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "createAssignment", null);
__decorate([
    (0, common_1.Get)('getAllEmployees'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('getFamiliesByEmployee/:employeeId'),
    __param(0, (0, common_1.Param)('employeeId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "getFamiliesByEmployee", null);
__decorate([
    (0, common_1.Get)('getAllTypesAssignment'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "getAllTypesAssignment", null);
__decorate([
    (0, common_1.Post)('addFamilyMember'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_family_dto_1.CreateFamilyDto]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "addFamilyMember", null);
__decorate([
    (0, common_1.Post)('addEmployee'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AssignmentController.prototype, "addEmployee", null);
exports.AssignmentController = AssignmentController = __decorate([
    (0, common_1.Controller)('assignment'),
    __metadata("design:paramtypes", [assignment_service_1.AssignmentService])
], AssignmentController);
//# sourceMappingURL=assignment.controller.js.map