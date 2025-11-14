/**
 * LSP Client for CEL Language Server running on Cloudflare Workers
 * Connects Monaco Editor to the HTTP-based LSP endpoint
 */

export class CELLSPClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.messageId = 1;
    this.pendingRequests = new Map();
    this.isInitialized = false;
  }

  /**
   * Send a JSON-RPC request to the LSP server
   */
  async sendRequest(method, params = {}) {
    const id = this.messageId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(`LSP Error: ${result.error.message}`);
      }

      return result.result;
    } catch (error) {
      console.error('LSP request failed:', error);
      throw error;
    }
  }

  /**
   * Send a JSON-RPC notification (no response expected)
   */
  async sendNotification(method, params = {}) {
    const notification = {
      jsonrpc: '2.0',
      method,
      params
    };

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notification)
      });
    } catch (error) {
      console.error('LSP notification failed:', error);
    }
  }

  /**
   * Initialize the LSP server
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    const capabilities = await this.sendRequest('initialize', {
      processId: null,
      rootUri: null,
      capabilities: {
        textDocument: {
          synchronization: {
            dynamicRegistration: false,
            didSave: false
          },
          completion: {
            dynamicRegistration: false,
            completionItem: {
              snippetSupport: false
            }
          },
          hover: {
            dynamicRegistration: false,
            contentFormat: ['plaintext', 'markdown']
          },
          definition: {
            dynamicRegistration: false
          }
        }
      }
    });

    await this.sendNotification('initialized', {});
    this.isInitialized = true;

    return capabilities;
  }

  /**
   * Notify server of document open
   */
  async didOpenTextDocument(uri, languageId, version, text) {
    await this.sendNotification('textDocument/didOpen', {
      textDocument: {
        uri,
        languageId,
        version,
        text
      }
    });
  }

  /**
   * Notify server of document change
   */
  async didChangeTextDocument(uri, version, text) {
    await this.sendNotification('textDocument/didChange', {
      textDocument: {
        uri,
        version
      },
      contentChanges: [{
        text
      }]
    });
  }

  /**
   * Notify server of document close
   */
  async didCloseTextDocument(uri) {
    await this.sendNotification('textDocument/didClose', {
      textDocument: {
        uri
      }
    });
  }

  /**
   * Request completion items at a position
   */
  async completion(uri, position) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await this.sendRequest('textDocument/completion', {
      textDocument: {
        uri
      },
      position
    });
  }

  /**
   * Request hover information at a position
   */
  async hover(uri, position) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await this.sendRequest('textDocument/hover', {
      textDocument: {
        uri
      },
      position
    });
  }

  /**
   * Request definition location
   */
  async definition(uri, position) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return await this.sendRequest('textDocument/definition', {
      textDocument: {
        uri
      },
      position
    });
  }

  /**
   * Shutdown the LSP server
   */
  async shutdown() {
    if (this.isInitialized) {
      await this.sendRequest('shutdown');
      await this.sendNotification('exit');
      this.isInitialized = false;
    }
  }
}

/**
 * Create Monaco language features providers that use the LSP client
 */
export function createMonacoLanguageProviders(monaco, lspClient) {
  return {
    // Completion provider
    completionProvider: {
      provideCompletionItems: async (model, position) => {
        try {
          const uri = model.uri.toString();
          const result = await lspClient.completion(uri, {
            line: position.lineNumber - 1,
            character: position.column - 1
          });

          if (!result) {
            return { suggestions: [] };
          }

          const suggestions = (Array.isArray(result) ? result : result.items || []).map(item => ({
            label: item.label,
            kind: mapCompletionItemKind(monaco, item.kind),
            detail: item.detail,
            documentation: item.documentation,
            insertText: item.insertText || item.label,
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column,
              endLineNumber: position.lineNumber,
              endColumn: position.column
            }
          }));

          return { suggestions };
        } catch (error) {
          console.error('Completion failed:', error);
          return { suggestions: [] };
        }
      }
    },

    // Hover provider
    hoverProvider: {
      provideHover: async (model, position) => {
        try {
          const uri = model.uri.toString();
          const result = await lspClient.hover(uri, {
            line: position.lineNumber - 1,
            character: position.column - 1
          });

          if (!result || !result.contents) {
            return null;
          }

          return {
            contents: [
              { value: typeof result.contents === 'string' ? result.contents : result.contents.value }
            ]
          };
        } catch (error) {
          console.error('Hover failed:', error);
          return null;
        }
      }
    },

    // Definition provider
    definitionProvider: {
      provideDefinition: async (model, position) => {
        try {
          const uri = model.uri.toString();
          const result = await lspClient.definition(uri, {
            line: position.lineNumber - 1,
            character: position.column - 1
          });

          if (!result) {
            return null;
          }

          const locations = Array.isArray(result) ? result : [result];
          return locations.map(loc => ({
            uri: monaco.Uri.parse(loc.uri),
            range: {
              startLineNumber: loc.range.start.line + 1,
              startColumn: loc.range.start.character + 1,
              endLineNumber: loc.range.end.line + 1,
              endColumn: loc.range.end.character + 1
            }
          }));
        } catch (error) {
          console.error('Definition failed:', error);
          return null;
        }
      }
    }
  };
}

/**
 * Map LSP CompletionItemKind to Monaco CompletionItemKind
 */
function mapCompletionItemKind(monaco, kind) {
  const kindMap = {
    1: monaco.languages.CompletionItemKind.Text,
    2: monaco.languages.CompletionItemKind.Method,
    3: monaco.languages.CompletionItemKind.Function,
    4: monaco.languages.CompletionItemKind.Constructor,
    5: monaco.languages.CompletionItemKind.Field,
    6: monaco.languages.CompletionItemKind.Variable,
    7: monaco.languages.CompletionItemKind.Class,
    8: monaco.languages.CompletionItemKind.Interface,
    9: monaco.languages.CompletionItemKind.Module,
    10: monaco.languages.CompletionItemKind.Property,
    11: monaco.languages.CompletionItemKind.Unit,
    12: monaco.languages.CompletionItemKind.Value,
    13: monaco.languages.CompletionItemKind.Enum,
    14: monaco.languages.CompletionItemKind.Keyword,
    15: monaco.languages.CompletionItemKind.Snippet,
    16: monaco.languages.CompletionItemKind.Color,
    17: monaco.languages.CompletionItemKind.File,
    18: monaco.languages.CompletionItemKind.Reference,
    19: monaco.languages.CompletionItemKind.Folder,
    20: monaco.languages.CompletionItemKind.EnumMember,
    21: monaco.languages.CompletionItemKind.Constant,
    22: monaco.languages.CompletionItemKind.Struct,
    23: monaco.languages.CompletionItemKind.Event,
    24: monaco.languages.CompletionItemKind.Operator,
    25: monaco.languages.CompletionItemKind.TypeParameter
  };

  return kindMap[kind] || monaco.languages.CompletionItemKind.Text;
}
