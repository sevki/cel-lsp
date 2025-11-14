---
name: Implement CEL expression validation
about: Enhance expression validation with detailed error reporting and type checking
title: '[Feature] Implement CEL expression validation'
labels: enhancement, validation
assignees: ''
---

## Description
Improve CEL expression validation beyond basic compilation errors to include type checking, semantic validation, and detailed error reporting with precise source locations.

## Current State
Current validation in `src/lsp.rs:25-60` uses basic `Program::compile()` which:
- Reports compilation errors as a single diagnostic at position 0
- Doesn't provide precise error locations
- Lacks detailed error messages
- Doesn't perform advanced semantic checks

## Proposed Enhancements

### 1. Precise Error Locations
- [ ] Parse error position information from CEL compiler
- [ ] Map errors to exact line and column in the source
- [ ] Highlight the specific token or expression causing the error
- [ ] Support multi-line error ranges

### 2. Type Validation
- [ ] Verify type compatibility in operations (e.g., `1 + "string"` should error)
- [ ] Check function argument types match signatures
- [ ] Validate field access on appropriate types
- [ ] Ensure conditional expressions have boolean conditions
- [ ] Verify map/list access operations

### 3. Semantic Validation
- [ ] Undefined variable references
- [ ] Invalid field access on objects
- [ ] Incorrect number of function arguments
- [ ] Invalid macro usage
- [ ] Unreachable code detection

### 4. Runtime Validation (Optional)
- [ ] Division by zero detection
- [ ] Potential null pointer access
- [ ] Out of bounds array access
- [ ] Integer overflow/underflow warnings

## Implementation Approach

```rust
pub struct ValidationResult {
    diagnostics: Vec<Diagnostic>,
    warnings: Vec<Diagnostic>,
    ast: Option<Ast>,  // Parsed AST if successful
}

impl Backend {
    async fn validate_document_enhanced(&self, uri: Url, content: &str) -> ValidationResult {
        // 1. Parse to AST
        // 2. Perform semantic analysis
        // 3. Type checking
        // 4. Generate detailed diagnostics
    }
}
```

### Error Categories
- **Syntax Errors**: Parse failures, malformed expressions
- **Type Errors**: Type mismatches, invalid operations
- **Semantic Errors**: Undefined references, invalid usage
- **Warnings**: Dead code, unused variables, style issues

## Diagnostic Quality

### Good Error Message Example
```
Error: Type mismatch in addition
  --> line 1, column 5-12
   |
 1 | x + "hello"
   |     ^^^^^^^ expected number, found string
   |
help: convert the string to a number using int() function
```

### Current Error Message
```
CEL compilation error: [generic error message]
Range: entire line
```

## Testing Requirements
- [ ] Test suite for each error category
- [ ] Verify error positions are accurate
- [ ] Test complex nested expressions
- [ ] Validate error message clarity
- [ ] Test recovery from errors (continue parsing)

## Performance Considerations
- Cache validation results per document version
- Incremental re-validation on changes
- Async validation to avoid blocking
- Timeout for very large expressions

## References
- [LSP Diagnostic Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic)
- Current implementation: `src/lsp.rs:25-60`
- [CEL Type System](https://github.com/google/cel-spec/blob/master/doc/langdef.md#type-system)
