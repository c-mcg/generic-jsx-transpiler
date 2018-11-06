import { enumerate } from './Util'

export const NUM_ERROR_CONTEXT_LINES = 1;

export const QUOTE_TYPE = enumerate('NONE', 'DOUBLE', 'SINGLE', 'BACKTICK');
export const QUOTE_CHAR = {
    [QUOTE_TYPE.DOUBLE]: '"',
    [QUOTE_TYPE.SINGLE]: "'",
    [QUOTE_TYPE.BACKTICK]: "`",
}
export const QUOTE_TYPE_FROM_CHAR = Object.keys(QUOTE_CHAR).reduce((acc, key) => {
    acc[QUOTE_CHAR[key]] = key;
    return acc;
}, {})