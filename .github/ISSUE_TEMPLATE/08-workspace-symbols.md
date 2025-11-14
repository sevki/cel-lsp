---
name: Implement workspace symbols
about: Enable workspace-wide symbol search and navigation
title: '[Feature] Implement workspace symbols'
labels: enhancement, navigation
assignees: ''
---

## Description
Implement workspace symbol search to allow users to quickly find and navigate to functions, variables, and other symbols across all CEL files in the workspace.

## Current State
- No workspace symbol support
- No global symbol index
- No cross-file navigation
- Single document focus only

## Proposed Features

### 1. Workspace Symbol Provider
Implement `workspace/symbol` LSP method to:
- [ ] Search symbols across all documents
- [ ] Return ranked results based on query
- [ ] Support fuzzy matching
- [ ] Filter by symbol kind (function, variable, etc.)

### 2. Symbol Indexing
- [ ] Build and maintain workspace-wide symbol index
- [ ] Update index on document changes
- [ ] Efficient incremental updates
- [ ] Persist index between sessions (optional)

### 3. Symbol Types
Track and index these symbol types:
- [ ] Functions (builtin and custom)
- [ ] Variables and constants
- [ ] Macros
- [ ] Type definitions (if CEL supports custom types)
- [ ] Configuration symbols

### 4. Search Capabilities
- [ ] Prefix matching: "fil" matches "filter"
- [ ] Fuzzy matching: "fltr" matches "filter"
- [ ] CamelCase matching: "SN" matches "StartsWith"
- [ ] Ranking based on relevance
- [ ] Filter by symbol kind

## Implementation Details

```rust
#[derive(Debug, Clone)]
pub struct WorkspaceSymbol {
    name: String,
    kind: SymbolKind,
    location: Location,
    container_name: Option<String>,  // Containing scope/document
    detail: Option<String>,           // Type info, signature, etc.
}

pub struct SymbolIndex {
    symbols: Vec<WorkspaceSymbol>,
    name_index: HashMap<String, Vec<usize>>,  // Fast name lookup
    kind_index: HashMap<SymbolKind, Vec<usize>>, // Filter by kind
}

impl SymbolIndex {
    pub fn search(&self, query: &str) -> Vec<WorkspaceSymbol> {
        // 1. Find matching symbols
        let matches = self.find_matches(query);
        
        // 2. Rank by relevance
        let ranked = self.rank_matches(matches, query);
        
        // 3. Return top results
        ranked.into_iter().take(50).collect()
    }
    
    fn rank_matches(&self, matches: Vec<&WorkspaceSymbol>, query: &str) -> Vec<WorkspaceSymbol> {
        // Ranking factors:
        // - Exact match > prefix match > fuzzy match
        // - Shorter names ranked higher
        // - More recently used ranked higher
        // - Symbol kind priority (functions > variables)
    }
}

impl LanguageServer for Backend {
    async fn symbol(&self, params: WorkspaceSymbolParams) -> Result<Option<Vec<SymbolInformation>>> {
        let query = params.query;
        
        // Search the workspace index
        let results = self.symbol_index.read().await.search(&query);
        
        // Convert to LSP SymbolInformation
        let symbols = results.into_iter()
            .map(|s| SymbolInformation {
                name: s.name,
                kind: s.kind,
                location: s.location,
                container_name: s.container_name,
                deprecated: None,
                tags: None,
            })
            .collect();
        
        Ok(Some(symbols))
    }
}
```

## Symbol Kinds

Map CEL constructs to LSP SymbolKind:
```rust
pub enum SymbolKind {
    Function = 12,    // size, filter, map, custom functions
    Variable = 13,    // iteration vars, let bindings
    Constant = 14,    // true, false, null
    Field = 8,        // message fields
    Method = 6,       // receiver methods
}
```

## Index Management

### Building the Index
```rust
impl Backend {
    async fn rebuild_index(&self) {
        let mut index = SymbolIndex::new();
        
        // Index all documents
        for (uri, content) in self.documents.read().await.iter() {
            let symbols = self.extract_symbols(uri, content).await;
            index.add_symbols(symbols);
        }
        
        // Update the workspace index
        *self.symbol_index.write().await = index;
    }
    
    async fn extract_symbols(&self, uri: &Url, content: &str) -> Vec<WorkspaceSymbol> {
        // Parse document
        // Extract all symbol definitions
        // Create WorkspaceSymbol entries
    }
}
```

### Incremental Updates
```rust
impl Backend {
    async fn update_document_symbols(&self, uri: &Url, content: &str) {
        let new_symbols = self.extract_symbols(uri, content).await;
        
        let mut index = self.symbol_index.write().await;
        
        // Remove old symbols from this document
        index.remove_symbols_from_document(uri);
        
        // Add new symbols
        index.add_symbols(new_symbols);
    }
}
```

## Search Examples

### Exact Match
```
Query: "filter"
Results:
  - filter (Function) - Filter list elements by predicate
```

### Prefix Match
```
Query: "sta"
Results:
  - startsWith (Function) - Check if string starts with prefix
  - status (Variable) - from document:///config.cel
```

### Fuzzy Match
```
Query: "gt"
Results:
  - getTimestamp (Function)
  - getTotal (Variable)
```

### Symbol Kind Filter
```
Query: "get" kind:Function
Results:
  - getDate (Function)
  - getMonth (Function)
  - getYear (Function)
```

## UI Integration

### Quick Open (Ctrl/Cmd+P)
```
> @filter     # Search symbols starting with "filter"
  filter      Function
  filterList  Variable in config.cel
```

### Symbol Picker (Ctrl/Cmd+Shift+O)
```
Symbols in Workspace:

Functions:
  - size
  - filter
  - map
  - startsWith

Variables:
  - config
  - items
```

## Performance Considerations

### Optimization Strategies
- [ ] Lazy indexing: Build index on first use
- [ ] Incremental updates: Only re-index changed documents
- [ ] Background indexing: Don't block main thread
- [ ] Index pruning: Remove stale entries
- [ ] Cache search results: For repeated queries
- [ ] Limit result count: Return top N results

### Memory Management
- [ ] Limit index size
- [ ] Remove symbols from closed documents
- [ ] Periodic cleanup of unused entries
- [ ] Use string interning for common names

## Testing Requirements
- [ ] Test symbol extraction from documents
- [ ] Test search with various query patterns
- [ ] Test ranking algorithm
- [ ] Test incremental index updates
- [ ] Test with large workspace (many files)
- [ ] Test symbol removal on document close
- [ ] Test concurrent access to index
- [ ] Test search performance (< 100ms for typical workspace)

## Multi-File Support

### Document Organization
```
workspace/
  ├── rules/
  │   ├── auth.cel
  │   └── validation.cel
  ├── functions/
  │   └── helpers.cel
  └── config.cel
```

### Cross-File Navigation
- Jump to symbol in any file
- Show document path in results
- Support relative path display

## Future Enhancements
- [ ] Document symbols (`textDocument/documentSymbol`) - outline view
- [ ] Call hierarchy - show function call chains
- [ ] Type hierarchy - show type relationships
- [ ] Symbol highlighting - highlight all occurrences
- [ ] Rename symbol - across all files

## References
- [LSP Workspace Symbols](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workspace_symbol)
- [LSP Document Symbols](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_documentSymbol)
- Current backend: `src/lsp.rs`
- Related: Issue #6 (Go-to-definition)
