"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warn = warn;
const kleur_1 = __importDefault(require("kleur"));
const LogService_1 = require("./classes/LogService");
function warn(message) {
    LogService_1.LogService.writeLine(`${kleur_1.default.yellow("Compiler Warning:")} ${message}`);
}
//# sourceMappingURL=warn.js.map