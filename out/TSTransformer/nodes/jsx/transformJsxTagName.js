"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsxTagName = transformJsxTagName;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformExpression_1 = require("../expressions/transformExpression");
const convertToIndexableExpression_1 = require("../../util/convertToIndexableExpression");
const typescript_1 = __importDefault(require("typescript"));
function transformJsxTagNameExpression(state, node) {
    if (typescript_1.default.isIdentifier(node)) {
        const firstChar = node.text[0];
        if (firstChar === firstChar.toLowerCase()) {
            return luau_ast_1.default.string(node.text);
        }
    }
    if (typescript_1.default.isPropertyAccessExpression(node)) {
        if (typescript_1.default.isPrivateIdentifier(node.name)) {
            DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noPrivateIdentifier(node.name));
        }
        return luau_ast_1.default.property((0, convertToIndexableExpression_1.convertToIndexableExpression)((0, transformExpression_1.transformExpression)(state, node.expression)), node.name.text);
    }
    else if (typescript_1.default.isJsxNamespacedName(node)) {
        return luau_ast_1.default.string(typescript_1.default.getTextOfJsxNamespacedName(node));
    }
    else {
        return (0, transformExpression_1.transformExpression)(state, node);
    }
}
function transformJsxTagName(state, tagName) {
    const [expression, prereqs] = state.capture(() => transformJsxTagNameExpression(state, tagName));
    let tagNameExp = expression;
    if (!luau_ast_1.default.list.isEmpty(prereqs)) {
        state.prereqList(prereqs);
        tagNameExp = state.pushToVarIfComplex(tagNameExp, "tagName");
    }
    return tagNameExp;
}
//# sourceMappingURL=transformJsxTagName.js.map