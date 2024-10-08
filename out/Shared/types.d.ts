import { ProjectType } from "./constants";
import ts from "typescript";
export interface ProjectOptions {
    includePath: string;
    rojo: string | undefined;
    type: ProjectType | undefined;
    logTruthyChanges: boolean;
    noInclude: boolean;
    usePolling: boolean;
    verbose: boolean;
    watch: boolean;
    writeOnlyChanged: boolean;
    writeTransformedFiles: boolean;
    optimizedLoops: boolean;
    allowCommentDirectives: boolean;
    luau: boolean;
}
export interface ProjectData {
    isPackage: boolean;
    nodeModulesPath: string;
    projectOptions: ProjectOptions;
    projectPath: string;
    rojoConfigPath: string | undefined;
    tsConfigPath: string;
    transformerWatcher?: TransformerWatcher;
}
export interface TransformerWatcher {
    service: ts.LanguageService;
    updateFile: (fileName: string, text: string) => void;
}
export interface TransformerPluginConfig {
    transform?: string;
    import?: string;
    type?: "program" | "config" | "checker" | "raw" | "compilerOptions";
    after?: boolean;
    afterDeclarations?: boolean;
    [options: string]: unknown;
}
export interface SourceFileWithTextRange {
    sourceFile: ts.SourceFile;
    range: ts.ReadonlyTextRange;
}
