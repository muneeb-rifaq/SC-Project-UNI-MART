# Parser Generator Module - Complete Documentation

## 📚 Overview

This is a complete **ANTLR-style Parser Generator** for the Product Query Language. It implements a full compiler pipeline:

**Lexer → Parser → AST → Evaluator**

---

## 🏗️ Architecture

### Module Structure

```
src/frontend/unimartFrontend/src/parsers/
├── ProductQueryGrammar.g4    # ANTLR grammar definition
├── Lexer.js                  # Lexical analyzer (tokenizer)
├── Parser.js                 # Syntax analyzer (AST builder)
├── Evaluator.js              # Query executor
└── ProductQueryEngine.js     # Main interface (facade)
```

### Separation of Concerns

#### 1. **Grammar (ProductQueryGrammar.g4)**

- ANTLR4 grammar specification
- Defines syntax rules
- Documents language specification
- Serves as reference for implementation

#### 2. **Lexer (Lexer.js)**

- **Input**: String
- **Output**: Token stream
- **Responsibility**: Break input into lexical units
- **Pattern**: Finite Automaton

#### 3. **Parser (Parser.js)**

- **Input**: Token stream
- **Output**: Abstract Syntax Tree (AST)
- **Responsibility**: Validate syntax, build tree structure
- **Pattern**: Recursive Descent

#### 4. **Evaluator (Evaluator.js)**

- **Input**: AST + Product dataset
- **Output**: Filtered products
- **Responsibility**: Execute queries
- **Pattern**: Visitor

#### 5. **Engine (ProductQueryEngine.js)**

- **Pattern**: Facade
- **Responsibility**: Coordinate all modules
- **Interface**: Simple public API

---

## 🔤 Query Language Syntax

### Basic Queries

```
// Text search (searches name + description)
"laptop"

// Field search
name:"laptop"
price:500
stock:10

// Comparisons
price < 1000
stock >= 5
price <= 500

// Range search
price:100..500
```

### Logical Operators

```
// AND (both conditions must be true)
price < 1000 AND stock > 0

// OR (either condition can be true)
category:"Electronics" OR category:"Books"

// NOT (negation)
NOT stock:0
```

### Complex Queries

```
// Grouping with parentheses
(price < 500 OR stock > 100) AND category:"Electronics"

// Multiple conditions
name:"laptop" AND price:500..1500 AND stock > 0 AND NOT seller:3

// Category filtering
(category:"Books" OR category:"Electronics") AND price < 100
```

### Field Names

| Field                 | Type   | Example                  |
| --------------------- | ------ | ------------------------ |
| `name`                | string | `name:"laptop"`          |
| `description`         | string | `description:"gaming"`   |
| `price`               | number | `price < 1000`           |
| `stock`               | number | `stock:10..50`           |
| `seller` / `sellerId` | number | `seller:2`               |
| `category`            | string | `category:"Electronics"` |
| `categoryId`          | number | `categoryId:3`           |
| `productId`           | number | `productId:42`           |

### Operators

| Operator    | Meaning          | Example          |
| ----------- | ---------------- | ---------------- |
| `:`         | Field equals     | `name:"laptop"`  |
| `<`         | Less than        | `price < 500`    |
| `<=`        | Less or equal    | `price <= 500`   |
| `>`         | Greater than     | `stock > 0`      |
| `>=`        | Greater or equal | `stock >= 10`    |
| `=` / `==`  | Equals           | `seller = 3`     |
| `!=` / `<>` | Not equals       | `stock != 0`     |
| `..`        | Range            | `price:100..500` |

### Keywords

| Keyword | Alias       | Meaning     |
| ------- | ----------- | ----------- | --- | ---------- |
| `AND`   | `and`, `&&` | Logical AND |
| `OR`    | `or`, `     |             | `   | Logical OR |
| `NOT`   | `not`, `!`  | Logical NOT |

---

## 💻 Usage Examples

### Basic Usage

```javascript
import ProductQueryEngine from "./parsers/ProductQueryEngine";

const products = [
  { productId: 1, name: "Laptop", price: 999, stock: 5, categoryId: 1 },
  { productId: 2, name: "Mouse", price: 25, stock: 100, categoryId: 2 },
  // ...
];

const categories = [
  { categoryId: 1, name: "Electronics" },
  { categoryId: 2, name: "Accessories" },
];

// Create engine
const engine = new ProductQueryEngine(products, categories);

// Execute query
const result = engine.execute("price < 1000 AND stock > 0");

if (result.success) {
  console.log("Found products:", result.results);
} else {
  console.error("Error:", result.error);
}
```

### Advanced Usage

```javascript
// Validate query syntax
const validation = engine.validate("price < abc"); // Invalid
console.log(validation.valid); // false
console.log(validation.error); // Error message

// Get AST for debugging
const ast = engine.getAST("price < 1000");
console.log(ast);

// Get tokens for debugging
const tokens = engine.getTokens('name:"laptop"');
console.log(tokens);
```

