import Parser from '../src/Parser';
import DefaultSerializer from '../src/DefaultSerializer';

describe('Integration', () => {

    function parse(source) {
        return new Parser().parse({ source });
    }

    it('can serialize a component to an object', () => {
        const expectedConvertedJsx = {
            tag: "div",
            props: null,
            children: [],
        };
        const source = `() => {
            return <div/>
        }`
        const expectedResult = source.replace('<div/>', JSON.stringify(expectedConvertedJsx))

        const serializedComponent = parse(source);
        expect(serializedComponent).toEqual(expectedResult)
    });

    it('can serialize a nested component to an object', () => {
        const expectedConvertedJsx = {
            tag: "div",
            props: null,
            children: [
                {
                    tag: "span",
                    props: null,
                    children: [],
                }
            ],
        };
        const source = `() => {
            return <div><span/></div>
        }`
        const expectedResult = source.replace('<div><span/></div>', JSON.stringify(expectedConvertedJsx))


        const serializedComponent = parse(source);
        expect(serializedComponent).toEqual(expectedResult)
    });

    it('can serialize a nested string', () => {
        const expectedConvertedJsx = {
            tag: "div",
            props: null,
            children: [
                {
                    tag: "span",
                    props: null,
                    children: ["span child"],
                },
                "div child"
            ],
        };
        const source = `() => {
            return <div><span>span child</span>div child</div>
        }`
        const expectedResult = source.replace('<div><span>span child</span>div child</div>', JSON.stringify(expectedConvertedJsx))


        const serializedComponent = parse(source);
        expect(serializedComponent).toEqual(expectedResult)
    
    });

    it.only('can serialize a JSX source file', () => {
        const source = `
            const x = <div><span>span child</span>div child</div>
            const y = <div><span>span child</span>div child</div>
        `;
        const serializer = new DefaultSerializer();
        serializer.createImports = () => "const h = require('test- package')";

        //TODO add props
        const expectedConvertedJsx = {
            tag: "div",
            props: null,
            children: [
                {
                    tag: "span",
                    props: null,
                    children: ["span child"],
                },
                "div child"
            ],
        };
        const expectedResult = 
            serializer.createImports() + '\n' +
            source.split('<div><span>span child</span>div child</div>')
                .join(JSON.stringify(expectedConvertedJsx));

        const parser = new Parser({ serializer });
        const output = parser.parse({ source });
        expect(output).toEqual(expectedResult)
    
    });

})