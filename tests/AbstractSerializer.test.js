import Parser from '../src/Parser';

describe('AbstractSerializer', () => {

    const defaultComponent = {
        props: (() => {return {}})(),
        children: [],
    }

    function parse(source) {
        return new Parser({source}).start();
    }

    it('can serialize a component to an object', () => {

        const source = `() => {
            return <div/>
        }`

        const serializedComponent = eval(parse(source))();
        expect(serializedComponent).toEqual({
            tag: "div",
            props: (() => {return {}})(),
            children: [],
        })
    });

    it('can serialize a nested component to an object', () => {

        const source = `() => {
            return <div><span/></div>
        }`

        const serializedComponent = eval(parse(source))();
        expect(serializedComponent).toEqual({
            ...defaultComponent,
            tag: "div",
            children: [
                {
                    ...defaultComponent,
                    tag: "span",
                }
            ],
        })
    });

})