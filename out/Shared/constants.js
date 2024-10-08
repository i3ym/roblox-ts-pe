"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PROJECT_OPTIONS = exports.ProjectType = exports.PARENT_FIELD = exports.FILENAME_WARNINGS = exports.MODULE_SUBEXT = exports.CLIENT_SUBEXT = exports.SERVER_SUBEXT = exports.INIT_NAME = exports.INDEX_NAME = exports.DTS_EXT = exports.D_EXT = exports.TSX_EXT = exports.TS_EXT = exports.RBXTS_SCOPE = exports.NODE_MODULES = exports.COMPILER_VERSION = exports.INCLUDE_PATH = exports.PACKAGE_ROOT = void 0;
const path_1 = __importDefault(require("path"));
exports.PACKAGE_ROOT = path_1.default.join(__dirname, "..", "..");
exports.INCLUDE_PATH = path_1.default.join(exports.PACKAGE_ROOT, "include");
exports.COMPILER_VERSION = require("../../package.json").version;
exports.NODE_MODULES = "node_modules";
exports.RBXTS_SCOPE = "@rbxts";
exports.TS_EXT = ".ts";
exports.TSX_EXT = ".tsx";
exports.D_EXT = ".d";
exports.DTS_EXT = exports.D_EXT + exports.TS_EXT;
exports.INDEX_NAME = "index";
exports.INIT_NAME = "init";
exports.SERVER_SUBEXT = ".server";
exports.CLIENT_SUBEXT = ".client";
exports.MODULE_SUBEXT = "";
exports.FILENAME_WARNINGS = new Map();
for (const scriptType of [exports.SERVER_SUBEXT, exports.CLIENT_SUBEXT, exports.MODULE_SUBEXT]) {
    for (const fileType of [exports.TS_EXT, exports.TSX_EXT, exports.DTS_EXT]) {
        exports.FILENAME_WARNINGS.set(exports.INIT_NAME + scriptType + fileType, exports.INDEX_NAME + scriptType + fileType);
    }
}
exports.PARENT_FIELD = "Parent";
var ProjectType;
(function (ProjectType) {
    ProjectType["Game"] = "game";
    ProjectType["Model"] = "model";
    ProjectType["Package"] = "package";
})(ProjectType || (exports.ProjectType = ProjectType = {}));
exports.DEFAULT_PROJECT_OPTIONS = {
    includePath: "",
    rojo: undefined,
    type: undefined,
    watch: false,
    usePolling: false,
    verbose: false,
    noInclude: false,
    logTruthyChanges: false,
    writeOnlyChanged: false,
    writeTransformedFiles: false,
    optimizedLoops: true,
    allowCommentDirectives: false,
    luau: true,
};
//# sourceMappingURL=constants.js.map