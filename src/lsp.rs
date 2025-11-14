use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types::*;
use tower_lsp::{LanguageServer, LspService, Client};
use std::sync::Arc;
use tokio::sync::RwLock;
use cel::Program;

#[derive(Debug)]
pub struct Backend {
    /// Store for document contents
    documents: Arc<RwLock<std::collections::HashMap<String, String>>>,
    /// LSP client for sending notifications
    client: Client,
}

impl Backend {
    pub fn new(client: Client) -> Self {
        Self {
            documents: Arc::new(RwLock::new(std::collections::HashMap::new())),
            client,
        }
    }

    /// Validate a CEL expression and return diagnostics
    async fn validate_document(&self, _uri: Url, content: &str) -> Vec<Diagnostic> {
        let mut diagnostics = Vec::new();

        // Try to compile the CEL expression
        match Program::compile(content) {
            Ok(_program) => {
                // Successfully compiled, no errors
            }
            Err(e) => {
                // Compilation error - create a diagnostic
                let diagnostic = Diagnostic {
                    range: Range {
                        start: Position {
                            line: 0,
                            character: 0,
                        },
                        end: Position {
                            line: 0,
                            character: content.len() as u32,
                        },
                    },
                    severity: Some(DiagnosticSeverity::ERROR),
                    code: None,
                    code_description: None,
                    source: Some("cel-lsp".to_string()),
                    message: format!("CEL compilation error: {}", e),
                    related_information: None,
                    tags: None,
                    data: None,
                };
                diagnostics.push(diagnostic);
            }
        }

        diagnostics
    }
}

#[tower_lsp::async_trait]
impl LanguageServer for Backend {
    async fn initialize(&self, _: InitializeParams) -> Result<InitializeResult> {
        Ok(InitializeResult {
            server_info: Some(ServerInfo {
                name: "cel-lsp".to_string(),
                version: Some("0.1.0".to_string()),
            }),
            offset_encoding: Some("utf-16".to_string()),
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Kind(
                    TextDocumentSyncKind::FULL,
                )),
                completion_provider: Some(CompletionOptions {
                    resolve_provider: Some(true),
                    trigger_characters: Some(vec![".".to_string()]),
                    ..Default::default()
                }),
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                definition_provider: Some(OneOf::Left(true)),
                ..Default::default()
            },
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        // Log that the server has been initialized
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn did_open(&self, params: DidOpenTextDocumentParams) {
        let uri = params.text_document.uri.clone();
        let content = params.text_document.text;

        // Validate and publish diagnostics
        let diagnostics = self.validate_document(uri.clone(), &content).await;
        self.client
            .publish_diagnostics(uri.clone(), diagnostics, Some(params.text_document.version))
            .await;

        // Store document
        let mut documents = self.documents.write().await;
        documents.insert(uri.to_string(), content);
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        let uri = params.text_document.uri.clone();

        if let Some(change) = params.content_changes.first() {
            let content = change.text.clone();

            // Validate and publish diagnostics
            let diagnostics = self.validate_document(uri.clone(), &content).await;
            self.client
                .publish_diagnostics(uri.clone(), diagnostics, Some(params.text_document.version))
                .await;

            // Store document
            let mut documents = self.documents.write().await;
            documents.insert(uri.to_string(), content);
        }
    }

    async fn did_close(&self, params: DidCloseTextDocumentParams) {
        let uri = params.text_document.uri.to_string();

        let mut documents = self.documents.write().await;
        documents.remove(&uri);
    }

    async fn completion(&self, _params: CompletionParams) -> Result<Option<CompletionResponse>> {
        // TODO: Implement CEL-specific completions
        let items = vec![
            CompletionItem {
                label: "size".to_string(),
                kind: Some(CompletionItemKind::FUNCTION),
                detail: Some("Returns the size of a list, map, or string".to_string()),
                ..Default::default()
            },
            CompletionItem {
                label: "matches".to_string(),
                kind: Some(CompletionItemKind::FUNCTION),
                detail: Some("Tests whether a string matches a regular expression".to_string()),
                ..Default::default()
            },
        ];

        Ok(Some(CompletionResponse::Array(items)))
    }

    async fn hover(&self, _params: HoverParams) -> Result<Option<Hover>> {
        // TODO: Implement CEL-specific hover information
        Ok(Some(Hover {
            contents: HoverContents::Scalar(MarkedString::String(
                "CEL Language Server".to_string(),
            )),
            range: None,
        }))
    }

    async fn goto_definition(
        &self,
        _params: GotoDefinitionParams,
    ) -> Result<Option<GotoDefinitionResponse>> {
        // TODO: Implement CEL-specific goto definition
        Ok(None)
    }
}

pub fn create_lsp_service() -> (LspService<Backend>, tower_lsp::ClientSocket) {
    LspService::new(|client| Backend::new(client))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cel_validation_valid_expression() {
        // Test that valid CEL expressions compile successfully
        let expr = "1 + 1 == 2";
        let result = Program::compile(expr);
        assert!(result.is_ok(), "Valid CEL expression should compile");
    }

    #[test]
    fn test_cel_validation_invalid_expression() {
        // Test that invalid CEL expressions fail to compile
        let expr = "1 + + 2";
        let result = Program::compile(expr);
        assert!(result.is_err(), "Invalid CEL expression should fail to compile");
    }

    #[test]
    fn test_cel_validation_function_call() {
        // Test that CEL function calls compile
        let expr = "size([1, 2, 3])";
        let result = Program::compile(expr);
        assert!(result.is_ok(), "CEL function call should compile");
    }

    #[test]
    fn test_cel_validation_string_operations() {
        // Test string operations in CEL
        let expr = "'hello' + ' world'";
        let result = Program::compile(expr);
        assert!(result.is_ok(), "CEL string concatenation should compile");
    }

    #[test]
    fn test_cel_validation_list_operations() {
        // Test list operations in CEL
        let expr = "[1, 2, 3].map(x, x * 2)";
        let result = Program::compile(expr);
        assert!(result.is_ok(), "CEL list map operation should compile");
    }

    #[test]
    fn test_cel_validation_conditional() {
        // Test conditional expressions in CEL
        let expr = "true ? 'yes' : 'no'";
        let result = Program::compile(expr);
        assert!(result.is_ok(), "CEL conditional should compile");
    }

    #[test]
    fn test_cel_validation_empty_expression() {
        // Test empty expression
        let expr = "";
        let result = Program::compile(expr);
        assert!(result.is_err(), "Empty CEL expression should fail to compile");
    }

    #[test]
    fn test_cel_validation_complex_expression() {
        // Test a more complex CEL expression
        let expr = "size(items.filter(x, x.active)) > 0 && user.age >= 18";
        let result = Program::compile(expr);
        assert!(result.is_ok(), "Complex CEL expression should compile");
    }
}
