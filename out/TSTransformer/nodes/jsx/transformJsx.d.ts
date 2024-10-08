import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformJsx(state: TransformState, node: ts.JsxElement | ts.JsxSelfClosingElement, tagName: ts.JsxTagNameExpression, attributes: ts.JsxAttributes, children: ReadonlyArray<ts.JsxChild>): luau.CallExpression;
