import { isNumber, isAlpha, isWhitespace, throwError } from './util/Util'
import { QUOTE_TYPE, QUOTE_CHAR, QUOTE_TYPE_FROM_CHAR } from './util/Constants'

import DefaultSerializer from './DefaultSerializer'

import { Prop, EvaluatedProp } from './ParsedProp'
import ParsedComponent from './ParsedComponent'

export default class Parser {

    constructor({ source, serializer=new DefaultSerializer() }) {
        this.source = source;
        this.serializer = serializer;
        this.newSource = "";

        this.started = false;
        this.promise = null;

        this.quoteType = QUOTE_TYPE.NONE;
        this.currentIndex = 0;

        this._ignoreErrors = false;

        this.setState(STATE.NONE);
    }

    addCharToQuoteVar(c) {
        this[this.assignQuotesTo] += c;
    }

    ignoreErrors() {
        this._ignoreErrors = true;
        return this;
    }

    setState(state, initAll=false) {
        state[initAll ? 'initAll' : 'init'](this);
        this.state = state;
    }

    onFoundComponentTree() {
        this.newSource += this.serializer.serialize(this.currComponent);
        this.setState(STATE.NONE);
    }

    onFoundTag() {//TODO split into smaller functions
        if (this.currTagLeadsWithSlash) { // closing tag
            this.closeCurrentComponent()
        } else if (this.currTagEndsWithSlash) { // self closing tag
            this.addSelfClosingComponent()
        } else {// An openening tag
            this.addOpenComponent();
        }
    }

    createComponent() {
        return new ParsedComponent({
            tag: this.currTag,
            props: Object.keys(this.currProps).length === 0 ? null : this.currProps,
            parent: this.currComponent,
        });
    }

    addOpenComponent() {
        this.currComponent = this.createComponent();
        this.setState(STATE.LOOKING_FOR_MARKUP);
    }

    closeCurrentComponent() {
        if (this.currComponent.parent) {
            this.currComponent.parent.children.push(this.currComponent);
            this.currComponent = this.currComponent.parent;
            this.setState(STATE.LOOKING_FOR_MARKUP);
        } else {
            this.onFoundComponentTree();
        }
    }

    addSelfClosingComponent() {
        const component = this.createComponent();
        if (this.currComponent) {
            this.currComponent.children.push(component);
            this.setState(STATE.LOOKING_FOR_MARKUP);
        } else {
            this.currComponent = component;
            this.onFoundComponentTree();
        }
    }

    start(async=false) {

        if (this.started) {
            throw new Error(`"start" method can only be called once on Parser.`);
        }

        this.started = true;
        
        const start = (resolve, reject) => {

            [...this.source].forEach((c, index) => {
                this.currentIndex = index;
                this.state.handleState(c, this)
            });

            if (resolve) {
                resolve(this.newSource);
                return;
            }

            return this.newSource;
        }

        if (async) {
            this.promise = new Promise(start);
        } else {
            start();
            return this.newSource;
        }

        return this.promise;
    }

    throwError(message) {
        if (this._ignoreErrors) return;

        throwError(message + ` while in state ${this.state.name}`, this.source, this.currentIndex);
    }

}

/****************************/
/** START OF PARSER STATES **/
/****************************/

class State {

    constructor({
        name="",
        init=()=>{},
        handleState=()=>{},
        parent=null}) {

        this.name = name;
        this.init = init.bind(this);
        this.handleState = handleState.bind(this);

        if (parent) {
            this.initAll = (parser) => {
                STATE[parent].initAll(parser);
                this.init(parser);
            }
        } else {
            this.initAll = this.init;
        }
    }

}

// Used to return to an arbitrary state after quotes via quoteReturnStateQueue
class QueuedState {

    constructor(state, callback) {
        this.state = state;
        this.callback = callback;
    }

}

let STATE = {};

