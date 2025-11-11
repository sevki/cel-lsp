use worker::*;

mod lsp;
use lsp::Backend;

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();

    Router::new()
        .post_async("/lsp", |mut req, _ctx| async move {
            // Handle LSP JSON-RPC requests
            let body = req.text().await?;

            // Parse and handle the LSP request
            match serde_json::from_str::<serde_json::Value>(&body) {
                Ok(json_rpc) => {
                    // Handle the JSON-RPC request
                    let response = handle_lsp_request(json_rpc).await;
                    Response::from_json(&response)
                }
                Err(e) => {
                    Response::error(format!("Invalid JSON-RPC: {}", e), 400)
                }
            }
        })
        .get("/health", |_, _| {
            Response::ok("LSP Server is running")
        })
        .run(req, env)
        .await
}

async fn handle_lsp_request(request: serde_json::Value) -> serde_json::Value {
    // This is a simplified handler - in a full implementation,
    // you'd integrate with tower-lsp's message handling

    if let Some(method) = request.get("method").and_then(|m| m.as_str()) {
        match method {
            "initialize" => {
                serde_json::json!({
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
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
                })
            }
            "initialized" => {
                serde_json::json!({
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": null
                })
            }
            _ => {
                serde_json::json!({
                    "jsonrpc": "2.0",
                    "id": request.get("id"),
                    "result": null
                })
            }
        }
    } else {
        serde_json::json!({
            "jsonrpc": "2.0",
            "error": {
                "code": -32600,
                "message": "Invalid Request"
            }
        })
    }
}
