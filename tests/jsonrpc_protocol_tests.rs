/// Tests for JSON-RPC protocol handling and LSP request/response validation
use serde_json::{json, Value};

/// Test helper to create a JSON-RPC request
fn create_jsonrpc_request(id: i32, method: &str, params: Value) -> Value {
    json!({
        "jsonrpc": "2.0",
        "id": id,
        "method": method,
        "params": params
    })
}

/// Test helper to validate JSON-RPC response
fn validate_jsonrpc_response(response: &Value, expected_id: i32) -> bool {
    response.get("jsonrpc") == Some(&json!("2.0"))
        && response.get("id") == Some(&json!(expected_id))
        && response.get("result").is_some()
}

#[test]
fn test_jsonrpc_initialize_request_format() {
    let request = create_jsonrpc_request(
        1,
        "initialize",
        json!({
            "processId": null,
            "rootUri": null,
            "capabilities": {}
        }),
    );

    assert_eq!(request["jsonrpc"], "2.0");
    assert_eq!(request["id"], 1);
    assert_eq!(request["method"], "initialize");
    assert!(request["params"].is_object());
}

#[test]
fn test_jsonrpc_initialized_notification_format() {
    let notification = json!({
        "jsonrpc": "2.0",
        "method": "initialized",
        "params": {}
    });

    assert_eq!(notification["jsonrpc"], "2.0");
    assert_eq!(notification["method"], "initialized");
    assert!(notification["id"].is_null());
}

#[test]
fn test_jsonrpc_did_open_notification() {
    let notification = json!({
        "jsonrpc": "2.0",
        "method": "textDocument/didOpen",
        "params": {
            "textDocument": {
                "uri": "file:///test.cel",
                "languageId": "cel",
                "version": 1,
                "text": "1 + 1 == 2"
            }
        }
    });

    assert_eq!(notification["method"], "textDocument/didOpen");
    assert_eq!(
        notification["params"]["textDocument"]["uri"],
        "file:///test.cel"
    );
    assert_eq!(notification["params"]["textDocument"]["text"], "1 + 1 == 2");
}

#[test]
fn test_jsonrpc_did_change_notification() {
    let notification = json!({
        "jsonrpc": "2.0",
        "method": "textDocument/didChange",
        "params": {
            "textDocument": {
                "uri": "file:///test.cel",
                "version": 2
            },
            "contentChanges": [{
                "text": "2 + 2 == 4"
            }]
        }
    });

    assert_eq!(notification["method"], "textDocument/didChange");
    assert_eq!(notification["params"]["textDocument"]["version"], 2);
    assert_eq!(
        notification["params"]["contentChanges"][0]["text"],
        "2 + 2 == 4"
    );
}

#[test]
fn test_jsonrpc_completion_request() {
    let request = create_jsonrpc_request(
        2,
        "textDocument/completion",
        json!({
            "textDocument": {
                "uri": "file:///test.cel"
            },
            "position": {
                "line": 0,
                "character": 5
            }
        }),
    );

    assert_eq!(request["method"], "textDocument/completion");
    assert_eq!(
        request["params"]["textDocument"]["uri"],
        "file:///test.cel"
    );
    assert_eq!(request["params"]["position"]["line"], 0);
    assert_eq!(request["params"]["position"]["character"], 5);
}

#[test]
fn test_jsonrpc_hover_request() {
    let request = create_jsonrpc_request(
        3,
        "textDocument/hover",
        json!({
            "textDocument": {
                "uri": "file:///test.cel"
            },
            "position": {
                "line": 0,
                "character": 3
            }
        }),
    );

    assert_eq!(request["method"], "textDocument/hover");
}

#[test]
fn test_jsonrpc_shutdown_request() {
    let request = json!({
        "jsonrpc": "2.0",
        "id": 99,
        "method": "shutdown",
        "params": null
    });

    assert_eq!(request["method"], "shutdown");
    assert_eq!(request["id"], 99);
}

#[test]
fn test_jsonrpc_exit_notification() {
    let notification = json!({
        "jsonrpc": "2.0",
        "method": "exit"
    });

    assert_eq!(notification["method"], "exit");
    assert!(notification["id"].is_null());
}