---

## 🔍 Implementation Details

### 1. Lexer (Tokenizer)

**Purpose**: Convert string input into tokens

**Algorithm**: Finite Automaton with lookahead

**Token Types**:

- Keywords: AND, OR, NOT
- Operators: <, <=, >, >=, =, !=
- Literals: NUMBER, STRING, IDENTIFIER
- Delimiters: (, ), :, ..

**Example**:

```
Input:  "price < 1000 AND stock > 0"
Output: [
  Token(IDENTIFIER, 'price', 0),
  Token(LT, '<', 6),
  Token(NUMBER, 1000, 8),
  Token(AND, 'AND', 13),
  Token(IDENTIFIER, 'stock', 17),
  Token(GT, '>', 23),
  Token(NUMBER, 0, 25),
  Token(EOF, null, 26)
]
```

### 2. Parser (Syntax Analyzer)

**Purpose**: Build Abstract Syntax Tree from tokens

**Algorithm**: Recursive Descent Parser

**Grammar Productions**:

```
query → orExpression EOF
orExpression → andExpression (OR andExpression)*
andExpression → notExpression (AND notExpression)*
notExpression → NOT primaryExpression | primaryExpression
primaryExpression → ( orExpression ) | comparison | fieldSearch | rangeSearch | textSearch
```

**AST Node Types**:

- `BinaryOpNode` - AND, OR operations
- `UnaryOpNode` - NOT operation
- `ComparisonNode` - field < value
- `FieldSearchNode` - field:value
- `RangeSearchNode` - field:min..max
- `TextSearchNode` - "text"

**Example**:

```
Input:  price < 1000 AND stock > 0
AST:    BinaryOpNode(AND)
         ├─ ComparisonNode(price, <, 1000)
         └─ ComparisonNode(stock, >, 0)
```

### 3. Evaluator (Query Executor)

**Purpose**: Execute queries against product dataset

**Pattern**: Visitor pattern (traverse AST)

**Method**: evaluateNode(product, astNode)

- Recursively evaluates each node
- Returns boolean (match/no-match)
- Filters product array

**Example**:

```javascript
// AST: price < 1000 AND stock > 0
// Product: { price: 800, stock: 5 }

evaluateNode(product, binaryOpNode):
  left = evaluateNode(product, comparisonNode(price < 1000))
         → 800 < 1000 → true
  right = evaluateNode(product, comparisonNode(stock > 0))
          → 5 > 0 → true
  return left AND right → true AND true → true
```

---

## 🧪 Testing

### Test Cases

```javascript
// 1. Simple field search
engine.execute('name:"laptop"');
// Returns: products with "laptop" in name

// 2. Price range
engine.execute("price:100..500");
// Returns: products with price between 100-500

// 3. Logical AND
engine.execute("price < 1000 AND stock > 0");
// Returns: affordable products in stock

// 4. Logical OR
engine.execute('category:"Books" OR category:"Electronics"');
// Returns: products in either category

// 5. NOT operator
engine.execute("NOT stock:0");
// Returns: products that are in stock

// 6. Parentheses
engine.execute('(price < 500 OR stock > 100) AND category:"Electronics"');
// Returns: cheap OR abundant electronics

// 7. Complex query
engine.execute(
  'name:"laptop" AND price:500..1500 AND stock > 0 AND NOT seller:3'
);
// Returns: laptops in price range, in stock, not from seller 3
```

### Edge Cases

```javascript
// Empty query
engine.execute(""); // Returns all products

// Invalid syntax
engine.execute("price <<< 1000"); // Returns error

// Unknown field
engine.execute("unknown:value"); // Returns no products (graceful)

// Mixed types
engine.execute('price:"abc"'); // Handled gracefully
```

---

## ⚡ Performance

### Complexity Analysis

| Operation  | Complexity   | Notes                        |
| ---------- | ------------ | ---------------------------- |
| Lexing     | O(n)         | n = input length             |
| Parsing    | O(t)         | t = token count              |
| Evaluation | O(p × h)     | p = products, h = AST height |
| Total      | O(n + p × h) | Linear in products           |

### Optimizations

1. **Single Pass Lexing**: One character read per position
2. **Recursive Descent**: No backtracking needed
3. **Short-Circuit Evaluation**: AND/OR stop early when possible
4. **Field Lookup Map**: O(1) field value retrieval

---

## 🎯 Integration with UI

### ProductSearchFilter Component

```jsx
// Toggle between simple and advanced search
const [useAdvancedParser, setUseAdvancedParser] = useState(false);

// Use parser when enabled
if (useAdvancedParser && searchText.trim()) {
  const engine = new ProductQueryEngine(products, categories);
  const result = engine.execute(searchText);

  if (result.success) {
    filtered = result.results;
    setParseError("");
  } else {
    setParseError(result.error);
    // Fallback to simple search
  }
}
```

