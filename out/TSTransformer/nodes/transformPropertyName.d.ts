/// <reference types="ts-expose-internals/typescript" />
import luau from "@roblox-ts/luau-ast";
import { TransformState } from "..";
import ts from "typescript";
export declare function transformPropertyName(state: TransformState, name: ts.PropertyName): luau.Expression<luau.SyntaxKind>;
