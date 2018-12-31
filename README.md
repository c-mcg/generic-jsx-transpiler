# generic-jsx-transpiler [![npm version](https://badge.fury.io/js/generic-jsx-transpiler.svg)](https://badge.fury.io/js/generic-jsx-transpiler) [![Build Status](https://travis-ci.org/c-mcg/generic-jsx-transpiler.svg?branch=master)](https://travis-ci.org/c-mcg/generic-jsx-transpiler)

A library for transpiling JSX for use without React. Has no dependencies.

# Setup

`npm install generic-jsx-transpiler --save-dev`

## Usage

Here is a bare bones example of API usage.
Proper usage examples can be found in the `examples` directory.

`node examples/hyperscript` to run [Hyperscript](https://www.npmjs.com/package/hyperscript) example

```
const Parser = require('generic-jsx-transpiler').Parser;

const testJsx = `const ele = <div/>`

// This will simply output '<div/>' in place of any JSX blocks
function serialize(parsedComponent){
  return `<div/>`;
};

// Our "serializer" just needs to have a 'serialize' function
const serializer = { serialize };

const parser = new Parser({ serializer });

const transpiledSource = parser.parse({
  source: "",
  // inputPath: "", // source param will override this
  // async: false, // Will return promise if true
});

console.log(transpiledSource);
```

## API

Coming soon
