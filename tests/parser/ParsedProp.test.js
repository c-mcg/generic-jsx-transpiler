import { Prop, EvaluatedProp } from '../../src/ParsedProp'

describe('Prop', () => {

    it('can be created', () => {
        const prop = new Prop("Hello");
        expect(prop._value).toEqual("Hello");
    });

    it('can be convert a number JS', () => {
        const prop = new Prop(4);
        expect(eval(prop.toJS())).toEqual(4);
    });

    it('can convert a string to JS', () => {
        const prop = new Prop("Hello!");
        expect(eval(prop.toJS())).toEqual("Hello!");
    })

});

describe('EvaluatedProp', () => {

    it ('can be created', () => {
        const prop = new EvaluatedProp(`"Hello!"`);
        expect(prop._source).toBe(`"Hello!"`);
    });

    it('can be converted to JS', () => {
        const prop = new EvaluatedProp(`"Hello!"`);
        expect(eval(prop.toJS())).toEqual("Hello!");
    })

});