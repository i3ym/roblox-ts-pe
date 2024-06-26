"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectAccessor = void 0;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
const diagnostics_1 = require("../../../Shared/diagnostics");
const DiagnosticService_1 = require("../../classes/DiagnosticService");
const transformExpression_1 = require("../../nodes/expressions/transformExpression");
const addIndexDiagnostics_1 = require("../addIndexDiagnostics");
const addOneIfArrayType_1 = require("../addOneIfArrayType");
const assertNever_1 = require("../assertNever");
const typescript_1 = __importDefault(require("typescript"));
const objectAccessor = (state, parentId, type, name) => {
    (0, addIndexDiagnostics_1.addIndexDiagnostics)(state, name, state.getType(name));
    if (typescript_1.default.isIdentifier(name)) {
        return luau_ast_1.default.property(parentId, name.text);
    }
    else if (typescript_1.default.isComputedPropertyName(name)) {
        return luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
            expression: parentId,
            index: (0, addOneIfArrayType_1.addOneIfArrayType)(state, type, (0, transformExpression_1.transformExpression)(state, name.expression)),
        });
    }
    else if (typescript_1.default.isNumericLiteral(name) || typescript_1.default.isStringLiteral(name) || typescript_1.default.isNoSubstitutionTemplateLiteral(name)) {
        return luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
            expression: parentId,
            index: (0, transformExpression_1.transformExpression)(state, name),
        });
    }
    else if (typescript_1.default.isPrivateIdentifier(name)) {
        DiagnosticService_1.DiagnosticService.addDiagnostic(diagnostics_1.errors.noPrivateIdentifier(name));
        return luau_ast_1.default.none();
    }
    return (0, assertNever_1.assertNever)(name, "objectAccessor");
};
exports.objectAccessor = objectAccessor;
//# sourceMappingURL=objectAccessor.js.map