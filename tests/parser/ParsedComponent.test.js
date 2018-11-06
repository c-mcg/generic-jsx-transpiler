import ParsedComponent, { ComponentProps } from '../../src/ParsedComponent'
import { Prop, EvaluatedProp } from '../../src/ParsedProp'

describe('ComponentProps', () => {

    it('can be created', () => {
        const props = new ComponentProps({test: "hello"});
        expect(props.props).toEqual({test: "hello"});
    });

    it('can be converted to JS', () => {
        const props = new ComponentProps({
            test: new Prop("Hey!"),
            test2: new Prop(4)
        });

        expect(eval(props.toJS())).toEqual({
            test: "Hey!",
            test2: 4
        })
    });

});

describe('ParsedComponent', () => {

    it('can be created', () => {
        const parent = {};
        const children = [{}];

        const comp = new ParsedComponent({
            tag: "div",
            parent,
            children,
            props: {
                test: new Prop("yo")
            },
        });

        expect(comp.tag).toEqual("div");
        expect(comp.parent).toBe(parent);
        expect(comp.children).toBe(children);
        expect(comp.props).toEqual(new ComponentProps({
            test: new Prop("yo")
        }));
    });

    it('can be converted to JS', () => {
        const comp = new ParsedComponent({
            tag: "div",
            props: {
                test: new Prop("yo")
            },
        })

        expect(eval(`() => ${comp.toJS()}`)()).toEqual({
            tag: "div",
            props: (() => {return {test: 'yo'}})(),
            children: [],
        });
    })

});