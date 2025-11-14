---
name: Write comprehensive tests
about: Expand test coverage for all LSP features and CEL functionality
title: '[Feature] Write comprehensive tests'
labels: enhancement, testing
assignees: ''
---

## Description
Expand the test suite to provide comprehensive coverage of all LSP features, CEL validation, edge cases, and integration scenarios.

## Current Test State
The project currently has **43 tests** across multiple test suites:

### Existing Test Coverage
- **Unit Tests (8)**: `src/lsp.rs` - Basic CEL validation
- **LSP Integration Tests (5)**: `tests/lsp_integration_tests.rs` - LSP lifecycle
- **JSON-RPC Protocol Tests (16)**: `tests/jsonrpc_protocol_tests.rs` - Protocol compliance
- **Workers Endpoint Tests (14)**: `tests/workers_endpoint_tests.rs` - HTTP endpoint behavior

## Proposed Test Expansion

### 1. Parser and Semantic Analysis Tests
Related to Issue #1

- [ ] AST generation for various expression types
- [ ] Variable declaration and reference tracking
- [ ] Function call parsing with nested expressions
- [ ] Field access and member expressions
- [ ] Macro invocation detection
- [ ] Type inference accuracy
- [ ] Scope analysis (nested scopes, shadowing)
- [ ] Error recovery during parsing
- [ ] Performance tests for large expressions

### 2. Completion Tests
Related to Issue #2

- [ ] Builtin function completions
- [ ] Operator completions
- [ ] Variable completions from context
- [ ] Field access completions (after `.`)
- [ ] Context-aware completions
- [ ] Completion filtering based on prefix
- [ ] Completion sorting and ranking
- [ ] Snippet expansion for functions
- [ ] Trigger character handling (`.`, `[`, `(`)
- [ ] Completion at various cursor positions

### 3. Validation Tests
Related to Issue #3

- [ ] Type mismatch detection
- [ ] Function argument validation
- [ ] Undefined variable detection
- [ ] Invalid operator usage
- [ ] Field access on invalid types
- [ ] Null safety checks
- [ ] Division by zero detection
- [ ] Integer overflow checks
- [ ] Complex nested expression validation
- [ ] Performance with large documents

### 4. Diagnostic Tests
Related to Issue #4

- [ ] Precise error location mapping
- [ ] Multi-line error ranges
- [ ] Error severity levels (error, warning, info)
- [ ] Related diagnostic information
- [ ] Diagnostic tags (deprecated, unnecessary)
- [ ] Quick fix suggestions
- [ ] Diagnostic updates on document changes
- [ ] Diagnostic clearing when fixed
- [ ] Multiple diagnostics per document
- [ ] Error message clarity and helpfulness

### 5. Hover Tests
Related to Issue #5

- [ ] Function signature hover
- [ ] Variable type hover
- [ ] Operator documentation hover
- [ ] Macro expansion hover
- [ ] Hover at different positions
- [ ] Hover with markdown formatting
- [ ] Hover with code examples
- [ ] No hover on whitespace/invalid positions
- [ ] Overloaded function documentation
- [ ] Parameter-specific hover in function calls

### 6. Go-to-Definition Tests
Related to Issue #6

- [ ] Navigate to variable definition
- [ ] Definition in iteration variables
- [ ] Definition in nested scopes
- [ ] Variable shadowing scenarios
- [ ] External variable references (no definition)
- [ ] Multiple usages of same variable
- [ ] Definition across multiple expressions
- [ ] Invalid position handling
- [ ] Find all references functionality
- [ ] Peek definition

### 7. Macro Tests
Related to Issue #7

- [ ] Macro recognition (`has`, `all`, `exists`, etc.)
- [ ] Macro argument validation
- [ ] Macro expansion correctness
- [ ] Nested macro invocations
- [ ] Macro-specific error messages
- [ ] Macro hover documentation
- [ ] Macro completion
- [ ] Code actions for macro expansion
- [ ] Invalid macro usage detection
- [ ] Performance with many macros

### 8. Workspace Symbol Tests
Related to Issue #8

- [ ] Symbol extraction from documents
- [ ] Workspace-wide symbol search
- [ ] Fuzzy matching
- [ ] Prefix matching
- [ ] CamelCase matching
- [ ] Result ranking
- [ ] Symbol kind filtering
- [ ] Incremental index updates
- [ ] Symbol removal on document close
- [ ] Large workspace performance
- [ ] Concurrent access to index

### 9. Configuration Tests
Related to Issue #9

- [ ] Default configuration loading
- [ ] Configuration updates at runtime
- [ ] Invalid configuration handling
- [ ] Each option affects behavior correctly
- [ ] Configuration persistence
- [ ] Workspace-specific configuration
- [ ] Configuration schema validation
- [ ] Configuration migration
- [ ] Configuration validation
- [ ] Nested configuration options

### 10. Integration Tests

#### End-to-End Workflows
- [ ] Complete editing session lifecycle
- [ ] Multiple documents open simultaneously
- [ ] Document changes and revalidation
- [ ] Cross-feature interactions (completion → validation → hover)
- [ ] Error correction workflow
- [ ] Refactoring scenarios

#### Concurrency Tests
- [ ] Concurrent document updates
- [ ] Concurrent validation requests
- [ ] Race condition handling
- [ ] Thread safety of shared state

#### Performance Tests
- [ ] Large document handling (>10KB)
- [ ] Many documents (>100)
- [ ] Validation performance benchmarks
- [ ] Completion response time
- [ ] Memory usage under load
- [ ] Startup time

