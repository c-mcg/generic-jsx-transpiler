"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enumerate = enumerate;
exports.throwError = throwError;
exports.isNumber = isNumber;
exports.isAlpha = isAlpha;
exports.isWhitespace = isWhitespace;
exports.JSXError = void 0;

var _Constants = require("./Constants");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function enumerate() {
  return Array.prototype.slice.call(arguments).reduce(function (acc, item, index) {
    acc[item] = index;
    return acc;
  }, {});
}

;

var JSXError =
/*#__PURE__*/
function (_Error) {
  _inherits(JSXError, _Error);

  function JSXError() {
    _classCallCheck(this, JSXError);

    return _possibleConstructorReturn(this, _getPrototypeOf(JSXError).apply(this, arguments));
  }

  return JSXError;
}(_wrapNativeSuper(Error));

exports.JSXError = JSXError;

function throwError(message, sourceString, index) {
  var previousLines = sourceString.substring(0, index).split('\n');
  var lineIndex = previousLines.length - 1;
  var lineNumber = lineIndex + 1;
  var colNumber = previousLines[previousLines.length - 1].length;
  var lines = sourceString.split('\n').map(function (line) {
    return "    ".concat(line.trim());
  });
  var contextString = "".concat(lines[lineIndex], "\n").concat(' '.repeat(colNumber - 1), "^^^"); //  Add previous lines

  for (var i = 1; i <= _Constants.NUM_ERROR_CONTEXT_LINES; i++) {
    contextString = "".concat(lines[lineIndex - i], "\n").concat(contextString);
  } // Add following lines


  for (var _i = 1; _i <= _Constants.NUM_ERROR_CONTEXT_LINES; _i++) {
    contextString = "".concat(contextString, "\n").concat(lines[lineIndex + _i]);
  }

  throw new JSXError("Error ".concat(message, " on line ").concat(lineNumber, " at index ").concat(colNumber, ":\n").concat(contextString));
}

function isNumber(str) {
  return !isNaN(str);
}

function isAlpha(str) {
  return str.toLowerCase() != str.toUpperCase();
}

function isWhitespace(str) {
  return str.trim() === "";
}