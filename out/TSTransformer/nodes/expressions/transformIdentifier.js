"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformIdentifierDefined = transformIdentifierDefined;
exports.transformIdentifier = transformIdentifier;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const assert_1 = require("../../../Shared/util/assert");
const getOrSetDefault_1 = require("../../../Shared/util/getOrSetDefault");
const TSTransformer_1 = require("../..");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const typeGuards_1 = require("../../typeGuards");
const getExtendsNode_1 = require("../../util/getExtendsNode");
const isSymbolMutable_1 = require("../../util/isSymbolMutable");
const traversal_1 = require("../../util/traversal");
const types_1 = require("../../util/types");
const typescript_1 = __importDefault(require("typescript"));
function transformIdentifierDefined(state, node) {
    const symbol = typescript_1.default.isShorthandPropertyAssignment(node.parent)
        ? state.typeChecker.getShorthandAssignmentValueSymbol(node.parent)
        : state.typeChecker.getSymbolAtLocation(node);
    (0, assert_1.assert)(symbol);
    const replacementId = state.symbolToIdMap.get(symbol);
    if (replacementId) {
        return replacementId;
    }
    return luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Identifier, {
        name: node.text,
    });
}
function getAncestorWhichIsChildOf(parent, node) {
    while (node.parent && node.parent !== parent) {
        node = node.parent;
    }
    return node.parent ? node : undefined;
}
function getDeclarationFromImport(symbol) {
    var _a;
    for (const declaration of (_a = symbol.declarations) !== null && _a !== void 0 ? _a : []) {
        const importDec = (0, traversal_1.getAncestor)(declaration, typescript_1.default.isAnyImportSyntax);
        if (importDec) {
            return declaration;
        }
    }
}
function checkIdentifierHoist(state, node, symbol) {
    var _a;
    if (state.isHoisted.get(symbol) !== undefined) {
        return;
    }
    const declaration = (_a = symbol.valueDeclaration) !== null && _a !== void 0 ? _a : getDeclarationFromImport(symbol);
    if (!declaration || (0, traversal_1.getAncestor)(declaration, typescript_1.default.isParameter) || typescript_1.default.isShorthandPropertyAssignment(declaration)) {
        return;
    }
    if (typescript_1.default.isClassLike(declaration) && (0, traversal_1.isAncestorOf)(declaration, node)) {
        return;
    }
    const declarationStatement = (0, traversal_1.getAncestor)(declaration, typescript_1.default.isStatement);
    if (!declarationStatement ||
        typescript_1.default.isForStatement(declarationStatement) ||
        typescript_1.default.isForOfStatement(declarationStatement) ||
        typescript_1.default.isTryStatement(declarationStatement)) {
        return;
    }
    const parent = declarationStatement.parent;
    if (!parent || !(0, typeGuards_1.isBlockLike)(parent)) {
        return;
    }
    const sibling = getAncestorWhichIsChildOf(parent, node);
    if (!sibling || !typescript_1.default.isStatement(sibling)) {
        return;
    }
    const declarationIdx = parent.statements.indexOf(declarationStatement);
    const siblingIdx = parent.statements.indexOf(sibling);
    if (siblingIdx > declarationIdx) {
        return;
    }
    if (siblingIdx === declarationIdx) {
        if ((typescript_1.default.isFunctionDeclaration(declarationStatement) &&
            !typescript_1.default.hasSyntacticModifier(declarationStatement, typescript_1.default.ModifierFlags.Async)) ||
            typescript_1.default.isClassDeclaration(declarationStatement) ||
            (typescript_1.default.isVariableStatement(declarationStatement) &&
                (0, traversal_1.getAncestor)(node, node => typescript_1.default.isStatement(node) || typescript_1.default.isFunctionLikeDeclaration(node)) ===
                    declarationStatement)) {
            return;
        }
    }
    (0, getOrSetDefault_1.getOrSetDefault)(state.hoistsByStatement, sibling, () => new Array()).push(node);
    state.isHoisted.set(symbol, true);
    return;
}
function transformIdentifier(state, node) {
    var _a;
    if (!node.parent || typescript_1.default.positionIsSynthesized(node.pos)) {
        return luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Identifier, { name: node.text });
    }
    const symbol = typescript_1.default.isShorthandPropertyAssignment(node.parent)
        ? state.typeChecker.getShorthandAssignmentValueSymbol(node.parent)
        : state.typeChecker.getSymbolAtLocation(node);
    (0, assert_1.assert)(symbol);
    if (state.typeChecker.isUndefinedSymbol(symbol)) {
        return luau_ast_1.default.nil();
    }
    else if (state.typeChecker.isArgumentsSymbol(symbol)) {
        DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noArguments(node));
    }
    else if (symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.globalThis)) {
        DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noGlobalThis(node));
    }
    const macro = state.services.macroManager.getIdentifierMacro(symbol);
    if (macro) {
        return macro(state, node);
    }
    const constructSymbol = (0, types_1.getFirstConstructSymbol)(state, node);
    if (constructSymbol) {
        const constructorMacro = state.services.macroManager.getConstructorMacro(constructSymbol);
        if (constructorMacro) {
            const isClassExtendsNode = typescript_1.default.isClassLike(node.parent.parent.parent) &&
                ((_a = (0, getExtendsNode_1.getExtendsNode)(node.parent.parent.parent)) === null || _a === void 0 ? void 0 : _a.expression) === node;
            if (isClassExtendsNode) {
                DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noMacroExtends(node));
            }
            else {
                DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noConstructorMacroWithoutNew(node));
            }
        }
    }
    const parent = (0, traversal_1.skipUpwards)(node).parent;
    if ((!typescript_1.default.isCallExpression(parent) || (0, traversal_1.skipDownwards)(parent.expression) != node) &&
        state.services.macroManager.getCallMacro(symbol)) {
        DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noIndexWithoutCall(node));
        return luau_ast_1.default.none();
    }
    if (symbol.valueDeclaration &&
        symbol.valueDeclaration.getSourceFile() === node.getSourceFile() &&
        (0, traversal_1.getAncestor)(symbol.valueDeclaration, node => typescript_1.default.isModuleDeclaration(node) && !(0, typeGuards_1.isNamespace)(node)) === undefined) {
        const exportAccess = state.getModuleIdPropertyAccess(symbol);
        if (exportAccess && (0, isSymbolMutable_1.isSymbolMutable)(state, symbol)) {
            return exportAccess;
        }
    }
    checkIdentifierHoist(state, node, symbol);
    return transformIdentifierDefined(state, node);
}
//# sourceMappingURL=transformIdentifier.js.map