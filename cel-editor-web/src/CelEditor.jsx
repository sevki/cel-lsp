import { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { celLanguageConfiguration, celMonarchLanguage } from './cel-language';
import { CELLSPClient, createMonacoLanguageProviders } from './lsp-client';

const DEFAULT_CEL_CODE = `// CEL (Common Expression Language) Editor
// Connected to Cloudflare Workers LSP backend

// Simple expressions
1 + 1 == 2

// String operations
'hello' + ' world'

// List operations
[1, 2, 3].map(x, x * 2)

// Conditionals
size([1, 2, 3]) > 0 ? 'not empty' : 'empty'

// Complex expressions
size(items.filter(x, x.active)) > 0 && user.age >= 18`;

export default function CelEditor({ lspEndpoint = 'http://localhost:8787/lsp' }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const lspClientRef = useRef(null);
  const [isLspConnected, setIsLspConnected] = useState(false);
  const [lspError, setLspError] = useState(null);
  const [diagnostics, setDiagnostics] = useState([]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (lspClientRef.current) {
        lspClientRef.current.shutdown();
      }
    };
  }, []);

  const handleEditorWillMount = (monaco) => {
    monacoRef.current = monaco;

    // Register CEL language
    monaco.languages.register({ id: 'cel' });

    // Set language configuration
    monaco.languages.setLanguageConfiguration('cel', celLanguageConfiguration);

    // Set monarch tokenizer
    monaco.languages.setMonarchTokensProvider('cel', celMonarchLanguage);

    // Define theme for CEL
    monaco.editor.defineTheme('cel-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'function.builtin', foreground: 'DCDCAA' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.float', foreground: 'B5CEA8' },
        { token: 'number.uint', foreground: 'B5CEA8' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.bytes', foreground: 'D7BA7D' },
        { token: 'string.raw', foreground: 'D7BA7D' },
        { token: 'string.escape', foreground: 'D7BA7D', fontStyle: 'bold' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'identifier.escape', foreground: '4EC9B0' }
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41'
      }
    });
  };

  const handleEditorDidMount = async (editor, monaco) => {
    editorRef.current = editor;

    // Initialize LSP client
    try {
      const lspClient = new CELLSPClient(lspEndpoint);
      lspClientRef.current = lspClient;

      // Initialize the server
      const capabilities = await lspClient.initialize();
      console.log('LSP Server capabilities:', capabilities);
      setIsLspConnected(true);
      setLspError(null);

      // Notify server of document open
      const model = editor.getModel();
      const uri = model.uri.toString();
      await lspClient.didOpenTextDocument(uri, 'cel', 1, model.getValue());

      // Create and register language providers
      const providers = createMonacoLanguageProviders(monaco, lspClient);

      monaco.languages.registerCompletionItemProvider('cel', providers.completionProvider);
      monaco.languages.registerHoverProvider('cel', providers.hoverProvider);
      monaco.languages.registerDefinitionProvider('cel', providers.definitionProvider);

      // Listen for content changes
      let changeTimeout;
      model.onDidChangeContent(() => {
        clearTimeout(changeTimeout);
        changeTimeout = setTimeout(async () => {
          const uri = model.uri.toString();
          const content = model.getValue();
          const version = model.getVersionId();
          await lspClient.didChangeTextDocument(uri, version, content);
        }, 300); // Debounce 300ms
      });

    } catch (error) {
      console.error('Failed to connect to LSP server:', error);
      setIsLspConnected(false);
      setLspError(error.message);
    }
  };

  const handleEditorChange = (value) => {
    // Value changes are handled by the onDidChangeContent listener
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* Header */}
      <div style={{
        background: '#2D2D30',
        color: '#CCCCCC',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1E1E1E'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            CEL Editor
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#858585' }}>
            Common Expression Language with LSP support
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            background: isLspConnected ? '#1E3A20' : (lspError ? '#3A1E1E' : '#3A3A1E'),
            fontSize: '12px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isLspConnected ? '#4EC9B0' : (lspError ? '#F48771' : '#D7BA7D')
            }}></span>
            <span>
              {isLspConnected ? 'LSP Connected' : (lspError ? 'LSP Error' : 'LSP Connecting...')}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: '#858585' }}>
            Endpoint: {lspEndpoint}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {lspError && (
        <div style={{
          background: '#5A1E1E',
          color: '#F48771',
          padding: '10px 20px',
          fontSize: '13px',
          borderBottom: '1px solid #F48771'
        }}>
          <strong>LSP Connection Error:</strong> {lspError}
          <br />
          <small>The editor will work in syntax-only mode without LSP features.</small>
        </div>
      )}

      {/* Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="cel"
          defaultValue={DEFAULT_CEL_CODE}
          theme="cel-theme"
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            suggest: {
              showKeywords: true,
              showSnippets: false
            }
          }}
        />
      </div>

      {/* Footer with diagnostics */}
      {diagnostics.length > 0 && (
        <div style={{
          background: '#252526',
          color: '#CCCCCC',
          padding: '10px 20px',
          borderTop: '1px solid #1E1E1E',
          maxHeight: '150px',
          overflowY: 'auto',
          fontSize: '13px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Diagnostics</h3>
          {diagnostics.map((diag, i) => (
            <div key={i} style={{
              padding: '6px 0',
              borderBottom: i < diagnostics.length - 1 ? '1px solid #3E3E42' : 'none'
            }}>
              <span style={{ color: diag.severity === 1 ? '#F48771' : '#D7BA7D' }}>
                {diag.severity === 1 ? '❌' : '⚠️'}
              </span>{' '}
              {diag.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
