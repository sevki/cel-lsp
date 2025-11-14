# Creating GitHub Issues for CEL LSP Roadmap

This directory contains a script to automatically create GitHub issues for all 10 TODO items from the README.

## Quick Start

### Option 1: Using GitHub CLI (Recommended)

```bash
# Authenticate with GitHub CLI
gh auth login

# Run the script
./create-issues.sh
```

### Option 2: Using GitHub Token

```bash
# Set your GitHub token
export GH_TOKEN="your_github_token_here"

# Run the script
./create-issues.sh
```

### Option 3: GitHub Actions

The script can also be run in a GitHub Actions workflow. Add this to your workflow:

```yaml
- name: Create issues
  env:
    GH_TOKEN: ${{ github.token }}
  run: ./create-issues.sh
```

## What Gets Created

The script will create 10 issues covering:

1. **Parser and Semantic Analysis** - AST generation, type inference, scope tracking
2. **CEL-Specific Completions** - Builtin functions, operators, context-aware suggestions
3. **Expression Validation** - Type checking, precise error locations
4. **Syntax Error Diagnostics** - Quick fixes, actionable messages
5. **Function Signature Hover** - Parameters, types, documentation, examples
6. **Go-to-Definition** - Variable navigation, find references
7. **CEL Macros Support** - has, all, exists, filter, map with validation
8. **Workspace Symbols** - Indexing, fuzzy search, cross-file navigation
9. **Configuration Options** - Validation, completion, performance settings
10. **Comprehensive Tests** - Unit, integration, benchmarks, edge cases

Each issue includes:
- Detailed description and current state
- Implementation proposals with code examples
- Testing requirements
- Cross-references to related features
- Links to CEL and LSP specifications

## Manual Creation

If you prefer to create issues manually, each issue in the script has a complete body that can be copied and pasted into the GitHub issue creation form.

## Verification

After running the script, you can verify all issues were created:

```bash
gh issue list --repo sevki/cel-lsp --limit 20
```

## Troubleshooting

### "gh: To use GitHub CLI in a GitHub Actions workflow..."

You need to set the `GH_TOKEN` environment variable or authenticate with `gh auth login`.

### "Error: GitHub CLI is not authenticated"

Run `gh auth login` to authenticate with GitHub.

### Permission denied

Make sure the script is executable: `chmod +x create-issues.sh`
