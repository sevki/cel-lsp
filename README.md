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

## Architecture

This project combines:
- **tower-lsp**: A robust LSP framework for Rust
- **workers-rs**: Cloudflare Workers SDK for Rust
- **cel-rust**: Rust implementation of the Common Expression Language ([cel-rust/cel-rust](https://github.com/cel-rust/cel-rust))

The LSP server is exposed via HTTP endpoints on Cloudflare Workers, allowing clients to communicate with it over JSON-RPC. It uses `cel-parser` for parsing CEL expressions and `cel-interpreter` for evaluation and semantic analysis.

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
├── src/
│   ├── lib.rs          # Cloudflare Workers entry point
│   └── lsp.rs          # LSP backend implementation
├── Cargo.toml          # Rust dependencies
├── wrangler.toml       # Cloudflare Workers configuration
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
- [cel-parser Documentation](https://docs.rs/cel-parser/)
- [cel-interpreter Documentation](https://docs.rs/cel-interpreter/)
- [tower-lsp Documentation](https://docs.rs/tower-lsp/)
- [workers-rs Documentation](https://docs.rs/worker/)
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
