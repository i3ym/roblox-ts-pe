"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disableArrayInline = exports.disableMapInline = exports.assignToMapPointer = exports.createArrayPointer = exports.createMapPointer = void 0;
const luau_ast_1 = __importDefault(require("@roblox-ts/luau-ast"));
function createMapPointer(name) {
    return { name, value: luau_ast_1.default.map() };
}
exports.createMapPointer = createMapPointer;
function createArrayPointer(name) {
    return { name, value: luau_ast_1.default.array() };
}
exports.createArrayPointer = createArrayPointer;
function assignToMapPointer(state, ptr, left, right) {
    if (luau_ast_1.default.isMap(ptr.value)) {
        luau_ast_1.default.list.push(ptr.value.fields, luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.MapField, {
            index: left,
            value: right,
        }));
    }
    else {
        state.prereq(luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.Assignment, {
            left: luau_ast_1.default.create(luau_ast_1.default.SyntaxKind.ComputedIndexExpression, {
                expression: ptr.value,
                index: left,
            }),
            operator: "=",
            right,
        }));
    }
}
exports.assignToMapPointer = assignToMapPointer;
function disableMapInline(state, ptr) {
    if (luau_ast_1.default.isMap(ptr.value)) {
        ptr.value = state.pushToVar(ptr.value, ptr.name);
    }
}
exports.disableMapInline = disableMapInline;
function disableArrayInline(state, ptr) {
    if (luau_ast_1.default.isArray(ptr.value)) {
        ptr.value = state.pushToVar(ptr.value, ptr.name);
    }
}
exports.disableArrayInline = disableArrayInline;
//# sourceMappingURL=pointer.js.map