# CEL LSP Server

A Language Server Protocol (LSP) implementation for the Common Expression Language (CEL) that runs on Cloudflare Workers.

## Features

- Runs on Cloudflare Workers edge network
- Built with `tower-lsp` for LSP protocol handling
- Powered by `workers-rs` for Cloudflare Workers runtime
- Supports CEL language features:
  - Syntax completion
  - Hover information
  - Go to definition
  - Real-time diagnostics

## 🌐 Web Editor

A fully-featured web-based CEL editor is included in [`cel-editor-web/`](cel-editor-web/). Built with React, Monaco Editor, and Vite, it provides:

- **Syntax Highlighting**: Custom Monarch tokenizer generated from CEL.g4 grammar
- **LSP Integration**: Real-time validation, completion, and hover via HTTP
- **Modern UI**: Dark theme optimized for CEL expressions
- **Easy Deployment**: Deploy to Cloudflare Pages, Vercel, or Netlify

**Quick Start:**
```bash
cd cel-editor-web
npm install
npm run dev
```

See [cel-editor-web/README.md](cel-editor-web/README.md) for full documentation.

## Architecture

This project combines:
- **tower-lsp**: A robust LSP framework for Rust
- **workers-rs**: Cloudflare Workers SDK for Rust
- **cel-rust**: Rust implementation of the Common Expression Language ([cel-rust/cel-rust](https://github.com/cel-rust/cel-rust))

The LSP server is exposed via HTTP endpoints on Cloudflare Workers, allowing clients to communicate with it over JSON-RPC. It uses the `cel` crate for parsing and compiling CEL expressions.

## Prerequisites

- Rust 1.70 or later
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for deploying to Cloudflare Workers
- A Cloudflare account

## Installation

```bash
# Install wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

## Development

### Local Development

```bash
# Install worker-build
cargo install worker-build

# Run locally with wrangler
wrangler dev
```

The server will be available at `http://localhost:8787`.

### Testing

Test the LSP server with curl:

```bash
# Health check
curl http://localhost:8787/health

# Initialize LSP session
curl -X POST http://localhost:8787/lsp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "capabilities": {}
    }
  }'
```

## Deployment

Deploy to Cloudflare Workers:

```bash
wrangler publish
```

## Project Structure

```
cel-lsp/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
├── src/
│   ├── lib.rs                        # Cloudflare Workers entry point
│   └── lsp.rs                        # LSP backend implementation
├── tests/
│   ├── jsonrpc_protocol_tests.rs     # JSON-RPC protocol tests
│   ├── lsp_integration_tests.rs      # LSP integration tests
│   └── workers_endpoint_tests.rs     # Workers endpoint tests
├── cel-editor-web/                   # Monaco-React web editor
│   ├── src/
│   │   ├── cel-language.js           # Monarch tokenizer
│   │   ├── lsp-client.js             # LSP client
│   │   ├── CelEditor.jsx             # Editor component
│   │   └── ...
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── Cargo.toml                        # Rust dependencies
├── wrangler.toml                     # Cloudflare Workers configuration
├── .gitignore
└── README.md
```

## Implementation Details

### LSP Capabilities

Currently implemented:
- `initialize`: Server initialization and capability negotiation
- `textDocument/didOpen`: Track opened documents
- `textDocument/didChange`: Handle document changes
- `textDocument/didClose`: Clean up closed documents
- `textDocument/completion`: Provide completion suggestions
- `textDocument/hover`: Show hover information
- `textDocument/definition`: Go to definition support

### HTTP Endpoints

- `POST /lsp`: Main LSP JSON-RPC endpoint
- `GET /health`: Health check endpoint

## Testing

The project includes comprehensive test coverage with 43 tests across multiple test suites:

### Unit Tests (8 tests)
Located in `src/lsp.rs`:
- CEL expression validation (valid/invalid expressions)
- Function call validation
- String operations
- List operations with map
- Conditional expressions
- Empty expression handling
- Complex expression validation

### LSP Integration Tests (5 tests)
Located in `tests/lsp_integration_tests.rs`:
- Server initialization and capabilities verification
- Server shutdown
- Completion provider functionality
- Hover provider functionality
- Document lifecycle (open, change, close)

### JSON-RPC Protocol Tests (16 tests)
Located in `tests/jsonrpc_protocol_tests.rs`:
- JSON-RPC request/response format validation
- LSP method signatures (initialize, didOpen, didChange, etc.)
- Completion and hover response structures
- Diagnostic message formatting
- Error response handling
- CEL builtin function validation

### Workers Endpoint Tests (14 tests)
Located in `tests/workers_endpoint_tests.rs`:
- HTTP endpoint request handling
- LSP capabilities exposure
- Request ID preservation
- Concurrent request handling
- Malformed JSON handling
- CEL expression validation through endpoints
- Complex CEL expression compilation

Run all tests:
```bash
cargo test
```

Run specific test suite:
```bash
cargo test --test jsonrpc_protocol_tests
cargo test --test workers_endpoint_tests
cargo test --test lsp_integration_tests
cargo test --lib  # Run unit tests only
```

## TODOs

- [ ] Implement CEL parser and semantic analysis
- [ ] Add CEL-specific completion items
- [ ] Implement CEL expression validation
- [ ] Add diagnostics for CEL syntax errors
- [ ] Support CEL function signatures in hover
- [ ] Implement go-to-definition for CEL variables
- [ ] Add support for CEL macros
- [ ] Implement workspace symbols
- [ ] Add configuration options
- [ ] Write comprehensive tests

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

[Add your license here]

## Resources

- [CEL Specification](https://github.com/google/cel-spec)
- [cel-rust Implementation](https://github.com/cel-rust/cel-rust)
- [cel crate Documentation](https://docs.rs/cel/)
- [tower-lsp Documentation](https://docs.rs/tower-lsp/)
- [workers-rs Documentation](https://docs.rs/worker/)
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
