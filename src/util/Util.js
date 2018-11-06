import { NUM_ERROR_CONTEXT_LINES } from './Constants'

export function enumerate() {
    return [...arguments].reduce((acc, item, index) => {
        acc[item] = index;
        return acc;
    }, {})
};

export class JSXError extends Error {
    constructor() {
        super(...arguments);
    }
}

export function throwError(message, sourceString, index) {
    
    const previousLines = sourceString.substring(0, index).split('\n');
    const lineIndex = previousLines.length - 1;
    const lineNumber = lineIndex + 1;
    const colNumber = previousLines[previousLines.length - 1].length;
    
    const lines = sourceString.split('\n').map(line => `    ${line.trim()}`);

    let contextString = `${lines[lineIndex]}\n${' '.repeat(colNumber - 1)}^^^`;
    
    //  Add previous lines
    for (let i = 1; i <= NUM_ERROR_CONTEXT_LINES; i++) {
        contextString = `${lines[lineIndex - i]}\n${contextString}`;
    }
    
    // Add following lines
    for (let i = 1; i <= NUM_ERROR_CONTEXT_LINES; i++) {
        contextString = `${contextString}\n${lines[lineIndex + i]}`;
    }
    
    throw new JSXError(`Error ${message} on line ${lineNumber} at index ${colNumber}:\n${contextString}`);
}

export function isNumber(str) {
    return !isNaN(str);
}

export function isAlpha(str) {
    return str.toLowerCase() != str.toUpperCase();
}

export function isWhitespace(str) {
    return str.trim() === "";
}