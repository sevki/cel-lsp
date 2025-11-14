#!/bin/bash
# Script to create GitHub issues for CEL LSP feature roadmap
# Usage: GH_TOKEN=<your-token> ./create-issues.sh
# Or: gh auth login && ./create-issues.sh

set -e

REPO="sevki/cel-lsp"

# Check if gh is authenticated
if ! gh auth status >/dev/null 2>&1; then
    echo "Error: GitHub CLI is not authenticated."
    echo "Please run: gh auth login"
    echo "Or set GH_TOKEN environment variable"
    exit 1
fi

echo "Creating GitHub issues for CEL LSP TODO items..."
echo ""

# Issue 1: Implement CEL parser and semantic analysis
echo "Creating issue 1: Parser and semantic analysis..."
gh issue create --repo "$REPO" \
    --title "[Feature] Implement CEL parser and semantic analysis" \
    --label "enhancement,parser" \
    --body "## Description
Implement a comprehensive CEL parser and semantic analysis system to provide deeper understanding of CEL expressions beyond basic compilation.

## Current State
Currently, the LSP server uses basic CEL compilation via \`cel::Program::compile()\` which provides limited insight into the expression structure and semantics.

## Proposed Implementation

### Parser Enhancement
- [ ] Implement AST (Abstract Syntax Tree) generation for CEL expressions
- [ ] Parse and extract variable declarations and references
- [ ] Identify function calls and their arguments
- [ ] Parse field access and member expressions
- [ ] Handle macro invocations and expansions

### Semantic Analysis
- [ ] Type inference for expressions
- [ ] Variable scope analysis
- [ ] Function signature validation
- [ ] Type compatibility checking
- [ ] Dead code detection
- [ ] Unused variable warnings

### Integration Points
- Update \`validate_document\` in \`src/lsp.rs\` to use enhanced parser
- Store parsed AST alongside document content
- Use semantic information for improved diagnostics

## Benefits
- More accurate error messages with precise location information
- Better understanding of expression structure for completion and hover
- Foundation for advanced features like refactoring and code analysis
- Improved performance by caching parsed results

## Testing Requirements
- [ ] Unit tests for parser on various CEL expression types
- [ ] Semantic analysis tests for type checking
- [ ] Integration tests for AST generation
- [ ] Performance tests for large expressions

## References
- [CEL Specification](https://github.com/google/cel-spec)
- [cel-rust crate documentation](https://docs.rs/cel/)
- Current implementation: \`src/lsp.rs:25-60\`"

echo "✓ Created issue 1"
echo ""

# Issue 2: Add CEL-specific completion items
echo "Creating issue 2: CEL-specific completion items..."
gh issue create --repo "$REPO" \
    --title "[Feature] Add CEL-specific completion items" \
    --label "enhancement,completion" \
    --body "## Description
Enhance the completion provider to offer context-aware suggestions for CEL expressions, including builtin functions, operators, variables, and field access.

## Current State
The current completion implementation in \`src/lsp.rs:136-154\` provides only two hardcoded completions (\`size\` and \`matches\`), which is insufficient for a productive development experience.

## Proposed Completion Categories

### 1. Builtin Functions
- [ ] String functions: \`contains\`, \`startsWith\`, \`endsWith\`, \`matches\`, \`split\`
- [ ] Collection functions: \`size\`, \`filter\`, \`map\`, \`all\`, \`exists\`, \`exists_one\`
- [ ] Type conversion: \`int\`, \`uint\`, \`double\`, \`string\`, \`bytes\`, \`timestamp\`, \`duration\`
- [ ] Math functions: \`abs\`, \`ceil\`, \`floor\`, \`round\`
- [ ] Time functions: \`getDate\`, \`getMonth\`, \`getYear\`, \`getHours\`, etc.

### 2. Operators
- [ ] Arithmetic: \`+\`, \`-\`, \`*\`, \`/\`, \`%\`
- [ ] Comparison: \`==\`, \`!=\`, \`<\`, \`<=\`, \`>\`, \`>=\`
- [ ] Logical: \`&&\`, \`||\`, \`!\`
- [ ] Membership: \`in\`

### 3. Context-Aware Completions
- [ ] Variable completions based on document context
- [ ] Field access completions (after \`.\` trigger)
- [ ] Method completions based on receiver type
- [ ] Macro completions: \`has\`, \`all\`, \`exists\`, \`filter\`, \`map\`

### 4. Literals
- [ ] Boolean: \`true\`, \`false\`
- [ ] Null: \`null\`
- [ ] List constructors: \`[]\`
- [ ] Map constructors: \`{}\`

## Testing Requirements
- [ ] Test completion at various positions in expressions
- [ ] Test trigger characters (\`.\`, \`[\`, \`(\`)
- [ ] Test filtering based on typed prefix
- [ ] Test snippet expansion for functions with parameters

## References
- [CEL Builtin Functions](https://github.com/google/cel-spec/blob/master/doc/langdef.md#list-of-standard-definitions)
- Current implementation: \`src/lsp.rs:136-154\`
- LSP Completion Spec: [textDocument/completion](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_completion)"

echo "✓ Created issue 2"
echo ""

# Issue 3: Implement CEL expression validation
echo "Creating issue 3: CEL expression validation..."
gh issue create --repo "$REPO" \
    --title "[Feature] Implement CEL expression validation" \
    --label "enhancement,validation" \
    --body "## Description
Improve CEL expression validation beyond basic compilation errors to include type checking, semantic validation, and detailed error reporting with precise source locations.

## Current State
Current validation in \`src/lsp.rs:25-60\` uses basic \`Program::compile()\` which:
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
- [ ] Verify type compatibility in operations (e.g., \`1 + \"string\"\` should error)
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

## Testing Requirements
- [ ] Test suite for each error category
- [ ] Verify error positions are accurate
- [ ] Test complex nested expressions
- [ ] Validate error message clarity

## References
- [LSP Diagnostic Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic)
- Current implementation: \`src/lsp.rs:25-60\`"

echo "✓ Created issue 3"
echo ""

# Issue 4: Add diagnostics for CEL syntax errors
echo "Creating issue 4: Syntax error diagnostics..."
gh issue create --repo "$REPO" \
    --title "[Feature] Add diagnostics for CEL syntax errors" \
    --label "enhancement,diagnostics" \
    --body "## Description
Enhance diagnostic reporting for CEL syntax errors with precise locations, helpful messages, and quick fix suggestions.

## Current State
The current diagnostic system in \`src/lsp.rs:25-60\`:
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
- [ ] Syntax errors (missing operators, unmatched brackets)
- [ ] Parse errors (unexpected tokens, incomplete expressions)
- [ ] Multiple severity levels (error, warning, info, hint)

### 3. Quick Fixes (Code Actions)
- [ ] Insert missing closing brackets/parentheses
- [ ] Fix common typos in function names
- [ ] Add missing operators
- [ ] Convert invalid syntax to valid alternatives

## Testing Requirements
- [ ] Test each syntax error category
- [ ] Verify diagnostic positions are accurate
- [ ] Test quick fixes apply correctly
- [ ] Test diagnostic updates on document changes

## References
- [LSP Diagnostic Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#diagnostic)
- [LSP Code Action](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_codeAction)
- Current implementation: \`src/lsp.rs:25-60\`"

echo "✓ Created issue 4"
echo ""

# Issue 5: Support CEL function signatures in hover
echo "Creating issue 5: Function signature hover..."
gh issue create --repo "$REPO" \
    --title "[Feature] Support CEL function signatures in hover" \
    --label "enhancement,hover" \
    --body "## Description
Implement rich hover information for CEL functions, showing signatures, parameter types, return types, and documentation with examples.

## Current State
The current hover implementation in \`src/lsp.rs:156-164\`:
- Returns a static message \"CEL Language Server\"
- Doesn't inspect the hovered position
- No context-aware information
- No function signatures or documentation

## Proposed Features

### 1. Function Signatures
Display function signature when hovering over function names with parameter types and return types.

### 2. Parameter Information
Show parameter details for function calls with descriptions.

### 3. Type Information
Display inferred or declared types for variables and expressions.

### 4. Operator Documentation
Show operator precedence and behavior.

### 5. Macro Documentation
Provide information about CEL macros like \`has\`, \`all\`, \`exists\`, etc.

## Builtin Functions to Document
- [ ] String functions: \`contains\`, \`startsWith\`, \`endsWith\`, \`matches\`
- [ ] Collection functions: \`size\`, \`filter\`, \`map\`, \`all\`, \`exists\`
- [ ] Type conversion: \`int\`, \`uint\`, \`double\`, \`string\`, \`bytes\`
- [ ] Time functions: \`timestamp\`, \`duration\`, \`getDate\`, \`getMonth\`
- [ ] Math functions: \`abs\`, \`ceil\`, \`floor\`

## Testing Requirements
- [ ] Test hover on function names
- [ ] Test hover on variables
- [ ] Test hover on operators
- [ ] Test hover returns null when not over a symbol

## References
- [CEL Builtin Functions](https://github.com/google/cel-spec/blob/master/doc/langdef.md#list-of-standard-definitions)
- [LSP Hover Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_hover)
- Current implementation: \`src/lsp.rs:156-164\`"

echo "✓ Created issue 5"
echo ""

# Issue 6: Implement go-to-definition for CEL variables
echo "Creating issue 6: Go-to-definition..."
gh issue create --repo "$REPO" \
    --title "[Feature] Implement go-to-definition for CEL variables" \
    --label "enhancement,navigation" \
    --body "## Description
Implement go-to-definition functionality to allow users to navigate from variable usage to its definition, and support finding all references to a variable.

## Current State
The current goto_definition implementation in \`src/lsp.rs:166-173\`:
- Returns \`None\` for all requests
- No variable tracking or reference analysis
- No definition location mapping

## Proposed Features

### 1. Variable Definition Tracking
- [ ] Track variable declarations in expressions
- [ ] Map variable usages to their definitions
- [ ] Support for function parameters as definitions
- [ ] Support for iteration variables (e.g., in \`map\`, \`filter\`)

### 2. Go-to-Definition
When user clicks on a variable with Ctrl/Cmd+Click:
- Jump to the location where the variable is defined
- Highlight the definition
- Support cross-document navigation (if applicable)

### 3. Find References
Find all usages of a variable:
- Show all locations where variable is referenced
- Highlight usage contexts

## CEL Variable Contexts
- Iteration variables in \`filter\`, \`map\`, \`all\`, \`exists\`
- Comprehension variables
- Function parameters (if custom functions exist)

## Testing Requirements
- [ ] Test goto definition for iteration variables
- [ ] Test with nested scopes (variable shadowing)
- [ ] Test with multiple usages of same variable
- [ ] Test when definition is not found (external variables)

## References
- [LSP Go to Definition](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_definition)
- [LSP Find References](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_references)
- Current implementation: \`src/lsp.rs:166-173\`"

echo "✓ Created issue 6"
echo ""

# Issue 7: Add support for CEL macros
echo "Creating issue 7: CEL macros support..."
gh issue create --repo "$REPO" \
    --title "[Feature] Add support for CEL macros" \
    --label "enhancement,macros" \
    --body "## Description
Implement comprehensive support for CEL macros including expansion, validation, completion, and documentation for macro invocations.

## Background
CEL macros are syntactic sugar that expand into standard CEL expressions. Common macros include:
- \`has(expr.field)\` - Check if field exists
- \`expr.all(x, predicate)\` - Check if predicate is true for all elements
- \`expr.exists(x, predicate)\` - Check if predicate is true for any element
- \`expr.exists_one(x, predicate)\` - Check if predicate is true for exactly one element
- \`expr.map(x, transform)\` - Transform all elements
- \`expr.filter(x, predicate)\` - Filter elements by predicate

## Proposed Features

### 1. Macro Recognition
- [ ] Identify macro invocations in expressions
- [ ] Distinguish macros from regular functions
- [ ] Support all standard CEL macros

### 2. Macro Expansion
- [ ] Show expanded form in diagnostics
- [ ] Visualize macro expansion on hover
- [ ] Provide \"Expand Macro\" code action

### 3. Macro-Specific Validation
- [ ] Validate macro argument count
- [ ] Check predicate/transform function signatures
- [ ] Verify receiver types (list, map, etc.)
- [ ] Ensure proper closure variable usage

## CEL Standard Macros
- [ ] \`has()\` - Field presence check
- [ ] \`all()\` - Universal quantifier
- [ ] \`exists()\` - Existential quantifier
- [ ] \`exists_one()\` - Unique existence
- [ ] \`map()\` - List transformation
- [ ] \`filter()\` - List filtering

## Testing Requirements
- [ ] Test recognition of each macro type
- [ ] Test validation of macro arguments
- [ ] Test macro expansion correctness
- [ ] Test nested macro invocations

## References
- [CEL Macros Specification](https://github.com/google/cel-spec/blob/master/doc/langdef.md#macros)
- [cel-rust Macro Support](https://docs.rs/cel/)
- Current completion: \`src/lsp.rs:136-154\`"

echo "✓ Created issue 7"
echo ""

# Issue 8: Implement workspace symbols
echo "Creating issue 8: Workspace symbols..."
gh issue create --repo "$REPO" \
    --title "[Feature] Implement workspace symbols" \
    --label "enhancement,navigation" \
    --body "## Description
Implement workspace symbol search to allow users to quickly find and navigate to functions, variables, and other symbols across all CEL files in the workspace.

## Current State
- No workspace symbol support
- No global symbol index
- No cross-file navigation
- Single document focus only

## Proposed Features

### 1. Workspace Symbol Provider
Implement \`workspace/symbol\` LSP method to:
- [ ] Search symbols across all documents
- [ ] Return ranked results based on query
- [ ] Support fuzzy matching
- [ ] Filter by symbol kind (function, variable, etc.)

### 2. Symbol Indexing
- [ ] Build and maintain workspace-wide symbol index
- [ ] Update index on document changes
- [ ] Efficient incremental updates

### 3. Symbol Types
Track and index these symbol types:
- [ ] Functions (builtin and custom)
- [ ] Variables and constants
- [ ] Macros
- [ ] Type definitions

### 4. Search Capabilities
- [ ] Prefix matching: \"fil\" matches \"filter\"
- [ ] Fuzzy matching: \"fltr\" matches \"filter\"
- [ ] CamelCase matching: \"SN\" matches \"StartsWith\"
- [ ] Ranking based on relevance

## Testing Requirements
- [ ] Test symbol extraction from documents
- [ ] Test search with various query patterns
- [ ] Test ranking algorithm
- [ ] Test incremental index updates

## References
- [LSP Workspace Symbols](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workspace_symbol)
- [LSP Document Symbols](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_documentSymbol)
- Current backend: \`src/lsp.rs\`"

echo "✓ Created issue 8"
echo ""

# Issue 9: Add configuration options
echo "Creating issue 9: Configuration options..."
gh issue create --repo "$REPO" \
    --title "[Feature] Add configuration options" \
    --label "enhancement,configuration" \
    --body "## Description
Implement configuration system to allow users to customize LSP server behavior, including validation rules, completion preferences, and performance settings.

## Current State
- No configuration support
- Hardcoded behavior
- No user customization options
- No workspace-specific settings

## Proposed Configuration Categories

### 1. Validation Settings
\`\`\`json
{
  \"cel.validation.enabled\": true,
  \"cel.validation.level\": \"error\",
  \"cel.validation.checkTypes\": true,
  \"cel.validation.checkUndefinedVariables\": true
}
\`\`\`

### 2. Completion Settings
\`\`\`json
{
  \"cel.completion.enabled\": true,
  \"cel.completion.includeBuiltins\": true,
  \"cel.completion.includeSnippets\": true,
  \"cel.completion.autoTrigger\": true
}
\`\`\`

### 3. Hover Settings
\`\`\`json
{
  \"cel.hover.enabled\": true,
  \"cel.hover.showDocumentation\": true,
  \"cel.hover.showExamples\": true
}
\`\`\`

### 4. Performance Settings
\`\`\`json
{
  \"cel.performance.maxFileSize\": 1048576,
  \"cel.performance.validationDelay\": 500,
  \"cel.performance.cacheSize\": 100
}
\`\`\`

## Implementation Details
- Support loading from \`.cel-lsp.json\` in workspace root
- Handle \`workspace/didChangeConfiguration\` LSP method
- Provide JSON schema for IDE integration
- Validate configuration values

## Testing Requirements
- [ ] Test default configuration loads correctly
- [ ] Test configuration updates at runtime
- [ ] Test invalid configuration handling
- [ ] Test each configuration option affects behavior

## References
- [LSP Configuration](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workspace_didChangeConfiguration)
- [VSCode Settings](https://code.visualstudio.com/api/references/contribution-points#contributes.configuration)
- Current backend: \`src/lsp.rs\`"

echo "✓ Created issue 9"
echo ""

# Issue 10: Write comprehensive tests
echo "Creating issue 10: Comprehensive tests..."
gh issue create --repo "$REPO" \
    --title "[Feature] Write comprehensive tests" \
    --label "enhancement,testing" \
    --body "## Description
Expand the test suite to provide comprehensive coverage of all LSP features, CEL validation, edge cases, and integration scenarios.

## Current Test State
The project currently has **43 tests** across multiple test suites:
- **Unit Tests (8)**: \`src/lsp.rs\` - Basic CEL validation
- **LSP Integration Tests (5)**: \`tests/lsp_integration_tests.rs\` - LSP lifecycle
- **JSON-RPC Protocol Tests (16)**: \`tests/jsonrpc_protocol_tests.rs\` - Protocol compliance
- **Workers Endpoint Tests (14)**: \`tests/workers_endpoint_tests.rs\` - HTTP endpoint behavior

## Proposed Test Expansion

### 1. Parser and Semantic Analysis Tests
- [ ] AST generation for various expression types
- [ ] Variable declaration and reference tracking
- [ ] Type inference accuracy
- [ ] Scope analysis (nested scopes, shadowing)

### 2. Completion Tests
- [ ] Builtin function completions
- [ ] Context-aware completions
- [ ] Trigger character handling
- [ ] Completion filtering and ranking

### 3. Validation Tests
- [ ] Type mismatch detection
- [ ] Undefined variable detection
- [ ] Complex nested expression validation

### 4. Diagnostic Tests
- [ ] Precise error location mapping
- [ ] Error severity levels
- [ ] Quick fix suggestions

### 5. Hover Tests
- [ ] Function signature hover
- [ ] Variable type hover
- [ ] Markdown formatting

### 6. Go-to-Definition Tests
- [ ] Navigate to variable definition
- [ ] Variable shadowing scenarios
- [ ] Find all references

### 7. Macro Tests
- [ ] Macro recognition
- [ ] Macro expansion correctness
- [ ] Macro validation

### 8. Workspace Symbol Tests
- [ ] Symbol extraction
- [ ] Fuzzy matching
- [ ] Index updates

### 9. Configuration Tests
- [ ] Configuration loading
- [ ] Runtime updates
- [ ] Validation

### 10. Integration Tests
- [ ] End-to-end workflows
- [ ] Concurrent requests
- [ ] Performance benchmarks

## Test Quality Standards
- Overall code coverage > 80%
- Critical paths coverage > 95%
- Fast: Unit tests < 10ms, integration tests < 100ms
- Deterministic and isolated

## References
- Current tests: \`src/lsp.rs\`, \`tests/\`
- [Rust Testing Guide](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [cargo test Documentation](https://doc.rust-lang.org/cargo/commands/cargo-test.html)"

echo "✓ Created issue 10"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "✅ Successfully created all 10 GitHub issues!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "View all issues at: https://github.com/$REPO/issues"
echo ""
