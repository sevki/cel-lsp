---
name: Add support for CEL macros
about: Implement macro expansion and analysis for CEL macros
title: '[Feature] Add support for CEL macros'
labels: enhancement, macros
assignees: ''
---

## Description
Implement comprehensive support for CEL macros including expansion, validation, completion, and documentation for macro invocations.

## Background
CEL macros are syntactic sugar that expand into standard CEL expressions. Common macros include:
- `has(expr.field)` - Check if field exists
- `expr.all(x, predicate)` - Check if predicate is true for all elements
- `expr.exists(x, predicate)` - Check if predicate is true for any element
- `expr.exists_one(x, predicate)` - Check if predicate is true for exactly one element
- `expr.map(x, transform)` - Transform all elements
- `expr.filter(x, predicate)` - Filter elements by predicate

## Current State
- Basic function validation exists but no macro-specific handling
- No macro expansion visualization
- No macro-specific completion or hover
- No validation of macro-specific syntax

## Proposed Features

### 1. Macro Recognition
- [ ] Identify macro invocations in expressions
- [ ] Distinguish macros from regular functions
- [ ] Support all standard CEL macros
- [ ] Handle custom macro definitions (future)

### 2. Macro Expansion
- [ ] Show expanded form in diagnostics
- [ ] Visualize macro expansion on hover
- [ ] Provide "Expand Macro" code action
- [ ] Validate expanded form

### 3. Macro-Specific Validation
- [ ] Validate macro argument count
- [ ] Check predicate/transform function signatures
- [ ] Verify receiver types (list, map, etc.)
- [ ] Ensure proper closure variable usage

### 4. Enhanced Diagnostics
- [ ] Clear error messages for macro misuse
- [ ] Show both macro form and expanded form in errors
- [ ] Suggest corrections for common macro mistakes

## CEL Standard Macros

### 1. has() - Field Presence Check
```cel
has(message.field)
// Expands to: special has operator
// Used to check if optional field exists
```

**Validation:**
- [ ] Argument must be a field access expression
- [ ] Field must be on a message type
- [ ] Cannot use with list/map indices

### 2. all() - Universal Quantifier
```cel
numbers.all(x, x > 0)
// Expands to: !exists(numbers, x, !(x > 0))
// True if predicate holds for all elements
```

**Validation:**
- [ ] Receiver must be a list
- [ ] Must have exactly 2 arguments (variable, predicate)
- [ ] Predicate must return boolean
- [ ] Variable properly scoped in predicate

### 3. exists() - Existential Quantifier
```cel
numbers.exists(x, x > 100)
// True if predicate holds for at least one element
```

**Validation:**
- [ ] Same as `all()` macro
- [ ] Predicate must return boolean

### 4. exists_one() - Unique Existence
```cel
numbers.exists_one(x, x == 42)
// True if predicate holds for exactly one element
```

**Validation:**
- [ ] Same as `exists()` macro
- [ ] Ensure uniqueness check semantics

### 5. map() - List Transformation
```cel
numbers.map(x, x * 2)
// Creates new list with transformed elements
```

**Validation:**
- [ ] Receiver must be a list
- [ ] Transform expression properly typed
- [ ] Variable properly scoped

### 6. filter() - List Filtering
```cel
numbers.filter(x, x > 0)
// Creates new list with only matching elements
```

**Validation:**
- [ ] Receiver must be a list
- [ ] Predicate must return boolean
- [ ] Variable properly scoped

## Implementation Details

```rust
#[derive(Debug, Clone)]
pub enum MacroKind {
    Has,
    All,
    Exists,
    ExistsOne,
    Map,
    Filter,
}

#[derive(Debug)]
pub struct MacroInvocation {
    kind: MacroKind,
    receiver: Option<Expr>,  // For receiver.macro() syntax
    arguments: Vec<Expr>,
    location: Range,
}

pub struct MacroExpander {
    /// Expand a macro into its equivalent CEL expression
    pub fn expand(&self, macro_inv: &MacroInvocation) -> Result<Expr> {
        match macro_inv.kind {
            MacroKind::Has => self.expand_has(macro_inv),
            MacroKind::All => self.expand_all(macro_inv),
            MacroKind::Exists => self.expand_exists(macro_inv),
            // ... other macros
        }
    }
}

impl Backend {
    async fn validate_macro(&self, macro_inv: &MacroInvocation) -> Vec<Diagnostic> {
        let mut diagnostics = Vec::new();
        
        // Validate macro-specific constraints
        match macro_inv.kind {
            MacroKind::Has => {
                if !is_field_access(&macro_inv.arguments[0]) {
                    diagnostics.push(error("has() requires field access"));
                }
            }
            MacroKind::All | MacroKind::Exists | MacroKind::ExistsOne => {
                if macro_inv.arguments.len() != 2 {
                    diagnostics.push(error("requires 2 arguments"));
                }
                if !returns_bool(&macro_inv.arguments[1]) {
                    diagnostics.push(error("predicate must return boolean"));
                }
            }
            // ... other validations
        }
        
        diagnostics
    }
}
```

## Hover Information for Macros

```markdown
## has

```cel
has(expr.field) -> bool
```

**Macro**: Expands to field presence check

Checks if an optional field exists on a message.

**Parameters:**
- `expr.field` - A field access expression

**Returns:** `true` if field is present, `false` otherwise

**Example:**
```cel
has(message.optional_field)  // true if set
```

**Expands to:** Special has operator in CEL runtime

**Note:** Only works with message fields, not map keys or list indices.
```

## Code Actions

### "Expand Macro" Code Action
When cursor is on a macro invocation:
```
Action: Expand 'all' macro
Before: numbers.all(x, x > 0)
After:  !numbers.exists(x, !(x > 0))
```

### "Convert to Macro" Code Action
Recognize expandable patterns and suggest macro form:
```
Action: Convert to 'filter' macro
Before: numbers.filter(x, x > 0)  // if written in expanded form
After:  numbers.filter(x, x > 0)  // macro form
```

## Testing Requirements
- [ ] Test recognition of each macro type
- [ ] Test validation of macro arguments
- [ ] Test macro expansion correctness
- [ ] Test hover shows macro documentation
- [ ] Test completion includes macros
- [ ] Test code actions for macro expansion
- [ ] Test nested macro invocations
- [ ] Test error messages for macro misuse

## Error Examples

### Bad has() usage
```
Error: has() requires a field access expression
  --> line 1:5
   |
1  | has(x)
   |     ^ not a field access
   |
help: use has(expr.field) where 'field' is a message field
```

### Wrong predicate type
```
Error: Predicate must return boolean
  --> line 1:20
   |
1  | numbers.all(x, x * 2)
   |                ^^^^^ returns int, expected bool
   |
help: use a comparison like 'x > 0' that returns boolean
```

## References
- [CEL Macros Specification](https://github.com/google/cel-spec/blob/master/doc/langdef.md#macros)
- [cel-rust Macro Support](https://docs.rs/cel/)
- Current completion: `src/lsp.rs:136-154`
- Related: Issue #2 (Completion), Issue #5 (Hover)
