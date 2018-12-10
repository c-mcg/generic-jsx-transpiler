"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QUOTE_TYPE_FROM_CHAR = exports.QUOTE_CHAR = exports.QUOTE_TYPE = exports.NUM_ERROR_CONTEXT_LINES = void 0;

var _Util = require("./Util");

var _QUOTE_CHAR;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var NUM_ERROR_CONTEXT_LINES = 1;
exports.NUM_ERROR_CONTEXT_LINES = NUM_ERROR_CONTEXT_LINES;
var QUOTE_TYPE = (0, _Util.enumerate)('NONE', 'DOUBLE', 'SINGLE', 'BACKTICK');
exports.QUOTE_TYPE = QUOTE_TYPE;
var QUOTE_CHAR = (_QUOTE_CHAR = {}, _defineProperty(_QUOTE_CHAR, QUOTE_TYPE.DOUBLE, '"'), _defineProperty(_QUOTE_CHAR, QUOTE_TYPE.SINGLE, "'"), _defineProperty(_QUOTE_CHAR, QUOTE_TYPE.BACKTICK, "`"), _QUOTE_CHAR);
exports.QUOTE_CHAR = QUOTE_CHAR;
var QUOTE_TYPE_FROM_CHAR = Object.keys(QUOTE_CHAR).reduce(function (acc, key) {
  acc[QUOTE_CHAR[key]] = key;
  return acc;
}, {});
exports.QUOTE_TYPE_FROM_CHAR = QUOTE_TYPE_FROM_CHAR;