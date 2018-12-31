import Parser, { STATE } from '../../src/Parser'
import { Prop, EvaluatedProp } from '../../src/ParsedProp'

describe('Parser', () => {

    it('will not accept an invalid tag', () => {
        const parser = new Parser({source: "<4 "});

        expect(() => {
            parser.parse();
        }).toThrow();

    });

    it('will not accept an invalid prop', () => {
        const parser = new Parser({source: "<div 4="});

        expect(() => {
            parser.parse();
        }).toThrow();

    });

    it('will not parse tags in quotes', () => {
        const parser = new Parser({source: `const h = "<"`});

        parser.parse();

        expect(parser.state).toBe(STATE.NONE);
    });

    it('will not parse escaped quotes within quotes', () => {
        const parser = new Parser({source: `const h = "\\""`});

        parser.parse();

        expect(parser.state).toBe(STATE.NONE);
    });

    it('will not parse tags in quotes within template literals', () => {
        const parser = new Parser({source: "` ${'<div "});

        parser.parse();

        expect(parser.state).toBe(STATE.INSIDE_SOURCE_QUOTES);
    });
    

});