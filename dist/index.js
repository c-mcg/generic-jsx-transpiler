"use strict";

var _Parser = _interopRequireDefault(require("./Parser"));

var _AbstractSerializer = _interopRequireDefault(require("./AbstractSerializer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jsxTranspiler = {
  Parser: _Parser.default,
  AbstractSerializer: _AbstractSerializer.default
};
exports.default = jsxTranspiler;