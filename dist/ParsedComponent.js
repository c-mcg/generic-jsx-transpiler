"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ComponentProps = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ComponentProps =
/*#__PURE__*/
function () {
  function ComponentProps(props) {
    _classCallCheck(this, ComponentProps);

    this.props = props;
  }

  _createClass(ComponentProps, [{
    key: "toJS",
    value: function toJS() {
      return JSON.stringify(this.props);
    }
  }]);

  return ComponentProps;
}();

exports.ComponentProps = ComponentProps;

var ParsedComponent =
/*#__PURE__*/
function () {
  function ParsedComponent(_ref) {
    var _this = this;

    var tag = _ref.tag,
        _ref$props = _ref.props,
        props = _ref$props === void 0 ? null : _ref$props,
        _ref$parent = _ref.parent,
        parent = _ref$parent === void 0 ? null : _ref$parent,
        _ref$children = _ref.children,
        children = _ref$children === void 0 ? [] : _ref$children;

    _classCallCheck(this, ParsedComponent);

    this.tag = tag;
    this.props = new ComponentProps(props);
    this.parent = parent;
    this.children = children;
    children.forEach(function (child) {
      return child.parent = _this;
    });
  }

  _createClass(ParsedComponent, [{
    key: "toJS",
    value: function toJS() {
      var childrenJS = this.children.reduce(function (acc, child) {
        acc += "".concat(child.toJS());
        return acc;
      }, "");
      return "(() => {return {\n            tag: \"".concat(this.tag, "\",\n            props: ").concat(this.props.toJS(), ",\n            children: [").concat(childrenJS, "],\n        }})()");
    }
  }]);

  return ParsedComponent;
}();

exports.default = ParsedComponent;