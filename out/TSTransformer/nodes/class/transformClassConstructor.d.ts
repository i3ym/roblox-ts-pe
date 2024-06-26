/// <reference types="ts-expose-internals/typescript" />
import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformClassConstructor(state: TransformState, node: ts.ClassLikeDeclaration, name: luau.AnyIdentifier, originNode?: ts.ConstructorDeclaration & {
    body: ts.Block;
}): luau.List<luau.Statement<luau.SyntaxKind>>;