STATE = {
    NONE: new State({
        name: "NONE",
        init(parser) {
            parser.assignQuotesTo = "newSource";
            parser.quoteReturnStateQueue = [];
        },
        handleState(c, parser) {
            if (c === '<') {
                parser.setState(STATE.LOOKING_FOR_TAG);
                return;
            }

            if (Object.values(QUOTE_CHAR).includes(c)) {
                parser.quoteType = QUOTE_TYPE_FROM_CHAR[c];
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
        init(parser) {
            parser.nextCharEscaped = false;
            parser.foundDollarSignInQuotes = false;
        },
        handleState(c, parser) {
            
            // Ignore char escaped with a backslash
            if (parser.nextCharEscaped) {
                parser.nextCharEscaped = false;
                parser.addCharToQuoteVar(c);
                return;
            }

            // Backslash in quotes
            if (c === "\\") {
                parser.nextCharEscaped = true;
                parser.addCharToQuoteVar(c);
                return;
            }

            //Start of template literal
            if (c === '$' /*&& parser.quoteType === QUOTE_TYPE.BACKTICK*/) {
                parser.foundDollarSignInQuotes = true;
                parser.addCharToQuoteVar(c);
                return;
            }

            //Found of template literal
            if (c === '{' && parser.foundDollarSignInQuotes) {
                parser.quoteReturnStateQueue.push(STATE.INSIDE_TEMPLATE_LITERAL);
                parser.setState(STATE.INSIDE_TEMPLATE_LITERAL);
                parser.addCharToQuoteVar(c);
                return;
            }

            // End Quote
            if (c === QUOTE_CHAR[parser.quoteType]) {
                parser.quoteType = QUOTE_TYPE.NONE;
                let state = parser.quoteReturnStateQueue.shift();

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
        },
    }),

    INSIDE_TEMPLATE_LITERAL: new State({
        name: "INSIDE_TEMPLATE_LITERAL",
        parent: "INSIDE_SOURCE_QUOTES",
        init(parser) {
            parser.numOpenBlocks = 0;
        },
        handleState(c, parser) {

            if (c === '{') {
                parser.numOpenBlocks++;
            }

            if (c === '}') {
                if (parser.numOpenBlocks === 0) {
                    parser.quoteType = QUOTE_TYPE.BACKTICK;
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
        init(parser) {
            parser.currTag = "";
            parser.currProps = {};
            parser.foundClosingTagSlash = false;
            parser.currTagLeadsWithSlash = false;
        },
        handleState(c, parser) {

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
                parser.throwError(`Unexpected ${c}`)
            }
            
            if (isWhitespace(c)) {
                if (parser.currTag.length > 0) {
                    parser.setState(STATE.LOOKING_FOR_PROPS);
                }
                return;
            }

            if (!isAlpha(c)) {//Char is a number
                parser.throwError(`Unexpected "${c}"`);
                return;
            }
            
            parser.currTag += c;
        }
    }),

    LOOKING_FOR_PROPS: new State({
        name: "LOOKING_FOR_PROPS",
        parent: 'LOOKING_FOR_TAG',
        init(parser) {
            parser.currPropName = "";
            parser.foundClosingTagSlash = false;
        },
        handleState(c, parser) {

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
                parser.throwError(`Unexpected ${c}`)
            }

            if (isWhitespace(c)) {
                //parser.state = 
                return;
            }

            if (!isAlpha(c)) {
                parser.throwError(`Unexpected "${c}"`);
                return;
            }

            parser.currPropName += c;
            parser.setState(STATE.BUILDING_PROP_NAME);

        }
    }),
    
    LOOKING_FOR_MARKUP: new State({
        name: "LOOKING_FOR_MARKUP",
        parent: "LOOKING_FOR_PROPS",
        init(parser) {
            parser.currTag = "";
            parser.currProps = {};
            parser.currString = "";
            parser.currTagEndsWithSlash = false;
            parser.currTagLeadsWithSlash = false;
        },
        handleState(c, parser) {
            if (c === '<') {
                parser.setState(STATE.LOOKING_FOR_TAG);
                return;
            }

            if (isWhitespace(c)) {
                return;
            }

            parser.currString = `${c}`;
            parser.setState(STATE.BUILDING_STRING);
            // parser.throwError(`Unexpected ${c}`);
        }
    }),

    BUILDING_STRING: new State({
        name: "BUILDING_STRING",
        parent: "LOOKING_FOR_MARKUP",
        init(parser) {
            parser.lastCharWasWhitespace = false;
        },
        handleState(c, parser) {
            if (c === '<') {
                parser.currComponent.children.push(parser.currString);
                parser.setState(STATE.LOOKING_FOR_TAG);
                return;
            }

            if (isWhitespace(c)) {
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
        handleState(c, parser) {

            if (isWhitespace(c)) {
                parser.currProps[parser.currPropName] = new Prop(true);
                parser.setState(STATE.LOOKING_FOR_PROPS);
                return;
            }

            if (c === '=') {
                parser.setState(STATE.STARTING_PROP_VALUE);
                return;
            }

            if (isAlpha(c) || isNumber(c)) {
                parser.currPropName += c;
                return;
            }

            parser.throwError(`Unexpected "${c}"`);
        }
    }),

    STARTING_PROP_VALUE: new State({
        name: "STARTING_PROP_VALUE",
        parent: 'BUILDING_PROP_NAME',
        init(parser) {
            parser.currPropValue = "";
        },
        handleState(c, parser) {

            if (c === '{') {
                parser.setState(STATE.BUILDING_EVALUATED_PROP);
                return;
            }

            if (c === '"') {
                parser.assignQuotesTo = "currPropValue";
                parser.quoteReturnStateQueue.push(new QueuedState(STATE.LOOKING_FOR_PROPS, () => {
                    parser.currProps[parser.currPropName] = new Prop(parser.currPropValue);
                }));
                parser.quoteType = QUOTE_TYPE.DOUBLE
                parser.setState(STATE.INSIDE_SOURCE_QUOTES);
                return;
            }

        }
    }),

    BUILDING_EVALUATED_PROP: new State({
        name: "BUILDING_EVALUATED_PROP",
        parent: 'STARTING_PROP_VALUE',
        init(parser) {
            parser.numOpenBlocks = 0;
        },
        handleState(c, parser) {

            if (c === "}") {
                if (parser.numOpenBlocks === 0) {
                    parser.currProps[parser.currPropName] = new EvaluatedProp(parser.currPropValue);
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
    }),
}

exports.STATE = STATE;