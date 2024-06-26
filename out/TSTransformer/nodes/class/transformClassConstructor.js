"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformClassConstructor = void 0;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformExpression_1 = require("../expressions/transformExpression");
const transformIdentifier_1 = require("../expressions/transformIdentifier");
const transformParameters_1 = require("../transformParameters");
const transformPropertyName_1 = require("../transformPropertyName");
const transformStatementList_1 = require("../transformStatementList");
const getExtendsNode_1 = require("../../util/getExtendsNode");
const getStatements_1 = require("../../util/getStatements");
const typescript_1 = __importDefault(require("typescript"));
function transformClassConstructor(state, node, name, originNode) {
    var _a;
    const statements = luau_ast_1.default.list.make();
    let bodyStatements = originNode ? (0, getStatements_1.getStatements)(originNode.body) : [];
    let removeFirstSuper = false;
    let parameters = luau_ast_1.default.list.make();
    let hasDotDotDot = false;
    if (originNode) {
        const { statements: paramStatements, parameters: constructorParams, hasDotDotDot: constructorHasDotDotDot, } = (0, transformParameters_1.transformParameters)(state, originNode);
        luau_ast_1.default.list.pushList(statements, paramStatements);
        parameters = constructorParams;
        hasDotDotDot = constructorHasDotDotDot;
    }
    else if ((0, getExtendsNode_1.getExtendsNode)(node)) {
        hasDotDotDot = true;
        luau_ast_1.default.list.push(statements, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.CallStatement, {
            expression: luau_ast_1.default.call(luau_ast_1.default.property(luau_ast_1.default.globals.super, "constructor"), [
                luau_ast_1.default.globals.self,
                luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.VarArgsLiteral, {}),
            ]),
        }));
    }
    function transformFirstSuper() {
        if (!removeFirstSuper) {
            removeFirstSuper = true;
            if (bodyStatements.length > 0) {
                const firstStatement = bodyStatements[0];
                if (typescript_1.default.isExpressionStatement(firstStatement) && typescript_1.default.isSuperCall(firstStatement.expression)) {
                    luau_ast_1.default.list.pushList(statements, (0, transformStatementList_1.transformStatementList)(state, originNode === null || originNode === void 0 ? void 0 : originNode.body, [firstStatement]));
                }
            }
        }
    }
    for (const parameter of (_a = originNode === null || originNode === void 0 ? void 0 : originNode.parameters) !== null && _a !== void 0 ? _a : []) {
        if (typescript_1.default.isParameterPropertyDeclaration(parameter, parameter.parent)) {
            transformFirstSuper();
            const paramId = (0, transformIdentifier_1.transformIdentifierDefined)(state, parameter.name);
            luau_ast_1.default.list.push(statements, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
                left: luau_ast_1.default.property(luau_ast_1.default.globals.self, paramId.name),
                operator: "=",
                right: paramId,
            }));
        }
    }
    for (const member of node.members) {
        if (typescript_1.default.isPropertyDeclaration(member) && !typescript_1.default.hasStaticModifier(member)) {
            transformFirstSuper();
            const name = member.name;
            if (typescript_1.default.isPrivateIdentifier(name)) {
                DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noPrivateIdentifier(node));
                continue;
            }
            const initializer = member.initializer;
            if (!initializer) {
                continue;
            }
            const [index, indexPrereqs] = state.capture(() => (0, transformPropertyName_1.transformPropertyName)(state, name));
            luau_ast_1.default.list.pushList(statements, indexPrereqs);
            const [right, rightPrereqs] = state.capture(() => (0, transformExpression_1.transformExpression)(state, initializer));
            luau_ast_1.default.list.pushList(statements, rightPrereqs);
            luau_ast_1.default.list.push(statements, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
                left: luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
                    expression: luau_ast_1.default.globals.self,
                    index,
                }),
                operator: "=",
                right,
            }));
        }
    }
    if (removeFirstSuper && bodyStatements.length > 0) {
        const firstStatement = bodyStatements[0];
        if (typescript_1.default.isExpressionStatement(firstStatement) && typescript_1.default.isSuperCall(firstStatement.expression)) {
            bodyStatements = bodyStatements.slice(1);
        }
    }
    luau_ast_1.default.list.pushList(statements, (0, transformStatementList_1.transformStatementList)(state, originNode === null || originNode === void 0 ? void 0 : originNode.body, bodyStatements));
    return luau_ast_1.default.list.make(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.MethodDeclaration, {
        expression: name,
        name: "constructor",
        statements,
        parameters,
        hasDotDotDot,
    }));
}
exports.transformClassConstructor = transformClassConstructor;
//# sourceMappingURL=transformClassConstructor.js.map