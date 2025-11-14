---
name: Add diagnostics for CEL syntax errors
about: Implement comprehensive syntax error diagnostics with actionable messages
title: '[Feature] Add diagnostics for CEL syntax errors'
labels: enhancement, diagnostics
assignees: ''
---

## Description
Enhance diagnostic reporting for CEL syntax errors with precise locations, helpful messages, and quick fix suggestions.

## Current State
The current diagnostic system in `src/lsp.rs:25-60`:
- Reports errors at position (0, 0)
- Uses full line length as error range
- Provides generic error messages from the compiler
- No support for warnings or information messages
- No quick fixes or suggestions

## Proposed Features

### 1. Accurate Error Positioning
- [ ] Parse column and line information from CEL compiler errors
- [ ] Highlight exact tokens causing errors
- [ ] Support for multi-line error ranges
- [ ] Underline specific problematic code sections

### 2. Error Categories

#### Syntax Errors
- [ ] Missing operators (e.g., `x y` instead of `x + y`)
- [ ] Unmatched parentheses, brackets, braces
- [ ] Invalid tokens or characters
- [ ] Incomplete expressions
- [ ] Missing semicolons or delimiters

#### Parse Errors
- [ ] Unexpected end of input
- [ ] Expected token not found
- [ ] Invalid expression structure
- [ ] Malformed literals (strings, numbers)

### 3. Diagnostic Severity Levels
- [ ] **Error**: Prevents compilation, must be fixed
- [ ] **Warning**: Potentially problematic but valid
- [ ] **Information**: Style suggestions, best practices
- [ ] **Hint**: Optimization opportunities

### 4. Enhanced Error Messages

#### Current
```
CEL compilation error: syntax error
```

#### Proposed
```
Syntax Error: Expected ')' to close parenthesis
  --> expression.cel:1:15
   |
 1 | (1 + 2 * (3 + 4
   |               ^ unclosed parenthesis, insert ')' here
   |
help: add ')' to close the parenthesis opened at column 10
```

### 5. Quick Fixes (Code Actions)
- [ ] Insert missing closing brackets/parentheses
- [ ] Fix common typos in function names
- [ ] Add missing operators
- [ ] Convert invalid syntax to valid alternatives

## Implementation Details

```rust
#[derive(Debug)]
pub struct DetailedDiagnostic {
    range: Range,
    severity: DiagnosticSeverity,
    code: Option<String>,           // Error code like "CEL001"
    message: String,
    related_info: Vec<DiagnosticRelatedInformation>,
    quick_fixes: Vec<CodeAction>,   // Suggested fixes
}

impl Backend {
    async fn generate_diagnostics(&self, content: &str) -> Vec<Diagnostic> {
        // Parse error details from CEL compiler
        // Map to precise locations
        // Generate helpful messages
        // Add quick fix suggestions
    }
}
```

### Error Codes
Define standard error codes for common issues:
- `CEL001`: Syntax error
- `CEL002`: Unexpected token
- `CEL003`: Unclosed delimiter
- `CEL004`: Invalid literal
- `CEL005`: Incomplete expression

## Diagnostic Features

### Related Information
Link multiple related errors:
```
Error: Unclosed string literal
  --> line 5
   |
5  | message = "hello world
   |           ^^^^^^^^^^^^ string not closed
   |
note: string started here
  --> line 5
   |
5  | message = "hello world
   |           ^ opening quote
```

### Tags
- `Deprecated`: For deprecated syntax
- `Unnecessary`: For unused code

## Testing Requirements
- [ ] Test each syntax error category
- [ ] Verify diagnostic positions are accurate
- [ ] Test quick fixes apply correctly
- [ ] Test diagnostic updates on document changes
- [ ] Test multiple diagnostics in one document
- [ ] Test diagnostic clearing when errors are fixed

## User Experience
- Diagnostics appear in real-time as user types
- Errors show with red squiggles
- Warnings show with yellow squiggles
- Quick fixes available via code actions (💡 icon)
- Clear, actionable error messages

## References
- [LSP Diagnostic Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic)
- [LSP Code Action](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_codeAction)
- Current implementation: `src/lsp.rs:25-60`
- Related: Issue #3 (CEL expression validation)
