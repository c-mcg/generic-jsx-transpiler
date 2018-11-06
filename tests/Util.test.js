import { enumerate, throwError } from "../src/util/Util"
import { NUM_ERROR_CONTEXT_LINES } from '../src/util/Constants'

describe('Utils', () => {

    it('can enumerate', () => {

        const enumeration = enumerate('KEY1', 'KEY2');

        expect(enumeration).toEqual({
            KEY1: 0,
            KEY2: 1,
        });

    });

    it('can throw an error', () => {

        expect(NUM_ERROR_CONTEXT_LINES).toEqual(1);

        const message = "Hello"
        const source = `1\n    2\n    3\n    4\n    5`;
        const index = source.indexOf('3');

        
        const lineNumber = 3;
        const colNumber = 4;
        const contextString = `    2\n    3\n   ^^^\n    4`;

        expect(() => throwError(message, source, index))
            .toThrowError(
                `Error ${message} on line ${lineNumber} at index ${colNumber}:\n` +
                `${contextString}`
            );

    });

});