### UI Features

- **Toggle**: Checkbox to enable advanced mode
- **Placeholder**: Shows example query when enabled
- **Error Display**: Shows parser errors in red box
- **Help Text**: Shows examples when typing
- **Fallback**: Uses simple search on parse error

---

## 📖 Grammar Reference

### ANTLR4 Grammar File

See [ProductQueryGrammar.g4](./ProductQueryGrammar.g4) for complete EBNF specification.

**Key Grammar Rules**:

```antlr
grammar ProductQuery;

query
    : orExpression EOF
    | EOF
    ;

orExpression
    : andExpression (OR andExpression)*
    ;

andExpression
    : notExpression (AND notExpression)*
    ;

primaryExpression
    : LPAREN orExpression RPAREN
    | comparison
    | fieldSearch
    | rangeSearch
    | textSearch
    ;
```

---

## 🔄 Data Flow

```
┌─────────────┐
│ User Input  │ "price < 1000 AND stock > 0"
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Lexer     │ Tokenize
├─────────────┤
│ - readChar  │
│ - getToken  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Token Array │ [IDENTIFIER, LT, NUMBER, AND, ...]
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Parser    │ Build AST
├─────────────┤
│ - parseExpr │
│ - buildNode │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     AST     │ BinaryOpNode(AND, ...)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Evaluator  │ Execute Query
├─────────────┤
│ - evalNode  │
│ - filter    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Filtered   │ [product1, product2, ...]
│  Products   │
└─────────────┘
```

---

## 🛠️ Extending the Parser

### Adding New Operators

1. Update grammar in `ProductQueryGrammar.g4`
2. Add token type in `Lexer.js`
3. Add lexer rule in `Lexer.getNextToken()`
4. Update parser rules if needed
5. Add evaluation logic in `Evaluator.js`

### Example: Adding LIKE operator

```javascript
// 1. Grammar (already supports via IDENTIFIER)
// field LIKE "pattern"

// 2. Lexer.js
export const TokenType = {
  // ...
  LIKE: 'LIKE',
};

// 3. Lexer.readIdentifier()
if (upper === 'LIKE') {
  return new Token(TokenType.LIKE, 'LIKE', startPos);
}

// 4. Parser - add to comparison operators
isComparisonOperator() {
  return [..., TokenType.LIKE].includes(this.currentToken.type);
}

// 5. Evaluator - add LIKE logic
evaluateComparison(product, node) {
  // ...
  case 'LIKE':
    return this.matchPattern(fieldValue, node.value);
}
```

---

## 📊 Examples by Use Case

### E-Commerce Search

```javascript
// Find affordable laptops in stock
"name:laptop AND price < 1000 AND stock > 0";

// Find products from specific sellers
"(seller:1 OR seller:2) AND stock > 0";

// Find out-of-stock items
"stock:0";
```

### Inventory Management

```javascript
// Low stock alert
"stock:0..10";

// Expensive items
"price > 1000";

// Category + stock check
"category:Electronics AND stock:0";
```

### Analytics

```javascript
// Price distribution
"price:0..100"; // Budget
"price:100..500"; // Mid-range
"price:500..9999"; // Premium
```

---

## 🐛 Error Handling

### Parse Errors

```javascript
// Syntax error
Input: "price << 1000";
Error: "Unexpected character '<' at position 7";

// Missing operand
Input: "price AND";
Error: "Expected value but got EOF at position 9";

// Unmatched parenthesis
Input: "(price < 1000";
Error: "Expected ) but got EOF at position 13";
```

### Graceful Degradation

- Parse errors return all products
- Unknown fields return no matches (not crash)
- Invalid values handled with type coercion

---

## 🎓 Learning Outcomes

### Concepts Demonstrated

1. **Compiler Theory**: Full pipeline implementation
2. **Finite Automata**: Lexer token recognition
3. **Grammar Design**: ANTLR4 specification
4. **Recursive Descent**: Parser algorithm
5. **AST**: Tree data structure
6. **Visitor Pattern**: AST traversal
7. **Facade Pattern**: Simple public interface
8. **Separation of Concerns**: Modular architecture

---

## 📝 Summary

The Parser Generator Module provides a professional-grade query language for product search with:

- ✅ **Complete ANTLR grammar** specification
- ✅ **Separated modules** (Lexer, Parser, Evaluator)
- ✅ **Full compiler pipeline** implementation
- ✅ **Rich query syntax** with operators, parentheses, ranges
- ✅ **Error handling** with graceful fallback
- ✅ **Performance optimized** for client-side execution
- ✅ **Well-documented** with examples and tests
- ✅ **UI integration** with toggle and help text

**Impact**: Users can now write powerful, expressive queries to find exactly what they need!
