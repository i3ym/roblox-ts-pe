"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualProject = void 0;
const luau_ast_1 = require("@roblox-ts/luau-ast");
const path_translator_1 = require("@roblox-ts/path-translator");
const rojo_resolver_1 = require("@roblox-ts/rojo-resolver");
const VirtualFileSystem_1 = require("./VirtualFileSystem");
const validateCompilerOptions_1 = require("../functions/validateCompilerOptions");
const getCustomPreEmitDiagnostics_1 = require("../util/getCustomPreEmitDiagnostics");
const constants_1 = require("../../Shared/constants");
const DiagnosticError_1 = require("../../Shared/errors/DiagnosticError");
const assert_1 = require("../../Shared/util/assert");
const hasErrors_1 = require("../../Shared/util/hasErrors");
const TSTransformer_1 = require("../../TSTransformer");
const DiagnosticService_1 = require("../../TSTransformer/classes/DiagnosticService");
const createTransformServices_1 = require("../../TSTransformer/util/createTransformServices");
const typescript_1 = __importDefault(require("typescript"));
const PROJECT_DIR = VirtualFileSystem_1.PATH_SEP;
const ROOT_DIR = (0, VirtualFileSystem_1.pathJoin)(PROJECT_DIR, "src");
const OUT_DIR = (0, VirtualFileSystem_1.pathJoin)(PROJECT_DIR, "out");
const PLAYGROUND_PATH = (0, VirtualFileSystem_1.pathJoin)(ROOT_DIR, "playground.tsx");
const NODE_MODULES_PATH = (0, VirtualFileSystem_1.pathJoin)(PROJECT_DIR, constants_1.NODE_MODULES);
const RBXTS_SCOPE_PATH = (0, VirtualFileSystem_1.pathJoin)(NODE_MODULES_PATH, constants_1.RBXTS_SCOPE);
const INCLUDE_PATH = (0, VirtualFileSystem_1.pathJoin)(PROJECT_DIR, "include");
class VirtualProject {
    constructor() {
        this.nodeModulesPathMapping = new Map();
        this.data = {
            isPackage: false,
            nodeModulesPath: NODE_MODULES_PATH,
            projectOptions: Object.assign({}, constants_1.DEFAULT_PROJECT_OPTIONS, {
                rojo: "",
                type: constants_1.ProjectType.Model,
                optimizedLoops: true,
            }),
            projectPath: PROJECT_DIR,
            rojoConfigPath: undefined,
            tsConfigPath: "",
        };
        this.compilerOptions = {
            allowSyntheticDefaultImports: true,
            downlevelIteration: true,
            noLib: true,
            strict: true,
            target: typescript_1.default.ScriptTarget.ESNext,
            module: typescript_1.default.ModuleKind.CommonJS,
            moduleResolution: typescript_1.default.ModuleResolutionKind.Node10,
            moduleDetection: typescript_1.default.ModuleDetectionKind.Force,
            typeRoots: [RBXTS_SCOPE_PATH],
            resolveJsonModule: true,
            experimentalDecorators: true,
            rootDir: ROOT_DIR,
            outDir: OUT_DIR,
            jsx: typescript_1.default.JsxEmit.React,
            jsxFactory: "React.createElement",
            jsxFragmentFactory: "React.Fragment",
        };
        (0, validateCompilerOptions_1.validateCompilerOptions)(this.compilerOptions, this.data.projectPath);
        this.vfs = new VirtualFileSystem_1.VirtualFileSystem();
        const system = {
            getExecutingFilePath: () => __filename,
            getCurrentDirectory: () => "/",
        };
        this.compilerHost = typescript_1.default.createCompilerHostWorker(this.compilerOptions, undefined, system);
        this.compilerHost.readFile = filePath => this.vfs.readFile(filePath);
        this.compilerHost.fileExists = filePath => this.vfs.fileExists(filePath);
        this.compilerHost.directoryExists = dirPath => this.vfs.directoryExists(dirPath);
        this.compilerHost.getDirectories = dirPath => this.vfs.getDirectories(dirPath);
        this.compilerHost.useCaseSensitiveFileNames = () => true;
        this.compilerHost.getCurrentDirectory = () => VirtualFileSystem_1.PATH_SEP;
        this.rojoResolver = rojo_resolver_1.RojoResolver.fromTree(PROJECT_DIR, {
            $path: OUT_DIR,
            include: {
                $path: INCLUDE_PATH,
                node_modules: {
                    $className: "Folder",
                    "@rbxts": {
                        $path: RBXTS_SCOPE_PATH,
                    },
                },
            },
        });
        this.pkgRojoResolvers = this.compilerOptions.typeRoots.map(rojo_resolver_1.RojoResolver.synthetic);
    }
    compileSource(source) {
        this.vfs.writeFile(PLAYGROUND_PATH, source);
        const rootNames = this.vfs
            .getFilePaths()
            .filter(v => v.endsWith(typescript_1.default.Extension.Ts) || v.endsWith(typescript_1.default.Extension.Tsx) || v.endsWith(typescript_1.default.Extension.Dts));
        this.program = typescript_1.default.createProgram(rootNames, this.compilerOptions, this.compilerHost, this.program);
        this.typeChecker = this.program.getTypeChecker();
        const services = (0, createTransformServices_1.createTransformServices)(this.typeChecker);
        const pathTranslator = new path_translator_1.PathTranslator(ROOT_DIR, OUT_DIR, undefined, false, this.data.projectOptions.luau);
        const sourceFile = this.program.getSourceFile(PLAYGROUND_PATH);
        (0, assert_1.assert)(sourceFile);
        const diagnostics = new Array();
        diagnostics.push(...typescript_1.default.getPreEmitDiagnostics(this.program, sourceFile));
        diagnostics.push(...(0, getCustomPreEmitDiagnostics_1.getCustomPreEmitDiagnostics)(this.data, sourceFile));
        if ((0, hasErrors_1.hasErrors)(diagnostics))
            throw new DiagnosticError_1.DiagnosticError(diagnostics);
        const multiTransformState = new TSTransformer_1.MultiTransformState();
        const runtimeLibRbxPath = undefined;
        const projectType = this.data.projectOptions.type;
        const transformState = new TSTransformer_1.TransformState(this.program, this.data, services, pathTranslator, multiTransformState, this.compilerOptions, this.rojoResolver, this.pkgRojoResolvers, this.nodeModulesPathMapping, runtimeLibRbxPath, this.typeChecker, projectType, sourceFile);
        const luaAST = (0, TSTransformer_1.transformSourceFile)(transformState, sourceFile);
        diagnostics.push(...DiagnosticService_1.DiagnosticService.flush());
        if ((0, hasErrors_1.hasErrors)(diagnostics))
            throw new DiagnosticError_1.DiagnosticError(diagnostics);
        const luaSource = (0, luau_ast_1.renderAST)(luaAST);
        return luaSource;
    }
    setMapping(typings, main) {
        this.nodeModulesPathMapping.set(typings, main);
    }
}
exports.VirtualProject = VirtualProject;
//# sourceMappingURL=VirtualProject.js.map