### 11. Edge Cases and Error Handling

#### Input Validation
- [ ] Empty expressions
- [ ] Very long expressions
- [ ] Expressions with special characters
- [ ] Unicode handling
- [ ] Malformed UTF-8
- [ ] Binary data

#### Error Recovery
- [ ] Partial expression parsing
- [ ] Continued validation after errors
- [ ] Recovery from crashes
- [ ] Invalid state handling

#### Boundary Conditions
- [ ] Maximum nesting depth
- [ ] Maximum expression length
- [ ] Empty documents
- [ ] Single character documents
- [ ] Documents with only whitespace

### 12. Protocol Compliance Tests

#### LSP Specification
- [ ] All implemented methods follow spec
- [ ] Proper JSON-RPC format
- [ ] Error codes are standard
- [ ] Capability negotiation
- [ ] Message ordering
- [ ] Cancellation support

#### Cloudflare Workers
- [ ] HTTP endpoint behavior
- [ ] Request/response format
- [ ] CORS handling
- [ ] Error responses
- [ ] Timeout handling
- [ ] Content-type validation

## Test Infrastructure Improvements

### 1. Test Utilities
```rust
// Common test fixtures
pub mod test_utils {
    pub fn create_test_backend() -> Backend { /* ... */ }
    pub fn sample_cel_expression(kind: ExprKind) -> String { /* ... */ }
    pub fn assert_diagnostic_at(diag: &Diagnostic, line: u32, col: u32) { /* ... */ }
}
```

### 2. Property-Based Testing
Use `proptest` or `quickcheck` for:
- [ ] Random CEL expression generation
- [ ] Fuzz testing parser
- [ ] Random configuration testing
- [ ] Stress testing with random inputs

### 3. Snapshot Testing
For complex outputs:
- [ ] Diagnostic message formatting
- [ ] Hover content rendering
- [ ] Completion item lists
- [ ] Error messages

### 4. Benchmark Suite
```rust
#[bench]
fn bench_validation_simple_expression(b: &mut Bencher) { /* ... */ }

#[bench]
fn bench_validation_complex_expression(b: &mut Bencher) { /* ... */ }

#[bench]
fn bench_completion_generation(b: &mut Bencher) { /* ... */ }
```

## Test Quality Standards

### Coverage Targets
- [ ] Overall code coverage > 80%
- [ ] Critical paths coverage > 95%
- [ ] Public API coverage = 100%

### Test Characteristics
- **Fast**: Unit tests < 10ms, integration tests < 100ms
- **Isolated**: No shared state between tests
- **Deterministic**: Same input → same output
- **Readable**: Clear test names and structure
- **Maintainable**: Easy to update when code changes

### Test Documentation
```rust
#[test]
fn test_completion_includes_builtin_functions() {
    // Arrange: Setup backend and create completion context
    let backend = create_test_backend();
    let params = create_completion_params(position);
    
    // Act: Request completions
    let response = backend.completion(params).await.unwrap();
    
    // Assert: Verify builtin functions are included
    assert_contains_completion(&response, "size");
    assert_contains_completion(&response, "filter");
}
```

## Test Execution

### Local Development
```bash
# Run all tests
cargo test

# Run specific test suite
cargo test --test lsp_integration_tests

# Run with coverage
cargo tarpaulin --out Html

# Run benchmarks
cargo bench
```

### CI/CD Integration
- [ ] Run tests on every commit
- [ ] Run tests on multiple Rust versions
- [ ] Generate coverage reports
- [ ] Run benchmarks on main branch
- [ ] Fail CI on coverage decrease

## Test Pyramid

Aim for balanced test distribution:
```
        /\
       /  \     E2E Tests (5%)
      /----\
     /      \   Integration Tests (15%)
    /--------\
   /          \  Unit Tests (80%)
  /____________\
```

## Testing Best Practices

### Naming Convention
```
test_<feature>_<scenario>_<expected_outcome>

Examples:
- test_completion_after_dot_includes_fields()
- test_validation_invalid_syntax_returns_error()
- test_hover_on_function_shows_signature()
```

### AAA Pattern
Always use Arrange-Act-Assert:
```rust
#[test]
fn test_example() {
    // Arrange
    let input = "test";
    
    // Act
    let result = function(input);
    
    // Assert
    assert_eq!(result, expected);
}
```

### Test Data
- Use realistic CEL expressions
- Cover common use cases
- Include edge cases
- Test with actual user data (anonymized)

## Documentation

### Test README
Create `tests/README.md` with:
- Overview of test organization
- How to run tests
- How to add new tests
- Test utilities documentation
- Coverage reporting

### Inline Documentation
```rust
/// Tests that variable completion includes all in-scope variables
/// 
/// This test verifies that when requesting completions, all variables
/// that are in scope at the cursor position are included in the results.
/// 
/// Covers: Issue #2 (CEL-specific completion items)
#[test]
fn test_completion_includes_scoped_variables() {
    // test implementation
}
```

## Success Criteria
- [ ] All new features have >90% test coverage
- [ ] No regressions in existing functionality
- [ ] Test suite runs in < 5 minutes
- [ ] All tests pass consistently
- [ ] Benchmarks show acceptable performance
- [ ] Coverage report generated automatically

## References
- Current tests: `src/lsp.rs`, `tests/`
- [Rust Testing Guide](https://doc.rust-lang.org/book/ch11-00-testing.html)
- [cargo test Documentation](https://doc.rust-lang.org/cargo/commands/cargo-test.html)
- Related to: All other issues require test coverage
