"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeArguments = exports.getFirstDefinedSymbol = exports.getFirstConstructSymbol = exports.walkTypes = exports.isRobloxType = exports.isEmptyStringType = exports.isUndefinedType = exports.isObjectType = exports.isIterableType = exports.isIterableFunctionLuaTupleType = exports.isLuaTupleType = exports.isIterableFunctionType = exports.isGeneratorType = exports.isMapType = exports.isSetType = exports.isArrayType = exports.isStringType = exports.isNaNType = exports.isNumberLiteralType = exports.isNumberType = exports.isBooleanLiteralType = exports.isBooleanType = exports.isAnyType = exports.isDefinedType = exports.isPossiblyType = exports.isDefinitelyType = void 0;
const path_1 = __importDefault(require("path"));
const constants_1 = require("../../Shared/constants");
const isPathDescendantOf_1 = require("../../Shared/util/isPathDescendantOf");
const TSTransformer_1 = require("..");
const MacroManager_1 = require("../classes/MacroManager");
const typeGuards_1 = require("../typeGuards");
const typescript_1 = __importDefault(require("typescript"));
function getRecursiveBaseTypesInner(result, type) {
    var _a;
    for (const baseType of (_a = type.getBaseTypes()) !== null && _a !== void 0 ? _a : []) {
        result.push(baseType);
        if (baseType.isClassOrInterface()) {
            getRecursiveBaseTypesInner(result, baseType);
        }
    }
}
function getRecursiveBaseTypes(type) {
    const result = new Array();
    getRecursiveBaseTypesInner(result, type);
    return result;
}
function isDefinitelyTypeInner(type, callbacks) {
    if (type.isUnion()) {
        return type.types.every(t => isDefinitelyTypeInner(t, callbacks));
    }
    else if (type.isIntersection()) {
        return type.types.some(t => isDefinitelyTypeInner(t, callbacks));
    }
    else {
        if (type.isClassOrInterface() && getRecursiveBaseTypes(type).some(t => isDefinitelyTypeInner(t, callbacks))) {
            return true;
        }
        return callbacks.some(cb => cb(type));
    }
}
function isDefinitelyType(type, ...callbacks) {
    var _a;
    return isDefinitelyTypeInner((_a = type.getConstraint()) !== null && _a !== void 0 ? _a : type, callbacks);
}
exports.isDefinitelyType = isDefinitelyType;
function isPossiblyTypeInner(type, callbacks) {
    if (type.isUnionOrIntersection()) {
        return type.types.some(t => isPossiblyTypeInner(t, callbacks));
    }
    else {
        if (type.isClassOrInterface() && getRecursiveBaseTypes(type).some(t => isPossiblyTypeInner(t, callbacks))) {
            return true;
        }
        if (!!(type.flags & (typescript_1.default.TypeFlags.TypeVariable | typescript_1.default.TypeFlags.AnyOrUnknown))) {
            return true;
        }
        if (isDefinedType(type)) {
            if (callbacks.length === 1 && callbacks[0] === isUndefinedType) {
                return false;
            }
            return true;
        }
        return callbacks.some(cb => cb(type));
    }
}
function isPossiblyType(type, ...callbacks) {
    var _a;
    return isPossiblyTypeInner((_a = type.getConstraint()) !== null && _a !== void 0 ? _a : type, callbacks);
}
exports.isPossiblyType = isPossiblyType;
function isDefinedType(type) {
    return (type.flags === typescript_1.default.TypeFlags.Object &&
        type.getProperties().length === 0 &&
        type.getCallSignatures().length === 0 &&
        type.getConstructSignatures().length === 0 &&
        type.getNumberIndexType() === undefined &&
        type.getStringIndexType() === undefined);
}
exports.isDefinedType = isDefinedType;
function isAnyType(state) {
    return type => type === state.typeChecker.getAnyType();
}
exports.isAnyType = isAnyType;
function isBooleanType(type) {
    return !!(type.flags & (typescript_1.default.TypeFlags.Boolean | typescript_1.default.TypeFlags.BooleanLiteral));
}
exports.isBooleanType = isBooleanType;
function isBooleanLiteralType(state, value) {
    return type => {
        if (!!(type.flags & typescript_1.default.TypeFlags.BooleanLiteral)) {
            const valueType = value ? state.typeChecker.getTrueType() : state.typeChecker.getFalseType();
            return type === valueType;
        }
        return isBooleanType(type);
    };
}
exports.isBooleanLiteralType = isBooleanLiteralType;
function isNumberType(type) {
    return !!(type.flags & (typescript_1.default.TypeFlags.Number | typescript_1.default.TypeFlags.NumberLike | typescript_1.default.TypeFlags.NumberLiteral));
}
exports.isNumberType = isNumberType;
function isNumberLiteralType(value) {
    return type => {
        if (type.isNumberLiteral()) {
            return type.value === value;
        }
        return isNumberType(type);
    };
}
exports.isNumberLiteralType = isNumberLiteralType;
function isNaNType(type) {
    return isNumberType(type) && !type.isNumberLiteral();
}
exports.isNaNType = isNaNType;
function isStringType(type) {
    return !!(type.flags & (typescript_1.default.TypeFlags.String | typescript_1.default.TypeFlags.StringLike | typescript_1.default.TypeFlags.StringLiteral));
}
exports.isStringType = isStringType;
function isArrayType(state) {
    return type => {
        if (!!(type.flags & typescript_1.default.TypeFlags.Any)) {
            return false;
        }
        return (state.typeChecker.isTupleType(type) ||
            state.typeChecker.isArrayLikeType(type) ||
            type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.ReadonlyArray) ||
            type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.Array) ||
            type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.ReadVoxelsArray) ||
            type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.TemplateStringsArray));
    };
}
exports.isArrayType = isArrayType;
function isSetType(state) {
    return type => type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.Set) ||
        type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.ReadonlySet) ||
        type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.WeakSet);
}
exports.isSetType = isSetType;
function isMapType(state) {
    return type => type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.Map) ||
        type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.ReadonlyMap) ||
        type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.WeakMap);
}
exports.isMapType = isMapType;
function isGeneratorType(state) {
    return type => type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.Generator);
}
exports.isGeneratorType = isGeneratorType;
function isIterableFunctionType(state) {
    return type => type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.IterableFunction);
}
exports.isIterableFunctionType = isIterableFunctionType;
function isLuaTupleType(state) {
    return type => type.getProperty(MacroManager_1.NOMINAL_LUA_TUPLE_NAME) ===
        state.services.macroManager.getSymbolOrThrow(MacroManager_1.NOMINAL_LUA_TUPLE_NAME);
}
exports.isLuaTupleType = isLuaTupleType;
function isIterableFunctionLuaTupleType(state) {
    return type => {
        if (isIterableFunctionType(state)(type)) {
            const firstTypeArg = getTypeArguments(state, type)[0];
            return firstTypeArg !== undefined && isLuaTupleType(state)(firstTypeArg);
        }
        return false;
    };
}
exports.isIterableFunctionLuaTupleType = isIterableFunctionLuaTupleType;
function isIterableType(state) {
    return type => type.symbol === state.services.macroManager.getSymbolOrThrow(TSTransformer_1.SYMBOL_NAMES.Iterable);
}
exports.isIterableType = isIterableType;
function isObjectType(type) {
    return !!(type.flags & typescript_1.default.TypeFlags.Object);
}
exports.isObjectType = isObjectType;
function isUndefinedType(type) {
    return !!(type.flags & (typescript_1.default.TypeFlags.Undefined | typescript_1.default.TypeFlags.Void));
}
exports.isUndefinedType = isUndefinedType;
function isEmptyStringType(type) {
    if (type.isStringLiteral()) {
        return type.value === "";
    }
    if ((0, typeGuards_1.isTemplateLiteralType)(type)) {
        return type.texts.length === 0 || type.texts.every(v => v.length === 0);
    }
    return isStringType(type);
}
exports.isEmptyStringType = isEmptyStringType;
function isRobloxType(state) {
    const typesPath = path_1.default.join(state.data.nodeModulesPath, constants_1.RBXTS_SCOPE, "types");
    return type => {
        var _a, _b, _c;
        return (_c = (_b = (_a = type.symbol) === null || _a === void 0 ? void 0 : _a.declarations) === null || _b === void 0 ? void 0 : _b.some(d => {
            var _a;
            const filePath = (_a = d.getSourceFile()) === null || _a === void 0 ? void 0 : _a.fileName;
            return filePath !== undefined && (0, isPathDescendantOf_1.isPathDescendantOf)(filePath, typesPath);
        })) !== null && _c !== void 0 ? _c : false;
    };
}
exports.isRobloxType = isRobloxType;
function walkTypes(type, callback) {
    if (type.isUnionOrIntersection()) {
        for (const t of type.types) {
            walkTypes(t, callback);
        }
    }
    else {
        const constraint = type.getConstraint();
        if (constraint && constraint !== type) {
            walkTypes(constraint, callback);
        }
        else {
            callback(type);
        }
    }
}
exports.walkTypes = walkTypes;
function getFirstConstructSymbol(state, expression) {
    const type = state.getType(expression);
    if (type.symbol) {
        const declarations = type.symbol.getDeclarations();
        if (declarations) {
            for (const declaration of declarations) {
                if (typescript_1.default.isInterfaceDeclaration(declaration)) {
                    for (const member of declaration.members) {
                        if (typescript_1.default.isConstructSignatureDeclaration(member)) {
                            return member.symbol;
                        }
                    }
                }
            }
        }
    }
}
exports.getFirstConstructSymbol = getFirstConstructSymbol;
function getFirstDefinedSymbol(state, type) {
    if (type.isUnionOrIntersection()) {
        for (const t of type.types) {
            if (t.symbol && !state.typeChecker.isUndefinedSymbol(t.symbol)) {
                return t.symbol;
            }
        }
    }
    else {
        return type.symbol;
    }
}
exports.getFirstDefinedSymbol = getFirstDefinedSymbol;
function getTypeArguments(state, type) {
    var _a;
    return (_a = state.typeChecker.getTypeArguments(type)) !== null && _a !== void 0 ? _a : [];
}
exports.getTypeArguments = getTypeArguments;
//# sourceMappingURL=types.js.map