# generic-jsx-transpiler [![npm version](https://badge.fury.io/js/generic-jsx-transpiler.svg)](https://badge.fury.io/js/generic-jsx-transpiler) [![Build Status](https://travis-ci.org/c-mcg/generic-jsx-transpiler.svg?branch=master)](https://travis-ci.org/c-mcg/generic-jsx-transpiler)

A library for transpiling JSX for use without React.

# Setup

`npm install generic-jsx-transpiler --save-dev`

`npm install` if running tests or building dist

## Usage

```
const Parser = require('generic-jsx-transpiler').Parser;

const testJsx = `function hello() {
  return (
    <div>
      <span></span>
      <span></span>
    </div>
  );
}`

//Transpile to a React style `createElement` function
function serialize(parsedComponent){
  const { tag, props, children } = parsedComponent;
  
  const childJS = children.reduce((acc, child, index) => {
        acc += `${serialize(child)}`;
        if (index != children.length - 1) acc += ', ';
        return acc;
    }, "");
    
  const childParam = childJS ? `, ${childJS}` : '';
  return `createElement("${tag}", ${props.toJS()}${childParam})`;
};
const serializer = {serialize};

const parser = new Parser({ source: testJsx, serializer });

console.log(parser.start());
```

## Limitations

 - Currently can't parse raw text inside JSX
