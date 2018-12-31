const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

module.exports = class Example {
    
    constructor(name) {
        this.name = name;
    }

    run(parser) {
        const defaultInputPath = `./examples/${this.name}/input.jsx`;
        const defaultOutputFile = `./examples/${this.name}/output.js`;

        readline.question(`Enter path to input file (${defaultInputPath}): `, (inputPath) => {

        if (!inputPath) {
            inputPath = defaultInputPath;
        }
        
        readline.question(`Enter path to output file (${defaultOutputFile}): `, (outputPath) => {
            console.log();
            console.log(`Parsing source...`);
        
            if (!outputPath) {
            outputPath = defaultOutputFile;
            }
        
            // Run the parser
            const newSource = parser.parse({ inputPath, outputPath });
        
            console.log(`Transpiled JSX written to file ${outputPath}`);
            console.log();
            console.log("Try pasting the output into this sandbox!", "https://codesandbox.io/s/v30y8ljl05");
        
            readline.close();
        });
        });
    }

}