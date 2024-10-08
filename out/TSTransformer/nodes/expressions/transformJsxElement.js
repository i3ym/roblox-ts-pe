"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformJsxElement = transformJsxElement;
const transformJsx_1 = require("../jsx/transformJsx");
function transformJsxElement(state, node) {
    return (0, transformJsx_1.transformJsx)(state, node, node.openingElement.tagName, node.openingElement.attributes, node.children);
}
//# sourceMappingURL=transformJsxElement.js.map