/// <reference types="ts-expose-internals/typescript" />
import { TransformState } from "..";
import ts from "typescript";
export declare function validateMethodAssignment(state: TransformState, node: ts.ObjectLiteralElementLike | ts.ClassElement): void;
