/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */

import parser from '../parsec/parser';
import genlex from '../genlex/genlex.js';
import token from '../genlex/token';


//
// Facilities
//

var tkNumber = token.parser.number,
    tkString = token.parser.string,
    tkKeyword = token.parser.keyword;

function tkKey(s) {
    return tkKeyword.match(s);
}

// unit -> Parser ? Token
function arrayOrNothing() {
    var value = [],
        addValue = (e) => {
            value = value.concat(e);
        },
        getValue = () => value,
        item = parser.lazy(expr).map(addValue);
    return (item.then(tkKey(',').thenRight(item).optrep())).opt().map(getValue);
}

// unit -> Parser ? Token
function objectOrNothing() {
    var value = {},
        addValue = (e) => {
            value[e[0]] = e[1];
        },
        getValue = () => value,
        attribute = tkString.thenLeft(tkKey(':')).then(parser.lazy(expr)).map(addValue);
    return (attribute.thenLeft(tkKey(',').then(attribute).optrep())).opt().map(getValue);
}

// unit -> Parser ? Token
function expr() {
    return tkNumber.
            or(tkString).
            or(tkKey("null").thenReturns(null)).
            or(tkKey("true").thenReturns(true)).
            or(tkKey("false").thenReturns(false)).
            or(tkKey('[').thenRight(parser.lazy(arrayOrNothing)).thenLeft(tkKey(']'))).
            or(tkKey('{').thenRight(parser.lazy(objectOrNothing)).thenLeft(tkKey('}')));
}

//const parse =
export default {
    parse :function (source) {
        var keywords = ["null", "false", "true", "{", "}", "[", "]", ":", ","],
            tokenizer = genlex.generator(keywords).tokenBetweenSpaces(token.builder);

        return tokenizer.chain(expr().thenLeft(parser.eos)).parse(source, 0);
    }
};

