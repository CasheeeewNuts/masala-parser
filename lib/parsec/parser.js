/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */

 /*
  * Parsec: Direct Style Monadic Parser Combinators For The Real World
  * 
  * http://research.microsoft.com/en-us/um/people/daan/download/papers/parsec-paper.pdf
  */

module.exports = (function () {
    
    'use strict';
    
    var response = require('./response.js'),
        option = require('../data/option.js');
    
    // Stream 'c -> number -> Response 'a 'c -> Parser 'a 'c
    function Parser(parse) {
        this.parse = parse;
    }
    
    // Parser 'a 'c => ('a -> Parser 'b 'c) -> Parser 'b 'c
    Parser.prototype.bind = function(f) {
        var self = this;

        return new Parser(function(input,index) {
           return self.parse(input,index).fold(
               function(accept) {
                   return f(accept.value).parse(accept.input,accept.index).fold(
                       function(accept_b) {
                           return response.accept(
                               accept_b.value, 
                               accept_b.input, 
                               accept_b.offset, 
                               accept.consumed || accept_b.consumed
                           ); 
                       },
                       function(reject) {
                           return response.reject(
                               reject.offset, 
                               accept.consumed || reject.consumed
                           );
                       }                       
                   );
               },
               function(reject) {
                   return reject;
               }
           ); 
        });
    };
    
    // Parser 'a 'c => Parser 'a 'c -> Parser 'a 'c
    Parser.prototype.choice = function(q) {
        var self = this;

        return new Parser(function(input,index) {
            return self.parse(input, index).fold(
                function (accept) {
                    return accept;
                },
                function (reject) {
                    if (reject.consumed) {
                        return reject;
                    } else {                    
                        return q.parse(input,index);
                    }
                }
            );
        });
    };
    
    // Parser 'a 'c => ('a -> Parser 'b 'c) -> Parser 'b 'c
    Parser.prototype.flatmap = function(f) {
      return this.bind(f);  
    };
    
    // Parser 'a 'c => ('a -> 'b) -> Parser 'b 'c
    Parser.prototype.map = function(f) {
        var self = this;
        
        return new Parser(function(input,index) {
           return self.parse(input,index).map(f); 
        });
    };
    
    // Parser 'a 'c => ('a -> boolean) -> Parser 'a 'c
    Parser.prototype.filter = function(p) {
        var self = this;
        
        return new Parser(function(input,index) {
           return self.parse(input,index).filter(p); 
        });
    };
    
    // Parser 'a 'c => Comparable 'a -> Parser 'a 'c
    Parser.prototype.match = function(v) {
        return this.filter(function(a) {
            return a === v;
        });
    };
    
    // Parser 'a 'c => Parser 'b 'c -> Parser ('a,'b) 'c
    Parser.prototype.then = function(p) {
        return this.flatmap(function(a) {
            return p.map(function(b) {
                return [a,b];
            });
        });
    };
    
    // Parser 'a 'c => Parser 'b 'c -> Parser 'b 'c
    Parser.prototype.thenRight = function(p) {
        return this.and(p)[1];
    };
    
    // Parser 'a 'c => Parser 'b 'c -> Parser 'a 'c
    Parser.prototype.thenLeft = function(p) {
        return this.and(p)[0];
    };
    
    // Parser 'a 'c -> Parser 'a 'c
    Parser.prototype.or = function(p) {
        return this.choice(p);
    };
    
    // Parser 'a 'c => unit -> Parser (Option 'a) 'c
    Parser.prototype.opt = function() {
        return this.map(option.some).or(returns(option.empty()));
    };
    
    // Parser 'a 'c => unit -> Parser (List 'a) 'c
    Parser.prototype.rep = function() {
        var self = this;
        return self.flatmap(function(a) {
            return self.optrep().map(function(b) {
                return [a].concat(b.orElse([]));
            });
        });

    };
    
    // Parser 'a 'c => unit -> Parser (Option (List 'a)) 'c
    Parser.prototype.optrep = function() {
        return this.rep().opt();
    };
    
    // 'a -> Parser 'a 'c
    function returns(v) {
        return new Parser(function(input,index) {
            return response.accept(v, input, index, false);
        });
    }
    
    // unit -> Parser 'a 'c
    function error() {
        return new Parser(function(input,index) {
            return response.reject(index, false);
        });
    }
    
    // unit -> Parser unit 'c
    function eos() {
        return new Parser(function(input,index) {
            if (input.endOfStream(index)) {
                return response.accept(null, input, index, false);   
            } else {
                return response.reject(index, false);                
            }
        });        
    }
        
    // ('a -> boolean) -> Parser a 'c
    function satisfy(predicate) {
        return new Parser(function(input,index) {
            return input.get(index).filter(predicate).map(function(value) {
                return response.accept(value, input, index+1, true);
            }).lazyRecoverWith(function() {
                return response.reject(index, false); 
            });            
        });
    }
        
    // Parser 'a 'c -> Parser 'a 'c
    function doTry(p) {
        return new Parser(function(input,index) {
            return p.parse(input,index).fold(
                function(accept) {
                    return accept;
                },
                function(reject) {
                    return response.reject(reject.index, false);
                }
            );
        });
    }
    
    // unit -> Parser char char
    function digit() {
        return satisfy(function(v) {
            return '0' <= v && v <= '9'; 
        });
    }
     
    // unit -> Parser char char
    function lowerCase() {
        return satisfy(function(v) {
            return 'a' <= v && v <= 'z'; 
        });
    }
    
    // unit -> Parser char char
    function upperCase() {
        return satisfy(function(v) {
            return 'A' <= v && v <= 'Z'; 
        });
    }
        
    // unit -> Parser char char
    function letter() {
        return lowerCase().or(upperCase());
    }
    
    // char -> Parser char char
    function notChar(c) {
        return satisfy(function(v) {
           return c !== v; 
        });
    }
    
    // char -> Parser char char
    function char(c) {
        return satisfy(function(v) {
           return c === v; 
        });
    }
        
    // unit -> Parser char char
    function charLiteral() {
        var anyChar = char('\\').thenRight('\'').or(notChar('\''));
        return char('\'').thenRight(anyChar).thenLeft(char('\''));
    }
    
    // unit -> Parser string char
    function stringLiteral() {
        var anyChar = char('\\').thenRight('"').or(notChar('"'));
        return char('"').thenRight(anyChar.optrep()).thenLeft(char('"')).map(function(r){
           return r.map(function(chars) {
               return chars.join("");
           }).orElse("");
        });
    }
    
    // unit -> Parser number char
    function numberLiteral() {
        return digit.rep().map(function(d) {
            return parseInt(d.join(""), 10);
        });
    }
    
    return {
        parsec: function(parse) { 
            return new Parser(parse); 
        },
        returns: returns,
        error: error,
        eos: eos,
        satisfy: satisfy,
        try: doTry,
        digit: digit,
        lowerCase:lowerCase,
        upperCase:upperCase,
        letter: letter,
        notChar: notChar,
        char: char,
        charLiteral: charLiteral,
        stringLiteral : stringLiteral,
        numberLiteral : numberLiteral
    };
    
}());