import { type } from "os";

export class Prop {

    constructor(value) {
        this._value = value;
    }

    toJS() {
        return JSON.stringify(this._value);
    }

}

export class EvaluatedProp {

    constructor(source) {
        this._source = source;
    }

    toJS() {
        return this._source;
    }

}