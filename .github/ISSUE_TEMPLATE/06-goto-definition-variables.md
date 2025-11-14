---
name: Implement go-to-definition for CEL variables
about: Enable navigation to variable definitions and references
title: '[Feature] Implement go-to-definition for CEL variables'
labels: enhancement, navigation
assignees: ''
---

## Description
Implement go-to-definition functionality to allow users to navigate from variable usage to its definition, and support finding all references to a variable.

## Current State
The current goto_definition implementation in `src/lsp.rs:166-173`:
- Returns `None` for all requests
- No variable tracking or reference analysis
- No definition location mapping

## Proposed Features

### 1. Variable Definition Tracking
- [ ] Track variable declarations in expressions
- [ ] Map variable usages to their definitions
- [ ] Support for function parameters as definitions
- [ ] Support for iteration variables (e.g., in `map`, `filter`)

### 2. Go-to-Definition
When user clicks on a variable with Ctrl/Cmd+Click:
- Jump to the location where the variable is defined
- Highlight the definition
- Support cross-document navigation (if applicable)

### 3. Find References
Find all usages of a variable:
- Show all locations where variable is referenced
- Highlight usage contexts
- Support for renaming all references

### 4. Symbol Navigation
- [ ] Navigate to function definitions (if custom functions exist)
- [ ] Navigate to field definitions in structured data
- [ ] Navigate to macro definitions

## CEL Variable Contexts

### 1. Iteration Variables
```cel
items.filter(x, x.active)
//           ^ definition here
//              ^ usage here
```

### 2. Function Parameters (future)
```cel
def compute(value) = value * 2
//          ^^^^^     ^^^^^ usage
//          definition
```

### 3. Comprehension Variables
```cel
[x * 2 for x in numbers]
//         ^ definition
// ^ usage
```

### 4. Let Bindings (if supported)
```cel
let x = 10 in x + 5
//  ^         ^ usage
//  definition
```

## Implementation Details

```rust
#[derive(Debug, Clone)]
pub struct VariableDefinition {
    name: String,
    location: Range,
    kind: VariableKind,
}

#[derive(Debug, Clone)]
pub enum VariableKind {
    IterationVar,      // x in map(list, x => x.field)
    ComprehensionVar,  // x in [x for x in list]
    Parameter,         // function parameter
    Binding,           // let binding
}

pub struct SymbolTable {
    variables: HashMap<String, Vec<VariableDefinition>>,
    references: HashMap<String, Vec<Range>>,
}

impl Backend {
    async fn goto_definition(
        &self,
        params: GotoDefinitionParams,
    ) -> Result<Option<GotoDefinitionResponse>> {
        let uri = params.text_document_position_params.text_document.uri;
        let position = params.text_document_position_params.position;
        
        // 1. Get document and parse
        let content = self.get_document(&uri).await?;
        let symbol_table = self.build_symbol_table(&content)?;
        
        // 2. Find symbol at cursor position
        let symbol_at_cursor = self.find_symbol_at_position(&content, position)?;
        
        // 3. Look up definition
        if let Some(def) = symbol_table.get_definition(&symbol_at_cursor) {
            return Ok(Some(GotoDefinitionResponse::Scalar(Location {
                uri,
                range: def.location,
            })));
        }
        
        Ok(None)
    }
}
```

## Symbol Table Construction

The symbol table needs to track:
1. **Scope hierarchy**: Variables visible at each position
2. **Definition locations**: Where each variable is defined
3. **Reference locations**: All usages of each variable
4. **Shadowing**: Handle variable shadowing in nested scopes

### Example Symbol Table
```
Expression: items.filter(x, x.active).map(y, y.name)

Symbols:
  - items: external variable (not defined in expression)
  - x: defined at position 13, used at position 16
  - y: defined at position 30, used at position 32
```

## Navigation Flow

1. **User Action**: Ctrl/Cmd+Click on variable name
2. **LSP Request**: `textDocument/definition` with position
3. **Server Processing**:
   - Parse document
   - Build symbol table
   - Find symbol at position
   - Look up definition
4. **Response**: Location of definition
5. **Client Action**: Navigate to definition location

## Testing Requirements
- [ ] Test goto definition for iteration variables
- [ ] Test with nested scopes (inner variable shadows outer)
- [ ] Test with multiple usages of same variable
- [ ] Test when definition is not found (external variables)
- [ ] Test with invalid positions
- [ ] Test find references functionality
- [ ] Test across multiple expressions in same document

## Advanced Features (Future)

### 1. Peek Definition
Show definition in a popup without navigating:
```
items.filter(x, x.active)
             └─ hover shows: x: defined in filter predicate
```

### 2. Definition Preview
Show context around definition:
```
Definition of 'x' at line 1, column 13:
  items.filter(x, ...)
               ^
```

### 3. Type Information
Show type along with definition:
```
x: Item (inferred from items: List<Item>)
```

## User Experience
- Instant navigation on Ctrl/Cmd+Click
- Breadcrumb trail for navigation history
- Highlight definition when navigated
- Visual indication of symbol under cursor
- Support for keyboard shortcuts

## References
- [LSP Go to Definition](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_definition)
- [LSP Find References](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_references)
- Current implementation: `src/lsp.rs:166-173`
- Related: Issue #1 (Parser and semantic analysis)
