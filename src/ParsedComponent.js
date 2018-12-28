import { EvaluatedProp } from "./ParsedProp";

export class ComponentProps {

    constructor(props) {
        this.props = props;
    }

    toJS() {
        if (!this.props) return JSON.stringify(this.props);
        return JSON.stringify(Object.keys(this.props).reduce((acc, propName) => {
            const prop = this.props[propName];
            const jsValue = prop.toJS();
            acc[propName] = prop instanceof EvaluatedProp ? jsValue : JSON.parse(jsValue);
            return acc;
        }, {}));
    }

}

export default class ParsedComponent {
    
    constructor({tag, props=null, parent=null, children=[]}) {
        this.tag = tag;
        this.props = new ComponentProps(props);
        this.parent = parent;
        this.children = children;

        children
            .filter(child => child instanceof ParsedComponent)
            .forEach(child => child.parent = this);
    }

    toJS() {
        const children = this.children.map(child => {
            if (typeof child === 'string') {
                return child;
            }
            return JSON.parse(child.toJS());;
        });
        const output = {
            tag: this.tag,
            props: JSON.parse(this.props.toJS()),
            children,
        }
        return JSON.stringify(output);
    }
    
}