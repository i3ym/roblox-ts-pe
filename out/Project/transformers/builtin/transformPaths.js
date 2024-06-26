"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPaths = exports.normalizePath = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const assert_1 = require("../../../Shared/util/assert");
const typescript_1 = __importDefault(require("typescript"));
const url_1 = require("url");
const normalizePath = (p) => /^\\\\\?\\/.test(p) || /[^\u0000-\u0080]+/.test(p)
    ? p
    :
        p.replace(/[\\/]+/g, "/");
exports.normalizePath = normalizePath;
const transformPaths = (context) => (sourceFile) => {
    var _a, _b;
    (0, assert_1.assert)(typescript_1.default.isSourceFile(sourceFile));
    const resolver = typeof context.getEmitResolver === "function" ? context.getEmitResolver() : undefined;
    const compilerOptions = context.getCompilerOptions();
    const sourceDir = (0, path_1.dirname)(sourceFile.fileName);
    const implicitExtensions = [".ts", ".d.ts"];
    const allowJs = compilerOptions.allowJs === true;
    const allowJsx = compilerOptions.jsx !== undefined && compilerOptions.jsx !== typescript_1.default.JsxEmit.None;
    const allowJson = compilerOptions.resolveJsonModule === true;
    allowJs && implicitExtensions.push(".js");
    allowJsx && implicitExtensions.push(".tsx");
    allowJs && allowJsx && implicitExtensions.push(".jsx");
    allowJson && implicitExtensions.push(".json");
    const { isDeclarationFile } = sourceFile;
    const { baseUrl = "", paths = {} } = compilerOptions;
    paths["*"] = (_b = (_a = paths["*"]) === null || _a === void 0 ? void 0 : _a.concat("*")) !== null && _b !== void 0 ? _b : ["*"];
    const binds = Object.keys(paths)
        .filter(key => paths[key].length)
        .map(key => ({
        regexp: new RegExp("^" + key.replace("*", "(.*)") + "$"),
        paths: paths[key],
    }));
    if (!baseUrl || binds.length === 0) {
        return sourceFile;
    }
    function isRelative(s) {
        return s[0] === ".";
    }
    function isUrl(s) {
        return (0, url_1.parse)(s).protocol !== null;
    }
    function fileExists(s) {
        for (const ext of implicitExtensions)
            if ((0, fs_1.existsSync)(s + ext))
                return true;
        if ((0, path_1.extname)(s) !== "")
            return (0, fs_1.existsSync)(s);
        return false;
    }
    function bindModuleToFile(moduleName) {
        if (isRelative(moduleName)) {
            return moduleName;
        }
        for (const { regexp, paths } of binds) {
            const match = regexp.exec(moduleName);
            if (match) {
                for (const p of paths) {
                    const out = p.replace(/\*/g, match[1]);
                    if (isUrl(out))
                        return out;
                    const filepath = (0, path_1.resolve)(baseUrl, out);
                    if (!fileExists(`${filepath}/index`) && !fileExists(filepath))
                        continue;
                    const resolved = fixupImportPath((0, path_1.relative)(sourceDir, filepath));
                    return isRelative(resolved) ? resolved : `./${resolved}`;
                }
            }
        }
        return undefined;
    }
    const isRequire = (node) => typescript_1.default.isCallExpression(node) &&
        typescript_1.default.isIdentifier(node.expression) &&
        node.expression.text === "require" &&
        typescript_1.default.isStringLiteral(node.arguments[0]) &&
        node.arguments.length === 1;
    const isAsyncImport = (node) => typescript_1.default.isCallExpression(node) &&
        node.expression.kind === typescript_1.default.SyntaxKind.ImportKeyword &&
        typescript_1.default.isStringLiteral(node.arguments[0]) &&
        node.arguments.length === 1;
    function visit(node) {
        if (isRequire(node) || isAsyncImport(node)) {
            return unpathRequireAndAsyncImport(node);
        }
        if (typescript_1.default.isExternalModuleReference(node)) {
            return unpathImportEqualsDeclaration(node);
        }
        if (typescript_1.default.isImportDeclaration(node)) {
            return unpathImportDeclaration(node);
        }
        if (typescript_1.default.isExportDeclaration(node)) {
            return unpathExportDeclaration(node);
        }
        if (typescript_1.default.isImportTypeNode(node)) {
            return unpathImportTypeNode(node);
        }
        return typescript_1.default.visitEachChild(node, visit, context);
    }
    function unpathRequireAndAsyncImport(node) {
        const firstArg = node.arguments[0];
        const file = bindModuleToFile(firstArg.text);
        if (!file) {
            return node;
        }
        const fileLiteral = typescript_1.default.factory.createStringLiteral(file);
        return typescript_1.default.factory.updateCallExpression(node, node.expression, node.typeArguments, [fileLiteral]);
    }
    function unpathImportTypeNode(node) {
        const argument = node.argument;
        const literal = argument.literal;
        if (!typescript_1.default.isStringLiteral(literal)) {
            return node;
        }
        const file = bindModuleToFile(literal.text);
        if (!file) {
            return node;
        }
        const fileLiteral = typescript_1.default.factory.createStringLiteral(file);
        const fileArgument = typescript_1.default.factory.updateLiteralTypeNode(argument, fileLiteral);
        return typescript_1.default.factory.updateImportTypeNode(node, fileArgument, node.attributes, node.qualifier, node.typeArguments, node.isTypeOf);
    }
    function unpathImportEqualsDeclaration(node) {
        if (!typescript_1.default.isStringLiteral(node.expression)) {
            return node;
        }
        const file = bindModuleToFile(node.expression.text);
        if (!file) {
            return node;
        }
        const fileLiteral = typescript_1.default.factory.createStringLiteral(file);
        return typescript_1.default.factory.updateExternalModuleReference(node, fileLiteral);
    }
    function unpathImportDeclaration(node) {
        if (!typescript_1.default.isStringLiteral(node.moduleSpecifier)) {
            return node;
        }
        const file = bindModuleToFile(node.moduleSpecifier.text);
        if (!file) {
            return node;
        }
        const fileLiteral = typescript_1.default.factory.createStringLiteral(file);
        const importClause = typescript_1.default.visitNode(node.importClause, visitImportClause, typescript_1.default.isImportClause);
        return node.importClause === importClause || importClause || isDeclarationFile
            ? typescript_1.default.factory.updateImportDeclaration(node, node.modifiers, node.importClause, fileLiteral, undefined)
            : undefined;
    }
    function visitImportClause(node) {
        const name = resolver.isReferencedAliasDeclaration(node) ? node.name : undefined;
        const namedBindings = typescript_1.default.visitNode(node.namedBindings, visitNamedImportBindings, typescript_1.default.isNamedImports);
        return name || namedBindings
            ? typescript_1.default.factory.updateImportClause(node, node.isTypeOnly, name, namedBindings)
            : undefined;
    }
    function visitNamedImportBindings(node) {
        if (node.kind === typescript_1.default.SyntaxKind.NamespaceImport) {
            return resolver.isReferencedAliasDeclaration(node) ? node : undefined;
        }
        else {
            const elements = typescript_1.default.visitNodes(node.elements, visitImportSpecifier, typescript_1.default.isImportSpecifier);
            return elements.some(e => e) ? typescript_1.default.factory.updateNamedImports(node, elements) : undefined;
        }
    }
    function visitImportSpecifier(node) {
        return resolver.isReferencedAliasDeclaration(node) ? node : undefined;
    }
    function unpathExportDeclaration(node) {
        if (!node.moduleSpecifier || !typescript_1.default.isStringLiteral(node.moduleSpecifier)) {
            return node;
        }
        const file = bindModuleToFile(node.moduleSpecifier.text);
        if (!file) {
            return node;
        }
        const fileLiteral = typescript_1.default.factory.createStringLiteral(file);
        if ((!node.exportClause &&
            !compilerOptions.isolatedModules &&
            !resolver.moduleExportsSomeValue(node.moduleSpecifier)) ||
            (node.exportClause && resolver.isValueAliasDeclaration(node))) {
            return typescript_1.default.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, fileLiteral, node.attributes);
        }
        const exportClause = typescript_1.default.visitNode(node.exportClause, visitNamedExports, typescript_1.default.isNamedExports);
        return node.exportClause === exportClause || exportClause || isDeclarationFile
            ? typescript_1.default.factory.updateExportDeclaration(node, node.modifiers, node.isTypeOnly, node.exportClause, fileLiteral, node.attributes)
            : undefined;
    }
    function visitNamedExports(node) {
        const elements = typescript_1.default.visitNodes(node.elements, visitExportSpecifier, typescript_1.default.isExportSpecifier);
        return elements.some(e => e) ? typescript_1.default.factory.updateNamedExports(node, elements) : undefined;
    }
    function visitExportSpecifier(node) {
        return resolver.isValueAliasDeclaration(node) ? node : undefined;
    }
    function fixupImportPath(p) {
        let res = (0, exports.normalizePath)(p);
        const ext = (0, path_1.extname)(res);
        if (ext && implicitExtensions.includes(ext.replace(/^\./, "")))
            res = res.slice(0, -ext.length);
        return res;
    }
    return typescript_1.default.visitNode(sourceFile, visit);
};
exports.transformPaths = transformPaths;
//# sourceMappingURL=transformPaths.js.map