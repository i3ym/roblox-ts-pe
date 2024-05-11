/// <reference types="ts-expose-internals/typescript" />
import ts from "typescript";
export declare function getDeclaredVariables(node: ts.VariableDeclarationList | ts.VariableDeclaration): ts.Identifier[];
