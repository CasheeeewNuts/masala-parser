# Javascript Parser Combinators

[![Build Status](https://travis-ci.org/d-plaindoux/parsec.svg)](https://travis-ci.org/d-plaindoux/parsec) 
[![Coverage Status](https://coveralls.io/repos/d-plaindoux/parsec/badge.png?branch=master)](https://coveralls.io/r/d-plaindoux/parsec?branch=master) 
[![unstable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Javascript parser combinator implementation inspired by the paper titled:
[Direct Style Monadic Parser Combinators For The Real World](http://research.microsoft.com/en-us/um/people/daan/download/papers/parsec-paper.pdf).

## Tutorial

According to Wikipedia, 
*"In functional programming, a parser combinator is a higher-order function that accepts several parsers as input and returns a new parser as its output."* 

### Hello World

```
var P = require('parser'),
    S = require('stream');

var p = P.string("Hello").
            then(P.char(' ').rep()).
            thenRight(P.letter.rep());
            
p.parse(S.ofString("Hello World")).value.join() === "World"
```

### Character based parsers

Let `P` be the parser library.

```
P.digit             (1)
P.lowerCase         (2)
P.upperCase         (3)
P.char('h')         (4)
P.notChar('h')      (5)
P.string("hello")   (6)
```

1. Recognize a digit i.e. '0' ... '9'.
2. Recognize a lower case letter i.e. 'a' ... 'z'
3. Recognize a upper case letter i.e. 'A' ... 'A'
4. Recognize the character 'h'
5. Recognize any character except 'h'
6. Recognize the string "hello"

### 

## Specifications

### Stream constructors
- *ofString* : string -> Stream char
- *ofArray* : [a] -> Stream a
- *ofParser* : (Parse a c, Stream c) -> Stream a
- *buffered* : Stream a -> Stream a

### Parser

#### Basic constructors:
- *returns* : &forall; a c . a &rarr; Parser a c
- *error* : &forall; a c . unit &rarr; Parser a c
- *eos* : &forall; c . unit &rarr; Parser unit c
- *satisfy* : &forall; a . (a &rarr; bool) &rarr; Parser a a
- *try* : &forall; a c . Parser a c &rarr; Parser a c

#### Char sequence constructors:
- *digit* : Parser char char
- *lowerCase* : Parser char char
- *upperCase* : Parser char char
- *letter* : Parser char char
- *notChar* : char &rarr; Parser char char
- *aChar* : char &rarr; Parser char char
- *charLitteral* : Parser char char
- *stringLitteral* : Parser string char
- *numberLitteral* : Parser number char
- *aString* : string &rarr; Parser string char

#### Parser Combinators:
- *and* : &forall; a b c . **Parser a c** &rArr; Parser b c &rarr; Parser [a,b] c
- *andLeft* : &forall; a b c . **Parser a c** &rArr; Parser b c &rarr; Parser a c
- *andRight* : &forall; a b c . **Parser a c** &rArr; Parser b c &rarr; Parser b c
- *or* : &forall; a c . **Parser a c** &rArr; Parser a c &rarr; Parser a c
- *opt* : &forall; a c . **Parser a c** &rArr; unit &rarr; Parser (Option a) c
- *rep* : &forall; a c . **Parser a c** &rArr; unit &rarr; Parser (List a) c
- *optrep* : &forall; a c . **Parser a c** &rArr; unit &rarr; Parser (List a) c
- *match* : &forall; a c . **Parser a c** &rArr; Comparable a &rarr; Parser a c

#### Parser manipulation:
- *map* : &forall; a b c . **Parser a c** &rArr; (a &rarr; b) &rarr; Parser b c
- *flatmap* : &forall; a b c . **Parser a c** &rArr; (a &rarr; Parser b c) &rarr; Parser b c
- *filter* : &forall; a b c . **Parser a c** &rArr; (a &rarr; bool) &rarr; Parser a c

#### Chaining parsers by composition

- *chain* : Parser a b &rarr; Parser c a &rarr; Parser c b

#### Parser Main Function:
- *parse* : &forall; a c . **Parser a c** &rArr; Stream 'c &rarr; number &rarr; Response 'a

### Token

#### Token builder:
- *keyword* : string &rarr; Token 
- *ident* : string &rarr; Token 
- *number* : string &rarr; Token 
- *string* : string &rarr; Token 
- *char* : string &rarr; Token 

#### Token parser:
- *keyword* : Parser Token Token
- *ident* : Parser Token Token
- *number* : Parser Token Token 
- *string* : Parser Token Token 
- *char* : Parser Token Token

### Generic Lexer

#### Genlex factory:
- *keyword* : string &rarr; a
- *ident* : string &rarr; a
- *number* : number &rarr; a
- *string* : string &rarr; a
- *char* : char &rarr; a

#### Genlex generator:
- *keyword* : Genlex [String] &rArr; GenlexFactory a &rarr; Parser a char
- *ident* : Genlex [String] &rArr; GenlexFactory a &rarr; Parser a char
- *number* : Genlex [String] &rArr; GenlexFactory a &rarr; Parser a char
- *string* : Genlex [String] &rArr; GenlexFactory a &rarr; Parser a char
- *char* : Genlex [String] &rArr; GenlexFactory a &rarr; Parser a char
- *token* : Genlex [String] &rArr; GenlexFactory a &rarr; Parser a char
- *tokens* : Genlex [String] &rArr; GenlexFactory a &rarr; Parser [a] char

### Tokenizer

#### Tokenizer [String]
- *tokenize* : Tokenizer [String] &rArr; Stream char &rarr; Try [Token]

## License

Copyright (C)2016 D. Plaindoux.

This program is  free software; you can redistribute  it and/or modify
it  under the  terms  of  the GNU  Lesser  General  Public License  as
published by  the Free Software  Foundation; either version 2,  or (at
your option) any later version.

This program  is distributed in the  hope that it will  be useful, but
WITHOUT   ANY  WARRANTY;   without  even   the  implied   warranty  of
MERCHANTABILITY  or FITNESS  FOR  A PARTICULAR  PURPOSE.  See the  GNU
Lesser General Public License for more details.

You  should have  received a  copy of  the GNU  Lesser General  Public
License along with  this program; see the file COPYING.  If not, write
to the  Free Software Foundation,  675 Mass Ave, Cambridge,  MA 02139,
USA.



