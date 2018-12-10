import Parser from '../src/Parser';

describe('AbstractSerializer', () => {

    function parse(source) {
        return new Parser({source}).start();
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

})