import { type } from "os";

export class Prop {

    constructor(value) {
        this._value = value;
    }

    toJS() {
        if (typeof this._value === 'string') {
            return `"${this._value}"`;
        }

        return this._value;
    }

}

export class EvaluatedProp {

    constructor(source) {
        this._source = source;
    }

    toJS() {
        return `(() => {return (${this._source})})()`
    }

}