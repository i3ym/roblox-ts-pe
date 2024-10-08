"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformExpression = transformExpression;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const assert_1 = require("../../../Shared/util/assert");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformArrayLiteralExpression_1 = require("./transformArrayLiteralExpression");
const transformAwaitExpression_1 = require("./transformAwaitExpression");
const transformBinaryExpression_1 = require("./transformBinaryExpression");
const transformBooleanLiteral_1 = require("./transformBooleanLiteral");
const transformCallExpression_1 = require("./transformCallExpression");
const transformClassExpression_1 = require("./transformClassExpression");
const transformConditionalExpression_1 = require("./transformConditionalExpression");
const transformDeleteExpression_1 = require("./transformDeleteExpression");
const transformElementAccessExpression_1 = require("./transformElementAccessExpression");
const transformFunctionExpression_1 = require("./transformFunctionExpression");
const transformIdentifier_1 = require("./transformIdentifier");
const transformJsxElement_1 = require("./transformJsxElement");
const transformJsxExpression_1 = require("./transformJsxExpression");
const transformJsxFragment_1 = require("./transformJsxFragment");
const transformJsxSelfClosingElement_1 = require("./transformJsxSelfClosingElement");
const transformNewExpression_1 = require("./transformNewExpression");
const transformNoSubstitutionTemplateLiteral_1 = require("./transformNoSubstitutionTemplateLiteral");
const transformNumericLiteral_1 = require("./transformNumericLiteral");
const transformObjectLiteralExpression_1 = require("./transformObjectLiteralExpression");
const transformOmittedExpression_1 = require("./transformOmittedExpression");
const transformParenthesizedExpression_1 = require("./transformParenthesizedExpression");
const transformPropertyAccessExpression_1 = require("./transformPropertyAccessExpression");
const transformSpreadElement_1 = require("./transformSpreadElement");
const transformStringLiteral_1 = require("./transformStringLiteral");
const transformSuperKeyword_1 = require("./transformSuperKeyword");
const transformTaggedTemplateExpression_1 = require("./transformTaggedTemplateExpression");
const transformTemplateExpression_1 = require("./transformTemplateExpression");
const transformThisExpression_1 = require("./transformThisExpression");
const transformTypeExpression_1 = require("./transformTypeExpression");
const transformUnaryExpression_1 = require("./transformUnaryExpression");
const transformVoidExpression_1 = require("./transformVoidExpression");
const transformYieldExpression_1 = require("./transformYieldExpression");
const getKindName_1 = require("../../util/getKindName");
const typescript_1 = __importDefault(require("typescript"));
const NO_EMIT = () => luau_ast_1.default.none();
const DIAGNOSTIC = (factory) => (state, node) => {
    DiagnosticService_1.DiagnosticService.addDiagnostic(factory(node));
    return NO_EMIT();
};
function createTransformerMap(values) {
    return new Map(values);
}
const TRANSFORMER_BY_KIND = createTransformerMap([
    [typescript_1.default.SyntaxKind.BigIntLiteral, DIAGNOSTIC(diagnostics_1.errors.noBigInt)],
    [typescript_1.default.SyntaxKind.NullKeyword, DIAGNOSTIC(diagnostics_1.errors.noNullLiteral)],
    [typescript_1.default.SyntaxKind.PrivateIdentifier, DIAGNOSTIC(diagnostics_1.errors.noPrivateIdentifier)],
    [typescript_1.default.SyntaxKind.RegularExpressionLiteral, DIAGNOSTIC(diagnostics_1.errors.noRegex)],
    [typescript_1.default.SyntaxKind.TypeOfExpression, DIAGNOSTIC(diagnostics_1.errors.noTypeOfExpression)],
    [typescript_1.default.SyntaxKind.ImportKeyword, NO_EMIT],
    [typescript_1.default.SyntaxKind.ArrayLiteralExpression, transformArrayLiteralExpression_1.transformArrayLiteralExpression],
    [typescript_1.default.SyntaxKind.ArrowFunction, transformFunctionExpression_1.transformFunctionExpression],
    [typescript_1.default.SyntaxKind.AsExpression, transformTypeExpression_1.transformTypeExpression],
    [typescript_1.default.SyntaxKind.AwaitExpression, transformAwaitExpression_1.transformAwaitExpression],
    [typescript_1.default.SyntaxKind.BinaryExpression, transformBinaryExpression_1.transformBinaryExpression],
    [typescript_1.default.SyntaxKind.CallExpression, transformCallExpression_1.transformCallExpression],
    [typescript_1.default.SyntaxKind.ClassExpression, transformClassExpression_1.transformClassExpression],
    [typescript_1.default.SyntaxKind.ConditionalExpression, transformConditionalExpression_1.transformConditionalExpression],
    [typescript_1.default.SyntaxKind.DeleteExpression, transformDeleteExpression_1.transformDeleteExpression],
    [typescript_1.default.SyntaxKind.ElementAccessExpression, transformElementAccessExpression_1.transformElementAccessExpression],
    [typescript_1.default.SyntaxKind.ExpressionWithTypeArguments, transformTypeExpression_1.transformTypeExpression],
    [typescript_1.default.SyntaxKind.FalseKeyword, transformBooleanLiteral_1.transformFalseKeyword],
    [typescript_1.default.SyntaxKind.FunctionExpression, transformFunctionExpression_1.transformFunctionExpression],
    [typescript_1.default.SyntaxKind.Identifier, transformIdentifier_1.transformIdentifier],
    [typescript_1.default.SyntaxKind.JsxElement, transformJsxElement_1.transformJsxElement],
    [typescript_1.default.SyntaxKind.JsxExpression, transformJsxExpression_1.transformJsxExpression],
    [typescript_1.default.SyntaxKind.JsxFragment, transformJsxFragment_1.transformJsxFragment],
    [typescript_1.default.SyntaxKind.JsxSelfClosingElement, transformJsxSelfClosingElement_1.transformJsxSelfClosingElement],
    [typescript_1.default.SyntaxKind.NewExpression, transformNewExpression_1.transformNewExpression],
    [typescript_1.default.SyntaxKind.NonNullExpression, transformTypeExpression_1.transformTypeExpression],
    [typescript_1.default.SyntaxKind.NoSubstitutionTemplateLiteral, transformNoSubstitutionTemplateLiteral_1.transformNoSubstitutionTemplateLiteral],
    [typescript_1.default.SyntaxKind.NumericLiteral, transformNumericLiteral_1.transformNumericLiteral],
    [typescript_1.default.SyntaxKind.ObjectLiteralExpression, transformObjectLiteralExpression_1.transformObjectLiteralExpression],
    [typescript_1.default.SyntaxKind.OmittedExpression, transformOmittedExpression_1.transformOmittedExpression],
    [typescript_1.default.SyntaxKind.ParenthesizedExpression, transformParenthesizedExpression_1.transformParenthesizedExpression],
    [typescript_1.default.SyntaxKind.PostfixUnaryExpression, transformUnaryExpression_1.transformPostfixUnaryExpression],
    [typescript_1.default.SyntaxKind.PrefixUnaryExpression, transformUnaryExpression_1.transformPrefixUnaryExpression],
    [typescript_1.default.SyntaxKind.PropertyAccessExpression, transformPropertyAccessExpression_1.transformPropertyAccessExpression],
    [typescript_1.default.SyntaxKind.SatisfiesExpression, transformTypeExpression_1.transformTypeExpression],
    [typescript_1.default.SyntaxKind.SpreadElement, transformSpreadElement_1.transformSpreadElement],
    [typescript_1.default.SyntaxKind.StringLiteral, transformStringLiteral_1.transformStringLiteral],
    [typescript_1.default.SyntaxKind.SuperKeyword, transformSuperKeyword_1.transformSuperKeyword],
    [typescript_1.default.SyntaxKind.TaggedTemplateExpression, transformTaggedTemplateExpression_1.transformTaggedTemplateExpression],
    [typescript_1.default.SyntaxKind.TemplateExpression, transformTemplateExpression_1.transformTemplateExpression],
    [typescript_1.default.SyntaxKind.ThisKeyword, transformThisExpression_1.transformThisExpression],
    [typescript_1.default.SyntaxKind.TrueKeyword, transformBooleanLiteral_1.transformTrueKeyword],
    [typescript_1.default.SyntaxKind.TypeAssertionExpression, transformTypeExpression_1.transformTypeExpression],
    [typescript_1.default.SyntaxKind.VoidExpression, transformVoidExpression_1.transformVoidExpression],
    [typescript_1.default.SyntaxKind.YieldExpression, transformYieldExpression_1.transformYieldExpression],
]);
function transformExpression(state, node) {
    const transformer = TRANSFORMER_BY_KIND.get(node.kind);
    if (transformer) {
        return transformer(state, node);
    }
    (0, assert_1.assert)(false, `Unknown expression: ${(0, getKindName_1.getKindName)(node.kind)}`);
}
//# sourceMappingURL=transformExpression.js.map