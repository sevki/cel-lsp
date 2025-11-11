use cel_lsp::lsp::Backend;
use tower_lsp::lsp_types::*;
use tower_lsp::{LanguageServer, LspService};

#[tokio::test]
async fn test_initialize_server() {
    let (service, _socket) = LspService::build(|client| Backend::new(client))
        .finish();

    #[allow(deprecated)]
    let params = InitializeParams {
        process_id: None,
        root_path: None,
        root_uri: None,
        initialization_options: None,
        capabilities: ClientCapabilities::default(),
        trace: None,
        workspace_folders: None,
        client_info: None,
        locale: None,
    };

    let inner = service.inner();
    let result = inner.initialize(params).await;

    assert!(result.is_ok(), "Server initialization should succeed");
    let init_result = result.unwrap();

    // Check server info
    assert_eq!(init_result.server_info.as_ref().unwrap().name, "cel-lsp");
    assert_eq!(init_result.server_info.as_ref().unwrap().version, Some("0.1.0".to_string()));

    // Check capabilities
    assert!(init_result.capabilities.text_document_sync.is_some());
    assert!(init_result.capabilities.completion_provider.is_some());
    assert!(init_result.capabilities.hover_provider.is_some());
    assert!(init_result.capabilities.definition_provider.is_some());
}

#[tokio::test]
async fn test_shutdown_server() {
    let (service, _socket) = LspService::build(|client| Backend::new(client))
        .finish();

    let inner = service.inner();
    let result = inner.shutdown().await;

    assert!(result.is_ok(), "Server shutdown should succeed");
}

#[tokio::test]
async fn test_completion_provider() {
    let (service, _socket) = LspService::build(|client| Backend::new(client))
        .finish();

    let params = CompletionParams {
        text_document_position: TextDocumentPositionParams {
            text_document: TextDocumentIdentifier {
                uri: Url::parse("file:///test.cel").unwrap(),
            },
            position: Position {
                line: 0,
                character: 0,
            },
        },
        work_done_progress_params: WorkDoneProgressParams::default(),
        partial_result_params: PartialResultParams::default(),
        context: None,
    };

    let inner = service.inner();
    let result = inner.completion(params).await;

    assert!(result.is_ok(), "Completion should succeed");
    let completion = result.unwrap();

    assert!(completion.is_some(), "Should return completion items");

    if let Some(CompletionResponse::Array(items)) = completion {
        assert!(!items.is_empty(), "Should have at least one completion item");

        // Check for CEL built-in functions
        let labels: Vec<&str> = items.iter().map(|i| i.label.as_str()).collect();
        assert!(labels.contains(&"size"), "Should include 'size' function");
        assert!(labels.contains(&"matches"), "Should include 'matches' function");
    }
}

#[tokio::test]
async fn test_hover_provider() {
    let (service, _socket) = LspService::build(|client| Backend::new(client))
        .finish();

    let params = HoverParams {
        text_document_position_params: TextDocumentPositionParams {
            text_document: TextDocumentIdentifier {
                uri: Url::parse("file:///test.cel").unwrap(),
            },
            position: Position {
                line: 0,
                character: 0,
            },
        },
        work_done_progress_params: WorkDoneProgressParams::default(),
    };

    let inner = service.inner();
    let result = inner.hover(params).await;

    assert!(result.is_ok(), "Hover should succeed");
    let hover = result.unwrap();

    assert!(hover.is_some(), "Should return hover information");
}

#[tokio::test]
async fn test_document_lifecycle() {
    let (service, _socket) = LspService::build(|client| Backend::new(client))
        .finish();

    let uri = Url::parse("file:///test.cel").unwrap();

    // Test did_open
    let open_params = DidOpenTextDocumentParams {
        text_document: TextDocumentItem {
            uri: uri.clone(),
            language_id: "cel".to_string(),
            version: 1,
            text: "1 + 1 == 2".to_string(),
        },
    };

    let inner = service.inner();
    inner.did_open(open_params).await;

    // Test did_change
    let change_params = DidChangeTextDocumentParams {
        text_document: VersionedTextDocumentIdentifier {
            uri: uri.clone(),
            version: 2,
        },
        content_changes: vec![TextDocumentContentChangeEvent {
            range: None,
            range_length: None,
            text: "2 + 2 == 4".to_string(),
        }],
    };

    inner.did_change(change_params).await;

    // Test did_close
    let close_params = DidCloseTextDocumentParams {
        text_document: TextDocumentIdentifier {
            uri: uri.clone(),
        },
    };

    inner.did_close(close_params).await;

    // If we get here without panicking, the document lifecycle works
    assert!(true, "Document lifecycle should complete without errors");
}
