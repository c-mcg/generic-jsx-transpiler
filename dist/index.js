"use strict";

var _Parser = _interopRequireDefault(require("./Parser"));

var _DefaultSerializer = _interopRequireDefault(require("./DefaultSerializer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsxTranspiler = {
  Parser: _Parser.default,
  DefaultSerializer: _DefaultSerializer.default
};
exports.default = jsxTranspiler;