
export default class AbstractSerializer {

    constructor() {}

    /**
     * Should recursively serialize a parsed component
     * 
     * @param ParsedComponent parsedComponent 
     * @returns a string containing a valid JS statement resulting in a single value
     */
    serialize(parsedComponent) { return parsedComponent.toJS(); }

}