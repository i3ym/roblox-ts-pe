"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransformServices = void 0;
const TSTransformer_1 = require("..");
function createTransformServices(typeChecker) {
    const macroManager = new TSTransformer_1.MacroManager(typeChecker);
    return { macroManager };
}
exports.createTransformServices = createTransformServices;
//# sourceMappingURL=createTransformServices.js.map