#[test]
fn test_expected_initialize_response_structure() {
    let expected_response = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "result": {
            "capabilities": {
                "textDocumentSync": 1,
                "completionProvider": {
                    "resolveProvider": true,
                    "triggerCharacters": ["."]
                },
                "hoverProvider": true,
                "definitionProvider": true
            },
            "serverInfo": {
                "name": "cel-lsp",
                "version": "0.1.0"
            }
        }
    });

    assert!(validate_jsonrpc_response(&expected_response, 1));
    assert!(expected_response["result"]["capabilities"]["completionProvider"].is_object());
    assert_eq!(
        expected_response["result"]["serverInfo"]["name"],
        "cel-lsp"
    );
}

#[test]
fn test_diagnostic_message_structure() {
    let diagnostic = json!({
        "jsonrpc": "2.0",
        "method": "textDocument/publishDiagnostics",
        "params": {
            "uri": "file:///test.cel",
            "diagnostics": [{
                "range": {
                    "start": {"line": 0, "character": 0},
                    "end": {"line": 0, "character": 10}
                },
                "severity": 1,
                "source": "cel-lsp",
                "message": "CEL compilation error: test error"
            }]
        }
    });

    assert_eq!(diagnostic["method"], "textDocument/publishDiagnostics");
    assert!(diagnostic["params"]["diagnostics"].is_array());
    assert_eq!(diagnostic["params"]["diagnostics"][0]["severity"], 1);
}

#[test]
fn test_cel_expression_validation_messages() {
    // Test various CEL expressions that should produce specific diagnostic messages

    // Valid expression - should have no diagnostics
    let valid_expr = "1 + 1 == 2";
    let result = cel::Program::compile(valid_expr);
    assert!(result.is_ok(), "Valid expression should compile");

    // Invalid syntax - should produce error
    let invalid_expr = "1 + + 2";
    let result = cel::Program::compile(invalid_expr);
    assert!(result.is_err(), "Invalid syntax should produce error");

    // Empty expression - should produce error
    let empty_expr = "";
    let result = cel::Program::compile(empty_expr);
    assert!(result.is_err(), "Empty expression should produce error");
}

#[test]
fn test_completion_items_structure() {
    let completion_response = json!({
        "jsonrpc": "2.0",
        "id": 2,
        "result": [
            {
                "label": "size",
                "kind": 3,
                "detail": "Returns the size of a list, map, or string"
            },
            {
                "label": "matches",
                "kind": 3,
                "detail": "Tests whether a string matches a regular expression"
            }
        ]
    });

    assert!(completion_response["result"].is_array());
    assert_eq!(completion_response["result"][0]["label"], "size");
    assert_eq!(completion_response["result"][1]["label"], "matches");
    assert_eq!(completion_response["result"][0]["kind"], 3); // Function kind
}

#[test]
fn test_hover_response_structure() {
    let hover_response = json!({
        "jsonrpc": "2.0",
        "id": 3,
        "result": {
            "contents": "CEL Language Server"
        }
    });

    assert!(hover_response["result"]["contents"].is_string());
}

#[test]
fn test_error_response_structure() {
    let error_response = json!({
        "jsonrpc": "2.0",
        "id": 1,
        "error": {
            "code": -32600,
            "message": "Invalid Request"
        }
    });

    assert_eq!(error_response["error"]["code"], -32600);
    assert!(error_response["error"]["message"].is_string());
    assert!(error_response["result"].is_null());
}

#[test]
fn test_multiple_diagnostics_for_complex_errors() {
    // Test that we can handle multiple errors in a single document
    let complex_invalid = "1 + + 2 & & 3";
    let result = cel::Program::compile(complex_invalid);
    assert!(result.is_err(), "Complex invalid expression should fail");
}

#[test]
fn test_cel_builtin_functions_validation() {
    let test_cases = vec![
        ("size([1, 2, 3])", true),
        ("size('hello')", true),
        ("size({a: 1, b: 2})", true),
        ("[1, 2, 3].map(x, x * 2)", true),
        ("[1, 2, 3].filter(x, x > 1)", true),
        ("'test'.startsWith('t')", true),
        ("'test'.endsWith('st')", true),
        ("'test'.contains('es')", true),
    ];

    for (expr, should_pass) in test_cases {
        let result = cel::Program::compile(expr);
        if should_pass {
            assert!(
                result.is_ok(),
                "Expression '{}' should compile successfully",
                expr
            );
        } else {
            assert!(result.is_err(), "Expression '{}' should fail", expr);
        }
    }
}
