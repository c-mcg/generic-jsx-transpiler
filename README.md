# generic-jsx-transpiler [![npm version](https://badge.fury.io/js/generic-jsx-transpiler.svg)](https://badge.fury.io/js/generic-jsx-transpiler) [![Build Status](https://travis-ci.org/c-mcg/generic-jsx-transpiler.svg?branch=master)](https://travis-ci.org/c-mcg/generic-jsx-transpiler)

A library for transpiling JSX for use without React.

# Setup

`npm install generic-jsx-transpiler --save-dev`

`npm install` if running tests or building dist

## Usage

Here is a bare bones example of API usage.
Proper usage examples can be found in the `examples` directory.

`node examples/hyperscript` to run [Hyperscript](https://www.npmjs.com/package/hyperscript) example

```
const Parser = require('generic-jsx-transpiler').Parser;

const testJsx = `const ele = <div/>`

// This will simple output '<div/>' in place of any JSX blocks
function serialize(parsedComponent){
  return `<div/>`;
};

const serializer = {serialize};
const parser = new Parser({ serializer });

console.log(parser.parse());
```
