"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParsedCommandLine = getParsedCommandLine;
const inspector_1 = __importDefault(require("inspector"));
const validateCompilerOptions_1 = require("./validateCompilerOptions");
const DiagnosticError_1 = require("../../Shared/errors/DiagnosticError");
const ProjectError_1 = require("../../Shared/errors/ProjectError");
const typescript_1 = __importDefault(require("typescript"));
function createParseConfigFileHost() {
    return {
        fileExists: typescript_1.default.sys.fileExists,
        getCurrentDirectory: typescript_1.default.sys.getCurrentDirectory,
        onUnRecoverableConfigFileDiagnostic: d => {
            throw new DiagnosticError_1.DiagnosticError([d]);
        },
        readDirectory: typescript_1.default.sys.readDirectory,
        readFile: typescript_1.default.sys.readFile,
        useCaseSensitiveFileNames: typescript_1.default.sys.useCaseSensitiveFileNames,
    };
}
function getParsedCommandLine(data) {
    const parsedCommandLine = typescript_1.default.getParsedCommandLineOfConfigFile(data.tsConfigPath, {}, createParseConfigFileHost());
    if (parsedCommandLine === undefined) {
        throw new ProjectError_1.ProjectError("Unable to load TS program!");
    }
    else if (parsedCommandLine.errors.length > 0) {
        throw new DiagnosticError_1.DiagnosticError(parsedCommandLine.errors);
    }
    if (globalThis.RBXTSC_DEV || inspector_1.default.url() !== undefined) {
        parsedCommandLine.options.incremental = false;
        parsedCommandLine.options.tsBuildInfoFile = undefined;
    }
    (0, validateCompilerOptions_1.validateCompilerOptions)(parsedCommandLine.options, data.projectPath);
    return parsedCommandLine;
}
//# sourceMappingURL=getParsedCommandLine.js.map