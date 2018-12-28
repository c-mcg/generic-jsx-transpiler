# generic-jsx-transpiler [![npm version](https://badge.fury.io/js/generic-jsx-transpiler.svg)](https://badge.fury.io/js/generic-jsx-transpiler) [![Build Status](https://travis-ci.org/c-mcg/generic-jsx-transpiler.svg?branch=master)](https://travis-ci.org/c-mcg/generic-jsx-transpiler)

A library for transpiling JSX for use without React.

# Setup

`npm install generic-jsx-transpiler --save-dev`

`npm install` if running tests or building dist

## Usage

Here is a bare bones example of API usage. Proper usage examples can be found in the `examples` directory

```
const Parser = require('generic-jsx-transpiler').Parser;

const testJsx = `const ele = <div/>`

// This will simple output '<div/>' in place fo any JSX blocks
function serialize(parsedComponent){
  return `<div/>`;
};

const serializer = {serialize};
const parser = new Parser({ source: testJsx, serializer });

console.log(parser.start());
```
