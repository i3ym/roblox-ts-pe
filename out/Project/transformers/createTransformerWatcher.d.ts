/// <reference types="ts-expose-internals/typescript" />
import { TransformerWatcher } from "../../Shared/types";
import ts from "typescript";
export declare function createTransformerWatcher(program: ts.Program): TransformerWatcher;
