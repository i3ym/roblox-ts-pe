/// <reference types="ts-expose-internals/typescript" />
import ts from "typescript";
export declare const normalizePath: (p: string) => string;
export declare const transformPaths: (context: ts.TransformationContext) => (sourceFile: ts.SourceFile | ts.Bundle) => ts.SourceFile;
