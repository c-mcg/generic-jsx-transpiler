// This is an example of using generic-jsx-parser to transform JSX to Hyperscript
const Example = require('../Example');
// Hyperscript is a library for generating HTML elements using JavaScript
// More info here: https://www.npmjs.com/package/hyperscript

const Parser = require('../../index.js').Parser;

// Used to serialize a component from an object
function serializeObject(compObj) {
  const { tag, props, children } = compObj;
  
  // We need to recursivly serialize the children too
  const childJS = children && children.reduce((acc, child, index) => {
      acc += `${serialize(child)}`;
      if (index != children.length - 1) acc += ', ';
      return acc;
  }, "");

  const serializedChildren = childJS ? `[${childJS}]` : `[]`;
  const serializedProps = props.toJS();

  // Output a call to Hyperscript in place of the JSX
  return `h("${tag}", ${serializedChildren}, ${serializedProps})`;
}

// Called by the parser to serialize components (could be string or obj)
// This function is given root elements from blocks of fully parsed JSX
// This means it's up to this function to recursively call itself for it's children 
function serialize(parsedComponent){
  if (typeof parsedComponent === "string") {
    return `"${parsedComponent}"`;
  }
  
  return serializeObject(parsedComponent);
};

function createImports() {
  return "const h = require('hyperscript')";
}

// Our serializer only needs a function called "serialize"
// createImports is optional
const serializer = { serialize, createImports };

// Create our parser
const parser = new Parser({ serializer });

new Example('hyperscript').run(parser);
