import fs from 'fs'

import Parser, { STATE } from '../../src/Parser'
import ParsedComponent from '../../src/ParsedComponent'
import { Prop, EvaluatedProp } from '../../src/ParsedProp'
import { QUOTE_TYPE } from '../../src/util/Constants'

describe('Parser', () => {

    it('can be created', () => {

        const parser = new Parser();

        expect(parser.source).toBe(null);
        expect(parser.newSource).toEqual("");
        expect(parser.state).toBe(STATE.NONE);
    });

    it('it can load the source from a file', () => {
        const thisFilePath = __filename;
        const thisFileSource = fs.readFileSync(thisFilePath, { encoding: 'utf8' });

        const parser = new Parser();
        const parserSource = parser.loadFile(thisFilePath);

        expect(parserSource).toEqual(thisFileSource);
    })

    it('it can accept a filePath to parse', () => {
        const filePath = "test";
        const source = "source";
        const parser = new Parser();
        parser.loadFile = jest.fn().mockReturnValue(source);

        const parserSource = parser.parse({ filePath });

        expect(parser.loadFile).toHaveBeenCalledWith(filePath);
        expect(parser.source).toBe(source);
    })

    it('can find markup', () => {
        const parser = new Parser();

        parser.parse({ source: `<` });

        expect(parser.state).toBe(STATE.LOOKING_FOR_TAG);
    });

    it('can find a tag', () => {
        const parser = new Parser();
        parser.setState(STATE.LOOKING_FOR_TAG, true);

        parser.parse({ source: `div ` });

        expect(parser.state).toBe(STATE.LOOKING_FOR_PROPS);
        expect(parser.currTag).toBe("div");
    });

    function createPropTest(source, expectedProps, returnParser=false) {
        return () => {
            const parser = new Parser();
            parser.setState(STATE.LOOKING_FOR_PROPS, true);

            parser.parse({ source });

            expect(parser.state).toBe(STATE.LOOKING_FOR_PROPS);
            expect(parser.currProps).toEqual(expectedProps);

            if (returnParser) {
                return parser;
            }
        }
    }

    it('can find an implicit prop', createPropTest(
        `test `, 
        {
            test: new Prop(true)
        }
    ));

    it('can find a string prop', createPropTest(
        `test="HEY!" `,
        {
            test: new Prop("HEY!")
        }
    ))

    it('can find an evaluated string prop', () => {
        const parser = createPropTest(
            `test={"HEY!"}`,
            {
                test: new EvaluatedProp(`"HEY!"`)
            },
            true
        )();
    })

    it('can find an evaluated statement prop', () => {
        const parser = createPropTest(
            `test={6 + 4}`,
            {
                test: new EvaluatedProp(`6 + 4`)
            },
            true
        )();
    })

    it('can find multiple props', () => {
        const parser = createPropTest(
            `test="what up" test1={6 + 4}`,
            {
                test: new Prop("what up"),
                test1: new EvaluatedProp(`6 + 4`)
            },
            true
        )();
    });

    it('can find a component', () => {
        const parser = new Parser();

        parser.parse({ source: `<div>` });

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            props: null,
            parent: null,
            children: [],
        }))
    });

    it('can find a component with props', () => {
        const parser = new Parser();

        parser.parse({ source: `<div x="0" y={5 + 5}>` });

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            props: {
                x: new Prop("0"),
                y: new EvaluatedProp('5 + 5')
            },
            parent: null,
            children: [],
        }))
    });

    it('can find a self closing component', () => {
        const parser = new Parser();

        parser.parse({ source: `<div x="0" y={5 + 5}/>` });

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            props: {
                x: new Prop("0"),
                y: new EvaluatedProp('5 + 5')
            },
            parent: null,
            children: [],
        }))
    })

    it('can find a nested component', () => {
        const parser = new Parser();

        parser.parse({ source: `<div><div/></div>` });

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            children: [
                new ParsedComponent({tag: "div"})
            ]
        }))
    });

    it('can find a nested string', () => {
        const parser = new Parser();

        parser.parse({ source: `<div>hello</div>` });

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            children: ["hello"]
        }))
    })

    it('will reduce whitespace in strings', () => {
        const parser = new Parser();

        parser.parse({ source: `<div>h  e\t\tl\n\nl o</div>` });

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            children: ["h e l l o"]
        }))
    })

    it('can find sibling components', () => {
        const parser = new Parser();

        parser.parse({ source: `<div><div/><div/></div>` });

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            children: [
                new ParsedComponent({tag: "div"}),
                new ParsedComponent({tag: "div"})
            ]
        }))
    })

    it('will stop looking for markup when JSX has ended', () => {
        let parser = new Parser();
        parser.parse({ source: `<div/>` });
        expect(parser.state).toBe(STATE.NONE);

        parser = new Parser();
        parser.parse({ source: `<div><div/></div>` });
        expect(parser.state).toBe(STATE.NONE);
    })

    /***************************************************/
    /***************************************************/
    /**** TESTING QUOTE AND TEMPLATE LITERALS BELOW ****/
    /***************************************************/
    /***************************************************/

    it('can parse quotes preceded with an escaped backslack', () => {
        const parser = new Parser();

        parser.parse({ source: `const h = "\\\\"` });

        expect(parser.state).toBe(STATE.NONE);
    });

    it('can parse template literals', () => {
        const parser = new Parser();

        parser.parse({ source: "` hi ${" });

        expect(parser.state).toBe(STATE.INSIDE_TEMPLATE_LITERAL);
    })

    it('can parse tags in template literals', () => {
        const parser = new Parser();

        parser.parse({ source: "` hi ${<div " });

        expect(parser.state).toBe(STATE.LOOKING_FOR_PROPS);
        expect(parser.currTag).toBe("div");
    })

    it('can parse template literals with nested blocks', () => {
        const parser = new Parser();

        parser.parse({ source: "` hi ${{{}} <div " });

        expect(parser.state).toBe(STATE.LOOKING_FOR_PROPS);
        expect(parser.currTag).toBe("div");
    })

    it('can parse quotes inside template literals', () => {
        const parser = new Parser();

        parser.parse({ source: "` ${'<div \" '}`" });

        expect(parser.state).toBe(STATE.NONE);
    });

    it('can parse two sets of template literals', () => {
        const parser = new Parser();

        parser.parse({ source: "` ${`${ }" });

        expect(parser.state).toBe(STATE.INSIDE_SOURCE_QUOTES);
        expect(parser.quoteType).toEqual(QUOTE_TYPE.BACKTICK);
    });

    it('can parse quotes in two sets of template literals', () => {
        const parser = new Parser();

        parser.parse({ source: "`${ `${' \" '}` }`" });

        expect(parser.state).toBe(STATE.NONE);
    });

});