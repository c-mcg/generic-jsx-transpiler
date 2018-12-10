"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EvaluatedProp = exports.Prop = void 0;

var _os = require("os");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Prop =
/*#__PURE__*/
function () {
  function Prop(value) {
    _classCallCheck(this, Prop);

    this._value = value;
  }

  _createClass(Prop, [{
    key: "toJS",
    value: function toJS() {
      return JSON.stringify(this._value);
    }
  }]);

  return Prop;
}();

exports.Prop = Prop;

var EvaluatedProp =
/*#__PURE__*/
function () {
  function EvaluatedProp(source) {
    _classCallCheck(this, EvaluatedProp);

    this._source = source;
  }

  _createClass(EvaluatedProp, [{
    key: "toJS",
    value: function toJS() {
      return "(() => {return (".concat(this._source, ")})()");
    }
  }]);

  return EvaluatedProp;
}();

exports.EvaluatedProp = EvaluatedProp;