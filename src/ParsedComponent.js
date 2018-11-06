
export class ComponentProps {

    constructor(props) {
        this.props = props;
    }

    toJS() {
        return `(() => {return{${Object.keys(this.props).reduce((acc, propName) => {
            acc += `${propName}: ${this.props[propName].toJS()},`;
            return acc;
        }, "")}}})()`;
    }

}

export default class ParsedComponent {
    
    constructor({tag, props={}, parent=null, children=[]}) {
        this.tag = tag;
        this.props = new ComponentProps(props);
        this.parent = parent;
        this.children = children;

        children.forEach(child => child.parent = this);
    }

    toJS() {
        const childrenJS = this.children.reduce((acc, child) => {
            acc += `${child.toJS()}`;
            return acc;
        }, "");
        return `(() => {return {
            tag: "${this.tag}",
            props: ${this.props.toJS()},
            children: [${childrenJS}],
        }})()`;
    }
    
}