---
name: Support CEL function signatures in hover
about: Show detailed function signatures and documentation on hover
title: '[Feature] Support CEL function signatures in hover'
labels: enhancement, hover
assignees: ''
---

## Description
Implement rich hover information for CEL functions, showing signatures, parameter types, return types, and documentation with examples.

## Current State
The current hover implementation in `src/lsp.rs:156-164`:
- Returns a static message "CEL Language Server"
- Doesn't inspect the hovered position
- No context-aware information
- No function signatures or documentation

## Proposed Features

### 1. Function Signatures
Display function signature when hovering over function names:

```
size(list: List<T>) -> int
size(map: Map<K, V>) -> int
size(string: string) -> int
size(bytes: bytes) -> int

Returns the number of elements in a list, map, string, or bytes.
```

### 2. Parameter Information
Show parameter details for function calls:

```
filter(list, predicate)
       ^^^^
list: List<T> - The list to filter
```

### 3. Type Information
Display inferred or declared types for variables and expressions:

```
age: int
The variable 'age' has type 'int'
```

### 4. Operator Documentation
Show operator precedence and behavior:

```
&& (Logical AND)
Evaluates to true if both operands are true.
Short-circuits: if left is false, right is not evaluated.
Precedence: 11
```

### 5. Macro Documentation
Provide information about CEL macros:

```
has(expr.field)
Macro for checking field presence.
Returns true if the field exists, false otherwise.
Expands to a has expression in CEL.
```

## Implementation Details

```rust
impl LanguageServer for Backend {
    async fn hover(&self, params: HoverParams) -> Result<Option<Hover>> {
        let uri = params.text_document_position_params.text_document.uri;
        let position = params.text_document_position_params.position;
        
        // 1. Get document content
        let content = self.get_document(&uri).await?;
        
        // 2. Parse and find symbol at position
        let symbol = self.find_symbol_at_position(&content, position)?;
        
        // 3. Generate hover content based on symbol type
        let hover_content = match symbol {
            Symbol::Function(name) => self.get_function_hover(name),
            Symbol::Variable(name) => self.get_variable_hover(name, &content),
            Symbol::Operator(op) => self.get_operator_hover(op),
            Symbol::Macro(name) => self.get_macro_hover(name),
            _ => return Ok(None),
        };
        
        Ok(Some(hover_content))
    }
}
```

### Hover Content Structure

#### Markdown Format
```markdown
## size

```cel
size(list: List<T>) -> int
size(map: Map<K, V>) -> int
```

Returns the size of a collection.

**Parameters:**
- `list` - A list of any type
- `map` - A map with any key/value types

**Returns:** The number of elements

**Examples:**
```cel
size([1, 2, 3])  // 3
size({})         // 0
size("hello")    // 5
```

**See also:** [CEL Standard Definitions](https://github.com/google/cel-spec/blob/master/doc/langdef.md#list-of-standard-definitions)
```

## Builtin Functions to Document

### String Functions
- [ ] `contains(string, substring) -> bool`
- [ ] `startsWith(string, prefix) -> bool`
- [ ] `endsWith(string, suffix) -> bool`
- [ ] `matches(string, pattern) -> bool`

### Collection Functions
- [ ] `size(collection) -> int`
- [ ] `filter(list, predicate) -> list`
- [ ] `map(list, transform) -> list`
- [ ] `all(list, predicate) -> bool`
- [ ] `exists(list, predicate) -> bool`

### Type Conversion
- [ ] `int(value) -> int`
- [ ] `uint(value) -> uint`
- [ ] `double(value) -> double`
- [ ] `string(value) -> string`
- [ ] `bytes(value) -> bytes`

### Time Functions
- [ ] `timestamp(string) -> timestamp`
- [ ] `duration(string) -> duration`
- [ ] `getDate(timestamp) -> int`
- [ ] `getMonth(timestamp) -> int`

### Math Functions
- [ ] `abs(number) -> number`
- [ ] `ceil(double) -> int`
- [ ] `floor(double) -> int`

## Testing Requirements
- [ ] Test hover on function names
- [ ] Test hover on variables
- [ ] Test hover on operators
- [ ] Test hover at different positions in expressions
- [ ] Test hover returns null when not over a symbol
- [ ] Test markdown rendering in hover content
- [ ] Test hover with overloaded functions

## User Experience
- Hover appears instantly on mouse over
- Formatted with syntax highlighting
- Links to external documentation
- Examples show common usage patterns
- Clear parameter and return type information

## Performance Considerations
- Cache function documentation
- Fast symbol lookup at position
- Limit hover content size
- Async hover generation

## References
- [CEL Builtin Functions](https://github.com/google/cel-spec/blob/master/doc/langdef.md#list-of-standard-definitions)
- [LSP Hover Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_hover)
- Current implementation: `src/lsp.rs:156-164`
- Related: Issue #2 (Completion items)
