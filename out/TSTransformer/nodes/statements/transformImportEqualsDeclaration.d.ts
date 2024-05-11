/// <reference types="ts-expose-internals/typescript" />
import luau from "@roblox-ts/luau-ast";
import { TransformState } from "../..";
import ts from "typescript";
export declare function transformImportEqualsDeclaration(state: TransformState, node: ts.ImportEqualsDeclaration): luau.List<luau.Statement<luau.SyntaxKind>>;
