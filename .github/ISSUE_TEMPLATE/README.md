# GitHub Issue Templates

This directory contains comprehensive issue templates for tracking the development of CEL LSP features.

## Available Issue Templates

### 01. Implement CEL parser and semantic analysis
**File**: `01-cel-parser-semantic-analysis.md`

Enhance the LSP server with comprehensive CEL parser and semantic analysis capabilities including:
- AST generation
- Variable scope analysis
- Type inference
- Function signature validation

### 02. Add CEL-specific completion items
**File**: `02-cel-specific-completion.md`

Implement intelligent code completion for CEL language features:
- Builtin functions (size, filter, map, etc.)
- Operators and keywords
- Context-aware completions
- Field access completions

### 03. Implement CEL expression validation
**File**: `03-cel-expression-validation.md`

Enhance expression validation with:
- Precise error locations
- Type checking
- Semantic validation
- Runtime validation

### 04. Add diagnostics for CEL syntax errors
**File**: `04-cel-syntax-error-diagnostics.md`

Implement comprehensive syntax error diagnostics:
- Accurate error positioning
- Multiple severity levels
- Quick fix suggestions
- Enhanced error messages

### 05. Support CEL function signatures in hover
**File**: `05-cel-function-signature-hover.md`

Show detailed function information on hover:
- Function signatures with types
- Parameter documentation
- Code examples
- Operator documentation

### 06. Implement go-to-definition for CEL variables
**File**: `06-goto-definition-variables.md`

Enable navigation to variable definitions:
- Variable definition tracking
- Go-to-definition support
- Find all references
- Symbol navigation

### 07. Add support for CEL macros
**File**: `07-cel-macros-support.md`

Implement macro support:
- Macro recognition (has, all, exists, etc.)
- Macro expansion
- Macro-specific validation
- Enhanced diagnostics for macros

### 08. Implement workspace symbols
**File**: `08-workspace-symbols.md`

Enable workspace-wide symbol search:
- Symbol indexing
- Fuzzy search
- Cross-file navigation
- Symbol ranking

### 09. Add configuration options
**File**: `09-configuration-options.md`

Implement user-configurable settings:
- Validation settings
- Completion preferences
- Performance tuning
- Environment configuration

### 10. Write comprehensive tests
**File**: `10-comprehensive-tests.md`

Expand test coverage:
- Feature-specific tests
- Integration tests
- Performance benchmarks
- Edge case testing

## Creating Issues from Templates

### Using GitHub Web Interface

1. Go to the repository's Issues tab
2. Click "New Issue"
3. Select the appropriate template
4. Fill in any additional details
5. Submit the issue

### Using GitHub CLI

```bash
# Create an issue using a template
gh issue create --template "01-cel-parser-semantic-analysis.md"

# Or create issues programmatically
for template in .github/ISSUE_TEMPLATE/*.md; do
  # Extract title and body from template
  gh issue create --title "$(grep '^title:' $template | cut -d"'" -f2)" \
                  --body-file "$template"
done
```

### Batch Creation Script

A helper script to create all issues at once:

```bash
#!/bin/bash
# create-all-issues.sh

TEMPLATES=(
  "01-cel-parser-semantic-analysis.md"
  "02-cel-specific-completion.md"
  "03-cel-expression-validation.md"
  "04-cel-syntax-error-diagnostics.md"
  "05-cel-function-signature-hover.md"
  "06-goto-definition-variables.md"
  "07-cel-macros-support.md"
  "08-workspace-symbols.md"
  "09-configuration-options.md"
  "10-comprehensive-tests.md"
)

cd .github/ISSUE_TEMPLATE

for template in "${TEMPLATES[@]}"; do
  echo "Creating issue from $template..."
  
  # Extract frontmatter
  title=$(grep '^title:' "$template" | sed "s/title: '\(.*\)'/\1/")
  labels=$(grep '^labels:' "$template" | sed 's/labels: //')
  
  # Extract body (everything after the second '---')
  body=$(awk '/^---$/{i++; next} i==2' "$template")
  
  # Create the issue
  echo "$body" | gh issue create --title "$title" --label "$labels" --body-file -
  
  echo "Created: $title"
  echo ""
done
```

## Template Structure

Each template follows this structure:

```markdown
---
name: [Template name shown in GitHub UI]
about: [Brief description]
title: '[Feature] [Issue title]'
labels: enhancement, [specific-label]
assignees: ''
---

## Description
[Detailed description of the feature]

## Current State
[What exists now]

## Proposed Features
[What should be implemented]

## Implementation Details
[Technical details, code snippets]

## Testing Requirements
[What tests are needed]

## References
[Links to documentation, related issues]
```

## Issue Relationships

These issues are interconnected:

- **Issue #1** (Parser) is foundational for most other features
- **Issue #2** (Completion) depends on #1 for symbol extraction
- **Issue #3** (Validation) depends on #1 for semantic analysis
- **Issue #4** (Diagnostics) builds on #3
- **Issue #5** (Hover) needs #1 for symbol information
- **Issue #6** (Go-to-definition) requires #1 for symbol tracking
- **Issue #7** (Macros) needs #1 for macro recognition
- **Issue #8** (Workspace symbols) depends on #1 and #6
- **Issue #9** (Configuration) affects all features
- **Issue #10** (Tests) covers all features

## Development Priority

Suggested implementation order:

1. **Phase 1 - Foundation**
   - Issue #1: Parser and semantic analysis
   - Issue #10: Test infrastructure

2. **Phase 2 - Core Features**
   - Issue #3: Expression validation
   - Issue #4: Syntax error diagnostics
   - Issue #2: Completion items

3. **Phase 3 - Advanced Features**
   - Issue #5: Hover support
   - Issue #6: Go-to-definition
   - Issue #7: Macro support

4. **Phase 4 - Workspace Features**
   - Issue #8: Workspace symbols
   - Issue #9: Configuration options

## Labels

Common labels used across templates:
- `enhancement`: New feature
- `parser`: Parser-related
- `completion`: Code completion
- `validation`: Validation features
- `diagnostics`: Error/warning diagnostics
- `hover`: Hover information
- `navigation`: Go-to-definition, symbols
- `macros`: CEL macro support
- `configuration`: User settings
- `testing`: Test coverage

## Contributing

When adding new issue templates:

1. Follow the existing structure
2. Include clear implementation details
3. Add testing requirements
4. Reference related issues
5. Provide code examples
6. Link to relevant documentation

## References

- [GitHub Issue Templates Documentation](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
- [CEL Specification](https://github.com/google/cel-spec)
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
