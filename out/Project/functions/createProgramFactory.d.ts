/// <reference types="ts-expose-internals/typescript" />
import { ProjectData } from "..";
import ts from "typescript";
export declare function createProgramFactory(data: ProjectData, options: ts.CompilerOptions): ts.CreateProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram>;
