"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReadBuildProgramHost = createReadBuildProgramHost;
const typescript_1 = __importDefault(require("typescript"));
function createReadBuildProgramHost() {
    return {
        getCurrentDirectory: typescript_1.default.sys.getCurrentDirectory,
        readFile: typescript_1.default.sys.readFile,
        useCaseSensitiveFileNames: () => typescript_1.default.sys.useCaseSensitiveFileNames,
    };
}
//# sourceMappingURL=createReadBuildProgramHost.js.map