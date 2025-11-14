---
name: Add configuration options
about: Implement user-configurable settings for LSP behavior
title: '[Feature] Add configuration options'
labels: enhancement, configuration
assignees: ''
---

## Description
Implement configuration system to allow users to customize LSP server behavior, including validation rules, completion preferences, and performance settings.

## Current State
- No configuration support
- Hardcoded behavior
- No user customization options
- No workspace-specific settings

## Proposed Configuration Categories

### 1. Validation Settings
```json
{
  "cel.validation.enabled": true,
  "cel.validation.level": "error",  // "error", "warning", "info"
  "cel.validation.checkTypes": true,
  "cel.validation.checkUndefinedVariables": true,
  "cel.validation.maxComplexity": 100,
  "cel.validation.maxDepth": 10
}
```

### 2. Completion Settings
```json
{
  "cel.completion.enabled": true,
  "cel.completion.includeBuiltins": true,
  "cel.completion.includeSnippets": true,
  "cel.completion.autoTrigger": true,
  "cel.completion.suggestVariables": true,
  "cel.completion.suggestFunctions": true,
  "cel.completion.sortOrder": "alphabetical"  // "alphabetical", "relevance"
}
```

### 3. Hover Settings
```json
{
  "cel.hover.enabled": true,
  "cel.hover.showDocumentation": true,
  "cel.hover.showExamples": true,
  "cel.hover.showTypes": true,
  "cel.hover.showSignatures": true
}
```

### 4. Macro Settings
```json
{
  "cel.macros.enabled": true,
  "cel.macros.expandOnHover": true,
  "cel.macros.showExpanded": true,
  "cel.macros.customMacros": []
}
```

### 5. Performance Settings
```json
{
  "cel.performance.maxFileSize": 1048576,  // 1MB
  "cel.performance.validationDelay": 500,  // ms
  "cel.performance.cacheSize": 100,        // documents
  "cel.performance.workerThreads": 4
}
```

### 6. Diagnostics Settings
```json
{
  "cel.diagnostics.enabledRules": ["all"],
  "cel.diagnostics.disabledRules": [],
  "cel.diagnostics.severity": {
    "undefinedVariable": "error",
    "typeMismatch": "error",
    "unusedVariable": "warning",
    "complexExpression": "info"
  }
}
```

### 7. Environment Settings
```json
{
  "cel.environment.variables": {
    "request": "Request",
    "response": "Response"
  },
  "cel.environment.functions": ["customFunc1", "customFunc2"],
  "cel.environment.types": {
    "Request": "path.to.proto.Request"
  }
}
```

## Implementation Details

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CelLspConfig {
    pub validation: ValidationConfig,
    pub completion: CompletionConfig,
    pub hover: HoverConfig,
    pub macros: MacroConfig,
    pub performance: PerformanceConfig,
    pub diagnostics: DiagnosticsConfig,
    pub environment: EnvironmentConfig,
}

