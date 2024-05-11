/// <reference types="ts-expose-internals/typescript" />
import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformArrayLiteralExpression(state: TransformState, node: ts.ArrayLiteralExpression): luau.TemporaryIdentifier | luau.Array;
