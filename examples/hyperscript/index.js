// This is an example of using generic-jsx-parser to transform JSX to Hyperscript
// Hyperscript is a library for generating HTML elements using JavaScript
// More info here: https://www.npmjs.com/package/hyperscript

const Parser = require('../../index.js').Parser;
const fs = require('fs');

const defaultInputPath = "./examples/hyperscript/input.jsx";
const defaultOutputFile = "./examples/hyperscript/output.js";

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

// Our serializer only needs a function called "serialize"
const serializer = { serialize };

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question(`Enter path to input file (${defaultInputPath}): `, (inputPath) => {

  if (!inputPath) {
    inputPath = defaultInputPath;
  }

  
  readline.question(`Enter path to output file (${defaultOutputFile}): `, (outputPath) => {
    console.log();
    console.log(`Parsing source...`);

    let sourceCode;
    try {
      sourceCode = fs.readFileSync(inputPath, { encoding: 'utf8' });
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('File not found!');
        readline.close();
        return;
      } else {
        throw err;
      }
    }


    if (!outputPath) {
      outputPath = defaultOutputFile;
    }

    // Create our parser
    const parser = new Parser({ source: sourceCode, serializer });

    const hyperscriptRequire = "const h = require('hyperscript')\n"

    // Run the parser
    const newSource = parser.start();

    try {
      fs.writeFileSync(outputPath, hyperscriptRequire + newSource);
    } catch (e) {
      console.log("Error writing to file");
      readline.close();
      return;
    }

    console.log(`Transpiled JSX written to file ${outputPath}`);
    console.log();
    console.log("Try pasting the output into this sandbox!", "https://codesandbox.io/s/v30y8ljl05");

    readline.close();
  });
});

