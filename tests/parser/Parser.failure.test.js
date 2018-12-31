import Parser, { STATE } from '../../src/Parser'
import { Prop, EvaluatedProp } from '../../src/ParsedProp'

describe('Parser', () => {

    it('will not accept an invalid tag', () => {
        const parser = new Parser();

        expect(() => {
            parser.parse({ source: "<4 " });
        }).toThrow();

    });

    it('will not accept an invalid prop', () => {
        const parser = new Parser();

        expect(() => {
            parser.parse({ source: "<div 4=" });
        }).toThrow();

    });

    it('it must have a source or filePath', () => {
        const parser = new Parser();

        expect(() => {
            parser.parse({});
        }).toThrow();
    });

    it('will not parse tags in quotes', () => {
        const parser = new Parser();

        parser.parse({ source: `const h = "<"` });

        expect(parser.state).toBe(STATE.NONE);
    });

    it('will not parse escaped quotes within quotes', () => {
        const parser = new Parser();

        parser.parse({ source: `const h = "\\""` });

        expect(parser.state).toBe(STATE.NONE);
    });

    it('will not parse tags in quotes within template literals', () => {
        const parser = new Parser();

        parser.parse({ source: "` ${'<div " });

        expect(parser.state).toBe(STATE.INSIDE_SOURCE_QUOTES);
    });

});