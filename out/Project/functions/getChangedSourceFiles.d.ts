/// <reference types="ts-expose-internals/typescript" />
import ts from "typescript";
export declare function getChangedSourceFiles(program: ts.BuilderProgram, pathHints?: Array<string>): ts.SourceFile[];
