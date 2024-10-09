import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformConditionalExpression(state: TransformState, node: ts.ConditionalExpression): luau.TemporaryIdentifier | luau.None | luau.IfExpression;