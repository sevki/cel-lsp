---
name: Add CEL-specific completion items
about: Implement intelligent code completion for CEL language features
title: '[Feature] Add CEL-specific completion items'
labels: enhancement, completion
assignees: ''
---

## Description
Enhance the completion provider to offer context-aware suggestions for CEL expressions, including builtin functions, operators, variables, and field access.

## Current State
The current completion implementation in `src/lsp.rs:136-154` provides only two hardcoded completions (`size` and `matches`), which is insufficient for a productive development experience.

## Proposed Completion Categories

### 1. Builtin Functions
- [ ] String functions: `contains`, `startsWith`, `endsWith`, `matches`, `split`
- [ ] Collection functions: `size`, `filter`, `map`, `all`, `exists`, `exists_one`
- [ ] Type conversion: `int`, `uint`, `double`, `string`, `bytes`, `timestamp`, `duration`
- [ ] Math functions: `abs`, `ceil`, `floor`, `round`
- [ ] Time functions: `getDate`, `getMonth`, `getYear`, `getHours`, etc.

### 2. Operators
- [ ] Arithmetic: `+`, `-`, `*`, `/`, `%`
- [ ] Comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`
- [ ] Logical: `&&`, `||`, `!`
- [ ] Membership: `in`

### 3. Context-Aware Completions
- [ ] Variable completions based on document context
- [ ] Field access completions (after `.` trigger)
- [ ] Method completions based on receiver type
- [ ] Macro completions: `has`, `all`, `exists`, `filter`, `map`

### 4. Literals
- [ ] Boolean: `true`, `false`
- [ ] Null: `null`
- [ ] List constructors: `[]`
- [ ] Map constructors: `{}`

## Implementation Details

### Context Analysis
```rust
// Determine completion context based on cursor position
enum CompletionContext {
    TopLevel,           // Start of expression
    AfterDot,          // Member access: foo.|
    AfterOpenBracket,  // List/map access: foo[|
    FunctionArg,       // Inside function call: foo(|
}
```

### Completion Metadata
Each completion should include:
- `label`: The text to insert
- `kind`: Function, Variable, Keyword, etc.
- `detail`: Brief description
- `documentation`: Full documentation in Markdown
- `insertText`: Snippet with placeholders if needed

## Testing Requirements
- [ ] Test completion at various positions in expressions
- [ ] Test trigger characters (`.`, `[`, `(`)
- [ ] Test filtering based on typed prefix
- [ ] Test snippet expansion for functions with parameters

## User Experience
- Completions should appear as user types
- Triggered by `.` for member access
- Filtered in real-time based on user input
- Include parameter hints for functions

## References
- [CEL Builtin Functions](https://github.com/google/cel-spec/blob/master/doc/langdef.md#list-of-standard-definitions)
- Current implementation: `src/lsp.rs:136-154`
- LSP Completion Spec: [textDocument/completion](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_completion)
