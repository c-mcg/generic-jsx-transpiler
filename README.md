# generic-jsx-transpiler [![npm version](https://badge.fury.io/js/generic-jsx-transpiler.svg)](https://badge.fury.io/js/generic-jsx-transpiler) [![Build Status](https://travis-ci.org/c-mcg/generic-jsx-transpiler.svg?branch=master)](https://travis-ci.org/c-mcg/generic-jsx-transpiler)

A library for transpiling JSX for use without React.

`generic-jsx-transpiler` will parse JSX and transform the markup using the given serializer.

## Usage

Uses AbstractSerializer by default

```
  console.log(new Parser(source).start());
```

## Custom Serializers

A custom serilizer must be an object with a function `serialize` which accepts `ParsedComponent` and returns a string containing valid JavaScript

E.g
```
  function serialize(parsedComponent){
      const { tag, props, children } = parsedComponent;
      
      const childJS = children.reduce((acc, child) => {
            acc += `${serialize(child)}`;
            return acc;
        }, "");
      
      //Transpile to a React style `createComponent` function
      return `createComponent(${tag}, props.toJS(), childJs);` 
    };
  const serializer = {serialize};
```
## Limitations

 - Currently can't parse raw text inside JSX
