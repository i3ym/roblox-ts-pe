/// <reference types="ts-expose-internals/typescript" />
import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformConditionalExpression(state: TransformState, node: ts.ConditionalExpression): luau.None | luau.TemporaryIdentifier | luau.IfExpression;