impl Default for CelLspConfig {
    fn default() -> Self {
        Self {
            validation: ValidationConfig::default(),
            completion: CompletionConfig::default(),
            hover: HoverConfig::default(),
            macros: MacroConfig::default(),
            performance: PerformanceConfig::default(),
            diagnostics: DiagnosticsConfig::default(),
            environment: EnvironmentConfig::default(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationConfig {
    pub enabled: bool,
    pub level: DiagnosticLevel,
    pub check_types: bool,
    pub check_undefined_variables: bool,
    pub max_complexity: usize,
    pub max_depth: usize,
}

// ... other config structs

impl Backend {
    pub fn new(client: Client) -> Self {
        Self {
            documents: Arc::new(RwLock::new(HashMap::new())),
            config: Arc::new(RwLock::new(CelLspConfig::default())),
            client,
        }
    }
    
    async fn update_config(&self, new_config: CelLspConfig) {
        let mut config = self.config.write().await;
        *config = new_config;
        
        // Revalidate all documents with new config
        self.revalidate_all_documents().await;
    }
}
```

## Configuration Loading

### 1. Initialization
Receive configuration during `initialize`:
```rust
async fn initialize(&self, params: InitializeParams) -> Result<InitializeResult> {
    // Extract configuration from initialization options
    if let Some(init_options) = params.initialization_options {
        if let Ok(config) = serde_json::from_value::<CelLspConfig>(init_options) {
            self.update_config(config).await;
        }
    }
    // ... rest of initialization
}
```

### 2. Runtime Updates
Handle `workspace/didChangeConfiguration`:
```rust
async fn did_change_configuration(&self, params: DidChangeConfigurationParams) {
    if let Ok(config) = serde_json::from_value::<CelLspConfig>(params.settings) {
        self.update_config(config).await;
    }
}
```

### 3. Configuration Files
Support loading from files:
- `.cel-lsp.json` in workspace root
- `.vscode/settings.json` (VSCode specific)
- User-level configuration

## Configuration Schema

Provide JSON schema for IDE integration:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CEL LSP Configuration",
  "type": "object",
  "properties": {
    "cel.validation.enabled": {
      "type": "boolean",
      "default": true,
      "description": "Enable/disable CEL expression validation"
    },
    "cel.validation.level": {
      "type": "string",
      "enum": ["error", "warning", "info"],
      "default": "error",
      "description": "Default severity level for validation diagnostics"
    }
    // ... more properties
  }
}
```

## Configuration Validation

```rust
impl CelLspConfig {
    pub fn validate(&self) -> Result<(), ConfigError> {
        // Validate config values
        if self.performance.max_file_size == 0 {
            return Err(ConfigError::InvalidValue("max_file_size must be > 0"));
        }
        
        if self.performance.validation_delay > 5000 {
            return Err(ConfigError::InvalidValue("validation_delay too high"));
        }
        
        // ... more validations
        Ok(())
    }
}
```

## Impact on Features

### Validation
```rust
async fn validate_document(&self, uri: Url, content: &str) -> Vec<Diagnostic> {
    let config = self.config.read().await;
    
    if !config.validation.enabled {
        return Vec::new();
    }
    
    let mut diagnostics = Vec::new();
    
    // Use config to control validation behavior
    if config.validation.check_types {
        diagnostics.extend(self.check_types(content).await);
    }
    
    if config.validation.check_undefined_variables {
        diagnostics.extend(self.check_undefined_vars(content).await);
    }
    
    // Filter by severity level
    diagnostics.retain(|d| {
        d.severity.unwrap_or(DiagnosticSeverity::ERROR) 
            <= config.validation.level
    });
    
    diagnostics
}
```

### Completion
```rust
async fn completion(&self, params: CompletionParams) -> Result<Option<CompletionResponse>> {
    let config = self.config.read().await;
    
    if !config.completion.enabled {
        return Ok(None);
    }
    
    let mut items = Vec::new();
    
    if config.completion.include_builtins {
        items.extend(self.builtin_completions());
    }
    
    if config.completion.suggest_variables {
        items.extend(self.variable_completions(&params).await);
    }
    
    // Sort based on config
    match config.completion.sort_order {
        SortOrder::Alphabetical => items.sort_by(|a, b| a.label.cmp(&b.label)),
        SortOrder::Relevance => items.sort_by_key(|i| i.sort_text.clone()),
    }
    
    Ok(Some(CompletionResponse::Array(items)))
}
```

## Configuration UI

### VSCode Extension Settings
```typescript
// package.json contribution
{
  "contributes": {
    "configuration": {
      "title": "CEL LSP",
      "properties": {
        "cel.validation.enabled": {
          "type": "boolean",
          "default": true,
          "description": "Enable CEL validation"
        },
        "cel.completion.includeBuiltins": {
          "type": "boolean",
          "default": true,
          "description": "Include builtin functions in completions"
        }
        // ... more settings
      }
    }
  }
}
```

## Testing Requirements
- [ ] Test default configuration loads correctly
- [ ] Test configuration updates at runtime
- [ ] Test invalid configuration handling
- [ ] Test each configuration option affects behavior
- [ ] Test configuration persistence
- [ ] Test workspace-specific configuration
- [ ] Test configuration schema validation
- [ ] Test configuration migration (version upgrades)

## Documentation

### Configuration Guide
Create documentation with:
- Complete list of all options
- Description of each option
- Default values
- Examples of common configurations
- Best practices
- Performance tuning tips

### Example Configurations

#### Minimal Configuration
```json
{
  "cel.validation.enabled": true
}
```

#### Development Configuration
```json
{
  "cel.validation.enabled": true,
  "cel.validation.level": "warning",
  "cel.completion.includeSnippets": true,
  "cel.hover.showExamples": true
}
```

#### Production Configuration
```json
{
  "cel.validation.enabled": true,
  "cel.validation.level": "error",
  "cel.diagnostics.severity": {
    "undefinedVariable": "error",
    "typeMismatch": "error"
  },
  "cel.performance.validationDelay": 200
}
```

## Migration Support

### Version Compatibility
```rust
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigVersion {
    pub version: String,
}

impl CelLspConfig {
    pub fn migrate(old_config: Value) -> Result<Self, ConfigError> {
        // Detect version
        // Apply migrations
        // Return new config
    }
}
```

## References
- [LSP Configuration](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#workspace_didChangeConfiguration)
- [VSCode Settings](https://code.visualstudio.com/api/references/contribution-points#contributes.configuration)
- Current backend: `src/lsp.rs`
- Related: All other issues depend on configuration
