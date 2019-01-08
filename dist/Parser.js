"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _Util = require("./util/Util");

var _Constants = require("./util/Constants");

var _DefaultSerializer = _interopRequireDefault(require("./DefaultSerializer"));

var _ParsedProp = require("./ParsedProp");

var _ParsedComponent = _interopRequireDefault(require("./ParsedComponent"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Parser =
/*#__PURE__*/
function () {
  function Parser() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$serializer = _ref.serializer,
        serializer = _ref$serializer === void 0 ? new _DefaultSerializer.default() : _ref$serializer;

    _classCallCheck(this, Parser);

    // this.source = source;//
    this.serializer = serializer;
    this.source = null;
    this.newSource = "";
    this.started = false;
    this.promise = null;
    this.currentIndex = 0;
    this._ignoreErrors = false;
    this.resetStateProperties();
    this.setState(STATE.NONE);
  }

  _createClass(Parser, [{
    key: "resetStateProperties",
    value: function resetStateProperties() {
      if (this.currComponent) {
        this.lastComponent = this.currComponent;
      }

      this.currComponent = null;
      this.assignQuotesTo = 'newSource';
      this.quoteReturnStateQueue = [];
      this.QUOTE_TYPE = _Constants.QUOTE_TYPE.NONE;
      this.nextCharEscaped = false;
      this.foundDollarSignInQuotes = false;
      this.numOpenBlocks = 0;
      this.currTag = "";
      this.currProps = {};
      this.foundClosingTagSlash = false;
      this.currTagEndsWithSlash = false;
      this.currTagLeadsWithSlash = false;
      this.currPropName = "";
      this.foundClosingTagSlash = false;
      this.currString = ""; // TODO rename this

      this.lastCharWasWhitespace = false;
      this.currPropValue = "";
    }
  }, {
    key: "addCharToQuoteVar",
    value: function addCharToQuoteVar(c) {
      this[this.assignQuotesTo] += c;
    }
  }, {
    key: "ignoreErrors",
    value: function ignoreErrors() {
      this._ignoreErrors = true;
      return this;
    }
  }, {
    key: "setState",
    value: function setState(state) {
      var initAll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      state[initAll ? 'initAll' : 'init'](this);
      this.state = state;
    }
  }, {
    key: "onFoundComponentTree",
    value: function onFoundComponentTree() {
      this.newSource += this.serializer.serialize(this.currComponent);
      this.setState(STATE.NONE);
    }
  }, {
    key: "onFoundTag",
    value: function onFoundTag() {
      //TODO split into smaller functions
      if (this.currTagLeadsWithSlash) {
        // closing tag
        this.closeCurrentComponent();
      } else if (this.currTagEndsWithSlash) {
        // self closing tag
        this.addSelfClosingComponent();
      } else {
        // An openening tag
        this.addOpenComponent();
      }
    }
  }, {
    key: "createComponent",
    value: function createComponent() {
      return new _ParsedComponent.default({
        tag: this.currTag,
        props: Object.keys(this.currProps).length === 0 ? null : this.currProps,
        parent: this.currComponent
      });
    }
  }, {
    key: "addOpenComponent",
    value: function addOpenComponent() {
      this.currComponent = this.createComponent();
      this.setState(STATE.LOOKING_FOR_MARKUP);
    }
  }, {
    key: "closeCurrentComponent",
    value: function closeCurrentComponent() {
      if (this.currComponent.parent) {
        this.currComponent.parent.children.push(this.currComponent);
        this.currComponent = this.currComponent.parent;
        this.setState(STATE.LOOKING_FOR_MARKUP);
      } else {
        this.onFoundComponentTree();
      }
    }
  }, {
    key: "addSelfClosingComponent",
    value: function addSelfClosingComponent() {
      var component = this.createComponent();

      if (this.currComponent) {
        this.currComponent.children.push(component);
        this.setState(STATE.LOOKING_FOR_MARKUP);
      } else {
        this.currComponent = component;
        this.onFoundComponentTree();
      }
    }
  }, {
    key: "loadFile",
    value: function loadFile(path) {
      return _fs.default.readFileSync(path, {
        encoding: 'utf8'
      });
    }
  }, {
    key: "saveToFile",
    value: function saveToFile(path) {
      return _fs.default.writeFileSync(path, this.newSource);
    } //TODO support file path

  }, {
    key: "parse",
    value: function parse(_ref2) {
      var _this = this;

      var inputPath = _ref2.inputPath,
          source = _ref2.source,
          outputPath = _ref2.outputPath,
          _ref2$async = _ref2.async,
          async = _ref2$async === void 0 ? false : _ref2$async;

      this.source = function () {
        if (source) {
          return source;
        }

        if (!inputPath) {
          throw new Error("You must specify source to parse via 'inputPath' or 'source' params");
        }

        return _this.loadFile(inputPath);
      }();

      var createImports = this.serializer.createImports;
      this.newSource = createImports ? createImports() : "";

      if (this.newSource) {
        this.newSource += "\n";
      }

      if (this.started) {
        throw new Error("\"start\" method can only be called once on Parser.");
      }

      this.started = true;

      var start = function start(resolve, reject) {
        _toConsumableArray(_this.source).forEach(function (c, index) {
          _this.currentIndex = index;

          _this.state.handleState(c, _this);
        });

        if (resolve) {
          resolve(_this.newSource);
          return;
        }

        if (outputPath) {
          _this.saveToFile(outputPath);
        }

        return _this.newSource;
      };

      if (async) {
        this.promise = new Promise(start);
      } else {
        return start();
      }

      return this.promise;
    }
  }, {
    key: "throwError",
    value: function throwError(message) {
      if (this._ignoreErrors) return;
      (0, _Util.throwError)(message + " while in state ".concat(this.state.name), this.source, this.currentIndex);
    }
  }]);

  return Parser;
}();
/****************************/

/** START OF PARSER STATES **/

/****************************/


exports.default = Parser;

var State = function State(_ref3) {
  var _this2 = this;

  var _ref3$name = _ref3.name,
      name = _ref3$name === void 0 ? "" : _ref3$name,
      _ref3$init = _ref3.init,
      init = _ref3$init === void 0 ? function () {} : _ref3$init,
      _ref3$handleState = _ref3.handleState,
      handleState = _ref3$handleState === void 0 ? function () {} : _ref3$handleState,
      _ref3$parent = _ref3.parent,
      parent = _ref3$parent === void 0 ? null : _ref3$parent;

  _classCallCheck(this, State);

  this.name = name;
  this.init = init.bind(this);
  this.handleState = handleState.bind(this);

  if (parent) {
    this.initAll = function (parser) {
      STATE[parent].initAll(parser);

      _this2.init(parser);
    };
  } else {
    this.initAll = this.init;
  }
}; // Used to return to an arbitrary state after quotes via quoteReturnStateQueue


var QueuedState = function QueuedState(state, callback) {
  _classCallCheck(this, QueuedState);

  this.state = state;
  this.callback = callback;
};

var STATE = {};
STATE = {
  NONE: new State({
    name: "NONE",
    init: function init(parser) {
      parser.resetStateProperties();
    },
    handleState: function handleState(c, parser) {
      if (c === '<') {
        parser.setState(STATE.LOOKING_FOR_TAG);
        return;
      }

      if (Object.values(_Constants.QUOTE_CHAR).includes(c)) {
        parser.quoteType = _Constants.QUOTE_TYPE_FROM_CHAR[c];
        parser.addCharToQuoteVar(c);
        parser.setState(STATE.INSIDE_SOURCE_QUOTES);
        return;
      }

      parser.addCharToQuoteVar(c);
    }
  }),
  INSIDE_SOURCE_QUOTES: new State({
    name: "INSIDE_SOURCE_QUOTES",
    parent: "NONE",
    init: function init(parser) {
      parser.nextCharEscaped = false;
      parser.foundDollarSignInQuotes = false;
    },
    handleState: function handleState(c, parser) {
      // Ignore char escaped with a backslash
      if (parser.nextCharEscaped) {
        parser.nextCharEscaped = false;
        parser.addCharToQuoteVar(c);
        return;
      } // Backslash in quotes


      if (c === "\\") {
        parser.nextCharEscaped = true;
        parser.addCharToQuoteVar(c);
        return;
      } //Start of template literal


      if (c === '$'
      /*&& parser.quoteType === QUOTE_TYPE.BACKTICK*/
      ) {
          parser.foundDollarSignInQuotes = true;
          parser.addCharToQuoteVar(c);
          return;
        } //Found of template literal


      if (c === '{' && parser.foundDollarSignInQuotes) {
        parser.quoteReturnStateQueue.push(STATE.INSIDE_TEMPLATE_LITERAL);
        parser.setState(STATE.INSIDE_TEMPLATE_LITERAL);
        parser.addCharToQuoteVar(c);
        return;
      } // End Quote


      if (c === _Constants.QUOTE_CHAR[parser.quoteType]) {
        parser.quoteType = _Constants.QUOTE_TYPE.NONE;
        var state = parser.quoteReturnStateQueue.shift();

        if (parser.assignQuotesTo === "newSource") {
          parser.addCharToQuoteVar(c);
        }

        if (state) {
          if (state.callback) {
            state.callback();
          }

          if (state.state) {
            state = state.state;
          }
        }

        parser.setState(state || STATE.NONE);
        return;
      }

      parser.addCharToQuoteVar(c);
    }
  }),
  INSIDE_TEMPLATE_LITERAL: new State({
    name: "INSIDE_TEMPLATE_LITERAL",
    parent: "INSIDE_SOURCE_QUOTES",
    init: function init(parser) {
      parser.numOpenBlocks = 0;
    },
    handleState: function handleState(c, parser) {
      if (c === '{') {
        parser.numOpenBlocks++;
      }

      if (c === '}') {
        if (parser.numOpenBlocks === 0) {
          parser.quoteType = _Constants.QUOTE_TYPE.BACKTICK;
          parser.setState(STATE.INSIDE_SOURCE_QUOTES);
          parser.addCharToQuoteVar(c);
          return;
        }

        parser.numOpenBlocks--;
      }

      STATE.NONE.handleState(c, parser);
    }
  }),
  LOOKING_FOR_TAG: new State({
    name: 'LOOKING_FOR_TAG',
    parent: 'NONE',
    init: function init(parser) {
      parser.currTag = "";
      parser.currProps = {};
      parser.foundClosingTagSlash = false;
      parser.currTagEndsWithSlash = false;
      parser.currTagLeadsWithSlash = false;
    },
    handleState: function handleState(c, parser) {
      if (c === '/') {
        if (parser.currTag.length > 0) {
          parser.currTagEndsWithSlash = true;
        } else {
          parser.currTagLeadsWithSlash = true;
        }

        return;
      }

      if (c === '>') {
        parser.onFoundTag();
        return;
      } else if (parser.currTagEndsWithSlash) {
        parser.throwError("Unexpected ".concat(c));
        return;
      }

      if ((0, _Util.isWhitespace)(c)) {
        if (parser.currTag.length > 0) {
          parser.setState(STATE.LOOKING_FOR_PROPS);
        }

        return;
      }

      if (!(0, _Util.isAlpha)(c)) {
        //Char is a number
        parser.throwError("Unexpected \"".concat(c, "\""));
        return;
      }

      parser.currTag += c;
    }
  }),
  LOOKING_FOR_PROPS: new State({
    name: "LOOKING_FOR_PROPS",
    parent: 'LOOKING_FOR_TAG',
    init: function init(parser) {
      parser.currPropName = "";
      parser.foundClosingTagSlash = false;
    },
    handleState: function handleState(c, parser) {
      if (c === '/') {
        if (parser.currTag.length > 0) {
          parser.currTagEndsWithSlash = true;
        } else {
          parser.currTagLeadsWithSlash = true;
        }

        return;
      }

      if (c === '>') {
        parser.onFoundTag();
        return;
      } else if (parser.currTagEndsWithSlash) {
        parser.throwError("Unexpected ".concat(c));
      }

      if ((0, _Util.isWhitespace)(c)) {
        //parser.state = 
        return;
      }

      if (!(0, _Util.isAlpha)(c)) {
        parser.throwError("Unexpected \"".concat(c, "\""));
        return;
      }

      parser.currPropName += c;
      parser.setState(STATE.BUILDING_PROP_NAME);
    }
  }),
  LOOKING_FOR_MARKUP: new State({
    name: "LOOKING_FOR_MARKUP",
    parent: "LOOKING_FOR_PROPS",
    init: function init(parser) {
      parser.currTag = "";
      parser.currProps = {};
      parser.currString = "";
      parser.currTagEndsWithSlash = false;
      parser.currTagLeadsWithSlash = false;
    },
    handleState: function handleState(c, parser) {
      if (c === '<') {
        parser.setState(STATE.LOOKING_FOR_TAG);
        return;
      }

      if ((0, _Util.isWhitespace)(c)) {
        return;
      }

      parser.currString = "".concat(c);
      parser.setState(STATE.BUILDING_STRING); // parser.throwError(`Unexpected ${c}`);
    }
  }),
  BUILDING_STRING: new State({
    name: "BUILDING_STRING",
    parent: "LOOKING_FOR_MARKUP",
    init: function init(parser) {
      parser.lastCharWasWhitespace = false;
    },
    handleState: function handleState(c, parser) {
      if (c === '<') {
        parser.currComponent.children.push(parser.currString);
        parser.setState(STATE.LOOKING_FOR_TAG);
        return;
      }

      if ((0, _Util.isWhitespace)(c)) {
        if (!parser.lastCharWasWhitespace) {
          parser.currString += " ";
        }

        parser.lastCharWasWhitespace = true;
        return;
      } else {
        parser.lastCharWasWhitespace = false;
      }

      parser.currString += c;
    }
  }),
  BUILDING_PROP_NAME: new State({
    name: "BUILDING_PROP_NAME",
    parent: 'LOOKING_FOR_PROPS',
    handleState: function handleState(c, parser) {
      if ((0, _Util.isWhitespace)(c)) {
        parser.currProps[parser.currPropName] = new _ParsedProp.Prop(true);
        parser.setState(STATE.LOOKING_FOR_PROPS);
        return;
      }

      if (c === '=') {
        parser.setState(STATE.STARTING_PROP_VALUE);
        return;
      }

      if ((0, _Util.isAlpha)(c) || (0, _Util.isNumber)(c)) {
        parser.currPropName += c;
        return;
      }

      parser.throwError("Unexpected \"".concat(c, "\""));
    }
  }),
  STARTING_PROP_VALUE: new State({
    name: "STARTING_PROP_VALUE",
    parent: 'BUILDING_PROP_NAME',
    init: function init(parser) {
      parser.currPropValue = "";
    },
    handleState: function handleState(c, parser) {
      if (c === '{') {
        parser.setState(STATE.BUILDING_EVALUATED_PROP);
        return;
      }

      if (c === '"') {
        parser.assignQuotesTo = "currPropValue";
        parser.quoteReturnStateQueue.push(new QueuedState(STATE.LOOKING_FOR_PROPS, function () {
          parser.currProps[parser.currPropName] = new _ParsedProp.Prop(parser.currPropValue);
        }));
        parser.quoteType = _Constants.QUOTE_TYPE.DOUBLE;
        parser.setState(STATE.INSIDE_SOURCE_QUOTES);
        return;
      }
    }
  }),
  BUILDING_EVALUATED_PROP: new State({
    name: "BUILDING_EVALUATED_PROP",
    parent: 'STARTING_PROP_VALUE',
    init: function init(parser) {
      parser.numOpenBlocks = 0;
    },
    handleState: function handleState(c, parser) {
      if (c === "}") {
        if (parser.numOpenBlocks === 0) {
          parser.currProps[parser.currPropName] = new _ParsedProp.EvaluatedProp(parser.currPropValue);
          parser.setState(STATE.LOOKING_FOR_PROPS);
          return;
        }

        parser.numOpenBlocks--;
      }

      if (c === "{") {
        parser.numOpenBlocks++;
      }

      parser.currPropValue += c;
    }
  })
};
exports.STATE = STATE;