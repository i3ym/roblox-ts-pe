"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressionMightMutate = expressionMightMutate;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const isSymbolMutable_1 = require("./isSymbolMutable");
const traversal_1 = require("./traversal");
const typescript_1 = __importDefault(require("typescript"));
function expressionMightMutate(state, expression, node) {
    if (luau_ast_1.default.isTemporaryIdentifier(expression)) {
        return false;
    }
    else if (luau_ast_1.default.isParenthesizedExpression(expression)) {
        return expressionMightMutate(state, expression.expression);
    }
    else if (luau_ast_1.default.isSimplePrimitive(expression)) {
        return false;
    }
    else if (luau_ast_1.default.isFunctionExpression(expression)) {
        return false;
    }
    else if (luau_ast_1.default.isVarArgsLiteral(expression)) {
        return false;
    }
    else if (luau_ast_1.default.isIfExpression(expression)) {
        return (expressionMightMutate(state, expression.condition) ||
            expressionMightMutate(state, expression.expression) ||
            expressionMightMutate(state, expression.alternative));
    }
    else if (luau_ast_1.default.isBinaryExpression(expression)) {
        return expressionMightMutate(state, expression.left) || expressionMightMutate(state, expression.right);
    }
    else if (luau_ast_1.default.isUnaryExpression(expression)) {
        return expressionMightMutate(state, expression.expression);
    }
    else if (luau_ast_1.default.isArray(expression) || luau_ast_1.default.isSet(expression)) {
        return luau_ast_1.default.list.some(expression.members, member => expressionMightMutate(state, member));
    }
    else if (luau_ast_1.default.isMap(expression)) {
        return luau_ast_1.default.list.some(expression.fields, field => expressionMightMutate(state, field.index) || expressionMightMutate(state, field.value));
    }
    else {
        if (node) {
            node = (0, traversal_1.skipDownwards)(node);
            if (typescript_1.default.isIdentifier(node)) {
                const symbol = state.typeChecker.getSymbolAtLocation(node);
                if (symbol && !(0, isSymbolMutable_1.isSymbolMutable)(state, symbol)) {
                    return false;
                }
            }
        }
        return true;
    }
}
//# sourceMappingURL=expressionMightMutate.js.map