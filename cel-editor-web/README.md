# CEL Editor Web App

A modern web-based editor for the Common Expression Language (CEL) built with React, Monaco Editor, and Vite. This editor connects to a Language Server Protocol (LSP) backend running on Cloudflare Workers to provide rich language features including syntax highlighting, auto-completion, hover information, and real-time diagnostics.

![CEL Editor](https://img.shields.io/badge/CEL-Language%20Editor-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Monaco](https://img.shields.io/badge/Monaco-Editor-blue?logo=visualstudiocode)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)

## Features

### 🎨 Syntax Highlighting
- **Monarch Tokenizer**: Custom syntax highlighting generated from the official CEL grammar (CEL.g4)
- **CEL-specific theme**: Dark theme optimized for CEL expressions
- **Token types**:
  - Keywords: `true`, `false`, `null`, `in`
  - Operators: `==`, `!=`, `&&`, `||`, `<`, `<=`, `>`, `>=`, `+`, `-`, `*`, `/`, `%`, `!`
  - Built-in functions: `size`, `matches`, `map`, `filter`, `startsWith`, `endsWith`, etc.
  - Literals: integers, floats, strings, bytes
  - Identifiers: standard and backtick-escaped

### 🔌 LSP Integration
- **Real-time validation**: Syntax and semantic errors as you type
- **Auto-completion**: Context-aware suggestions for CEL functions and operators
- **Hover information**: Documentation and type information on hover
- **Go-to-definition**: Navigate to symbol definitions
- **Diagnostics**: Real-time error and warning messages

### 🚀 Performance
- **Debounced updates**: Changes are batched to reduce server requests
- **Optimized rendering**: Monaco's efficient text rendering
- **Fast startup**: Vite's instant server start and HMR

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CEL Editor Web App                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   Monaco Editor                       │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   Monarch    │  │   Language   │  │  Editor    │ │  │
│  │  │  Tokenizer   │  │   Features   │  │  Instance  │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│                            │ HTTP/JSON-RPC                   │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  LSP Client                           │  │
│  │  • Initialize  • Completion  • Hover  • Definition   │  │
│  │  • didOpen     • didChange   • didClose              │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
                           ▼
        ┌─────────────────────────────────────────┐
        │     Cloudflare Workers LSP Backend      │
        │  • tower-lsp   • workers-rs   • cel    │
        └─────────────────────────────────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Running instance of the CEL LSP server (see [../README.md](../README.md))

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env to point to your LSP server
# VITE_LSP_ENDPOINT=http://localhost:8787/lsp
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready to deploy to any static hosting service.

## Configuration

### LSP Endpoint

Configure the LSP server endpoint in `.env`:

```env
# Local development
VITE_LSP_ENDPOINT=http://localhost:8787/lsp

# Production (Cloudflare Workers)
VITE_LSP_ENDPOINT=https://your-worker.your-subdomain.workers.dev/lsp
```

You can also pass the endpoint as a prop to the `CelEditor` component:

```jsx
<CelEditor lspEndpoint="https://your-worker.workers.dev/lsp" />
```

## Project Structure

```
cel-editor-web/
├── src/
│   ├── cel-language.js        # Monarch tokenizer and language config
│   ├── lsp-client.js          # LSP client for Cloudflare Workers
│   ├── CelEditor.jsx          # Main editor component
│   ├── App.jsx                # App component
│   ├── App.css                # App styles
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── index.html                 # HTML entry point
├── vite.config.js             # Vite configuration
├── package.json               # Dependencies
├── .env.example               # Environment template
└── README.md                  # This file
```

## Components

### CelEditor

The main editor component with LSP integration.

```jsx
import CelEditor from './CelEditor';

<CelEditor lspEndpoint="http://localhost:8787/lsp" />
```

**Props:**
- `lspEndpoint` (string): URL of the LSP server endpoint

**Features:**
- Monaco Editor with CEL language support
- Real-time LSP connection status
- Error display
- Syntax highlighting
- Auto-completion
- Hover information
- Diagnostics panel

### LSP Client

HTTP-based LSP client that communicates with the Cloudflare Workers backend.

```javascript
import { CELLSPClient } from './lsp-client';

const client = new CELLSPClient('http://localhost:8787/lsp');
await client.initialize();
await client.didOpenTextDocument(uri, 'cel', 1, content);
```

**Methods:**
- `initialize()`: Initialize LSP server
- `didOpenTextDocument()`: Notify of document open
- `didChangeTextDocument()`: Notify of document change
- `didCloseTextDocument()`: Notify of document close
- `completion()`: Request completion items
- `hover()`: Request hover information
- `definition()`: Request definition location

## Deployment

### Deploy to Cloudflare Pages

```bash
npm run build
npx wrangler pages publish dist
```

### Deploy to Vercel

```bash
npm run build
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Development

### Adding New Language Features

1. **Syntax Highlighting**: Edit `src/cel-language.js`
   - Add keywords to `keywords` array
   - Add functions to `builtinFunctions` array
   - Modify tokenizer rules in `tokenizer.root`

2. **LSP Features**: Edit `src/lsp-client.js`
   - Add new LSP methods
   - Implement corresponding Monaco providers

3. **UI Updates**: Edit `src/CelEditor.jsx`
   - Modify editor options
   - Update theme
   - Add new UI elements

### Testing

The editor can be tested with the local LSP server:

```bash
# Terminal 1: Start LSP server
cd ../
wrangler dev

# Terminal 2: Start web app
cd cel-editor-web
npm run dev
```

## Troubleshooting

### LSP Connection Issues

- **Check endpoint**: Ensure `VITE_LSP_ENDPOINT` is correct
- **CORS**: The Cloudflare Workers backend must allow CORS requests
- **Network**: Check browser console for network errors

### Syntax Highlighting Not Working

- **Language registration**: Ensure Monaco has registered the 'cel' language
- **Theme**: Check that 'cel-theme' is defined and applied

### Performance Issues

- **Debouncing**: Increase debounce timeout in `handleEditorDidMount`
- **Large files**: Consider adding file size limits
- **Network**: Use a closer Cloudflare Workers region

## Examples

### Basic CEL Expressions

```cel
// Boolean logic
true && false || true

// Arithmetic
1 + 2 * 3 / 4

// String operations
'hello' + ' ' + 'world'

// List operations
[1, 2, 3].map(x, x * 2)

// Conditionals
size([]) > 0 ? 'not empty' : 'empty'
```

### Complex Expressions

```cel
// Filter and size
size(items.filter(x, x.active && x.price > 100)) > 0

// Nested functions
has(user.profile) && user.profile.age >= 18

// String matching
email.matches('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

[Add your license here]

## Resources

- [CEL Specification](https://github.com/google/cel-spec)
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [LSP Specification](https://microsoft.github.io/language-server-protocol/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

## Related Projects

- [CEL LSP Server](../) - The Cloudflare Workers-based LSP backend
- [cel-rust](https://github.com/cel-rust/cel-rust) - Rust implementation of CEL
- [cel-spec](https://github.com/google/cel-spec) - CEL specification
