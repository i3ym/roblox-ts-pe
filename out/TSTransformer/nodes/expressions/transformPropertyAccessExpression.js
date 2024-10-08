"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPropertyAccessExpressionInner = transformPropertyAccessExpressionInner;
exports.transformPropertyAccessExpression = transformPropertyAccessExpression;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const transformOptionalChain_1 = require("../transformOptionalChain");
const addIndexDiagnostics_1 = require("../../util/addIndexDiagnostics");
const convertToIndexableExpression_1 = require("../../util/convertToIndexableExpression");
const getConstantValueLiteral_1 = require("../../util/getConstantValueLiteral");
const traversal_1 = require("../../util/traversal");
const validateNotAny_1 = require("../../util/validateNotAny");
const typescript_1 = __importDefault(require("typescript"));
function transformPropertyAccessExpressionInner(state, node, expression, name) {
    (0, validateNotAny_1.validateNotAnyType)(state, node.expression);
    (0, addIndexDiagnostics_1.addIndexDiagnostics)(state, node, state.typeChecker.getNonOptionalType(state.getType(node)));
    if (typescript_1.default.isDeleteExpression((0, traversal_1.skipUpwards)(node).parent)) {
        state.prereq(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
            left: luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(expression), name),
            operator: "=",
            right: luau_ast_1.default.nil(),
        }));
        return luau_ast_1.default.none();
    }
    return luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)(expression), name);
}
function transformPropertyAccessExpression(state, node) {
    const constantValue = (0, getConstantValueLiteral_1.getConstantValueLiteral)(state, node);
    if (constantValue) {
        return constantValue;
    }
    return (0, transformOptionalChain_1.transformOptionalChain)(state, node);
}
//# sourceMappingURL=transformPropertyAccessExpression.js.map