import Parser, { STATE } from '../../src/Parser'
import ParsedComponent from '../../src/ParsedComponent'
import { Prop, EvaluatedProp } from '../../src/ParsedProp'
import { QUOTE_TYPE } from '../../src/util/Constants'

describe('Parser', () => {

    it('can be created', () => {
        const testComponent = `
            function() {
                return <div></div>
            }
        `.split('\n').map(line => line.trim()).join(' ').trim();

        const parser = new Parser({source: testComponent});

        expect(parser.source).toBe(testComponent);
        expect(parser.state).toBe(STATE.NONE);
        expect(parser.newSource).toEqual("");
    });

    it('can find markup', () => {
        const parser = new Parser({source: `<`})

        parser.start();

        expect(parser.state).toBe(STATE.LOOKING_FOR_TAG);
    });

    it('can find a tag', () => {
        const parser = new Parser({source: `div `})
        parser.setState(STATE.LOOKING_FOR_TAG, true);

        parser.start();

        expect(parser.state).toBe(STATE.LOOKING_FOR_PROPS);
        expect(parser.currTag).toBe("div");
    });

    function createPropTest(source, expectedProps, returnParser=false) {
        return () => {
            const parser = new Parser({source});
            parser.setState(STATE.LOOKING_FOR_PROPS, true);

            parser.start();

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
        const parser = new Parser({source: `<div>`})

        parser.start();

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            props: {},
            parent: null,
            children: [],
        }))
    });

    it('can find a component with props', () => {
        const parser = new Parser({source: `<div x="0" y={5 + 5}>`})

        parser.start();

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
        const parser = new Parser({source: `<div x="0" y={5 + 5}/>`})

        parser.start();

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
        const parser = new Parser({source: `<div><div/></div>`})

        parser.start();

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            children: [
                new ParsedComponent({tag: "div"})
            ]
        }))
    });

    it('can find sibling components', () => {
        const parser = new Parser({source: `<div><div/><div/></div>`})

        parser.start();

        expect(parser.currComponent).toEqual(new ParsedComponent({
            tag: "div",
            children: [
                new ParsedComponent({tag: "div"}),
                new ParsedComponent({tag: "div"})
            ]
        }))
    })

    it('will stop looking for markup when JSX has ended', () => {
        let parser = new Parser({source: `<div/>`})
        parser.start();
        expect(parser.state).toBe(STATE.NONE);

        parser = new Parser({source: `<div><div/></div>`})
        parser.start();
        expect(parser.state).toBe(STATE.NONE);
    })

    /*********************************************/
    /* TESTING QUOTE AND TEMPLATE LITERALS BELOW */
    /*********************************************/

    it('can parse quotes preceded with an escaped backslack', () => {
        const parser = new Parser({source: `const h = "\\\\"`})

        parser.start();

        expect(parser.state).toBe(STATE.NONE);
    });

    it('can parse template literals', () => {
        const parser = new Parser({source: "` hi ${"});

        parser.start();

        expect(parser.state).toBe(STATE.INSIDE_TEMPLATE_LITERAL);
    })

    it('can parse tags in template literals', () => {
        const parser = new Parser({source: "` hi ${<div "});

        parser.start();

        expect(parser.state).toBe(STATE.LOOKING_FOR_PROPS);
        expect(parser.currTag).toBe("div");
    })

    it('can parse template literals with nested blocks', () => {
        const parser = new Parser({source: "` hi ${{{}} <div "});

        parser.start();

        expect(parser.state).toBe(STATE.LOOKING_FOR_PROPS);
        expect(parser.currTag).toBe("div");
    })

    it('can parse quotes inside template literals', () => {
        const parser = new Parser({source: "` ${'<div \" '}`"});

        parser.start();

        expect(parser.state).toBe(STATE.NONE);
    });

    it('can parse two sets of template literals', () => {
        const parser = new Parser({source: "` ${`${ }"});

        parser.start();

        expect(parser.state).toBe(STATE.INSIDE_SOURCE_QUOTES);
        expect(parser.quoteType).toEqual(QUOTE_TYPE.BACKTICK);
    });

    it('can parse quotes in two sets of template literals', () => {
        const parser = new Parser({source: "`${ `${' \" '}` }`"});

        parser.start();

        expect(parser.state).toBe(STATE.NONE);
    });

});