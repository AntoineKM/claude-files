# claude-files

[![npm version](https://img.shields.io/npm/v/claude-files.svg)](https://www.npmjs.com/package/claude-files)
[![Downloads](https://img.shields.io/npm/dm/claude-files.svg)](https://www.npmjs.com/package/claude-files)
[![License](https://img.shields.io/npm/l/claude-files.svg)](https://github.com/AntoineKM/claude-files/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/AntoineKM/claude-files/pulls)

A CLI tool to prepare your local files for Claude Projects by copying them to a single directory while respecting `.gitignore` rules.

## Demo

https://github.com/user-attachments/assets/64e44490-7109-432f-9e87-cc1497dfefc9

## Why?

Claude Projects currently only supports uploading individual files, not directories. This tool helps by:

* Copying all your project files into a single `.claude-files` directory
* Flattening the directory structure
* Handling filename conflicts intelligently
* Respecting `.gitignore` rules
* Skipping unsupported file formats
* Adding source comments to track file origins

## Usage

### Using npx (recommended)

You can use the tool directly with npx without installing it:

```bash
# Basic usage
npx claude-files [directory]

# Show help
npx claude-files --help

# Ignore specific files or patterns (can be used multiple times)
npx claude-files --ignore "*.test.ts" "docs/**"
# or use the short form
npx claude-files -i "*.test.ts" "docs/**"

# Dry run - show what would be copied without copying
npx claude-files --dry-run

# Verbose output
npx claude-files --verbose

# Skip adding source comments
npx claude-files --no-comments

# Show version
npx claude-files --version
```

### Global Installation

Alternatively, you can install it globally:

```bash
npm install -g claude-files
```

Then use it anywhere:

```bash
claude-files
# or
claude-files ./path/to/project
```

## Features

### 1. File Organization

* Creates a `.claude-files` directory in your project
* Copies all files while maintaining their readability
* Adds source path comments at the top of each file
* Flattens directory structure for easy upload

### 2. Smart File Naming

When duplicate filenames are found:

```
project/
  src/
    constants.ts
    utils/
      constants.ts
```

Becomes:

```
.claude-files/
  constants.ts        # from src/
  utils_constants.ts  # from src/utils/
```

### 3. Source Tracking

Each file gets a comment header showing its original location:

```javascript
// Source: src/utils/helpers.js
function helper() {
  // ...
}
```

### 4. Flexible Ignore Rules

You can ignore files and directories in multiple ways:

1. Using `.gitignore` (automatically respected)
2. Using `.claude-filesignore` (project-specific ignore rules)
3. Using command-line arguments with `--ignore` or `-i`

The ignore patterns follow the same syntax as `.gitignore`. For example:

```bash
# .claude-filesignore
*.test.ts
docs/**
temp/
```

### 5. Gitignore Integration

* Automatically respects your existing `.gitignore` rules
* Adds `.claude-files/` to your `.gitignore` if it exists
* Uses default ignore patterns for common files

### 6. File Format Filtering

Automatically skips unsupported file formats:

* Images: `.png`, `.jpg`, `.jpeg`, `.webp`
* Videos: `.mp4`
* Icons: `.ico`
* Vector graphics: `.svg`

### 7. Smart Comment Syntax

Adds source comments using the correct syntax for each file type:

```python
# Source: src/script.py
```

```html
<!-- Source: src/index.html -->
```

```css
/* Source: src/styles.css */
```

## Default Ignored Patterns

Besides your `.gitignore` rules, the following are ignored by default:

* `node_modules/`
* `.git/`
* `dist/`
* `build/`
* `coverage/`
* `.env` files
* Log files
* Lock files (package-lock.json, yarn.lock, etc.)
* System files (.DS_Store, Thumbs.db)

## License

MIT