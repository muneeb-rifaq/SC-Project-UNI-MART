// ============================================================================
// ProductQueryGrammar.g4 - ANTLR4 Grammar for Product Query Language
// ============================================================================
// This grammar defines the syntax for advanced product search queries
// 
// Example Queries:
//   name:"laptop" AND price < 1000
//   (category:"Electronics" OR category:"Books") AND stock > 0
//   price:100..500 AND seller:3
//   "gaming laptop"
// ============================================================================

grammar ProductQuery;

// ============================================================================
// PARSER RULES (Start with lowercase)
// ============================================================================

// Main entry point
query
    : orExpression EOF
    | EOF
    ;

// Logical OR (lowest precedence)
orExpression
    : andExpression (OR andExpression)*
    ;

// Logical AND
andExpression
    : notExpression (AND notExpression)*
    ;

// Logical NOT
notExpression
    : NOT primaryExpression
    | primaryExpression
    ;

// Primary expressions (parentheses, comparisons, field searches, text)
primaryExpression
    : LPAREN orExpression RPAREN
    | comparison
    | fieldSearch
    | rangeSearch
    | textSearch
    ;

// Field comparison: field OPERATOR value
comparison
    : IDENTIFIER comparisonOp value
    ;

comparisonOp
    : LT      // <
    | LTE     // <=
    | GT      // >
    | GTE     // >=
    | EQ      // = or ==
    | NEQ     // !=
    ;

// Field search: field:value or field:"value"
fieldSearch
    : IDENTIFIER COLON value
    ;

// Range search: field:min..max
rangeSearch
    : IDENTIFIER COLON NUMBER RANGE NUMBER
    ;

// Text search: "search term" (searches name and description)
textSearch
    : STRING
    ;

// Value can be string or number
value
    : STRING
    | NUMBER
    | IDENTIFIER
    ;

// ============================================================================
// LEXER RULES (Start with uppercase)
// ============================================================================

// Keywords
AND     : 'AND' | 'and' | '&&' ;
OR      : 'OR' | 'or' | '||' ;
NOT     : 'NOT' | 'not' | '!' ;

// Operators
LT      : '<' ;
LTE     : '<=' ;
GT      : '>' ;
GTE     : '>=' ;
EQ      : '=' | '==' ;
NEQ     : '!=' | '<>' ;
COLON   : ':' ;
RANGE   : '..' ;

// Parentheses
LPAREN  : '(' ;
RPAREN  : ')' ;

// Literals
NUMBER
    : [0-9]+ ('.' [0-9]+)?
    ;

STRING
    : '"' (~["\r\n])* '"'
    | '\'' (~['\r\n])* '\''
    ;

IDENTIFIER
    : [a-zA-Z_][a-zA-Z0-9_]*
    ;

// Whitespace
WS
    : [ \t\r\n]+ -> skip
    ;

// Comments (optional, for future use)
COMMENT
    : '//' ~[\r\n]* -> skip
    ;
