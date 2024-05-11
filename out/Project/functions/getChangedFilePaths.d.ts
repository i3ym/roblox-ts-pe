/// <reference types="ts-expose-internals/typescript" />
import ts from "typescript";
export declare function getChangedFilePaths(program: ts.BuilderProgram, pathHints?: Array<string>): Set<string>;
