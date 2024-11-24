# claude-files

A CLI tool to prepare your local files for Claude Projects by copying them to a single directory while respecting `.gitignore` rules.

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
npx claude-files
```

Or specify a directory:

```bash
npx claude-files ./path/to/project
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

### 4. Gitignore Integration

* Automatically respects your existing `.gitignore` rules
* Adds `.claude-files/` to your `.gitignore` if it exists
* Uses default ignore patterns for common files

### 5. File Format Filtering

Automatically skips unsupported file formats:

* Images: `.png`, `.jpg`, `.jpeg`, `.webp`
* Videos: `.mp4`
* Icons: `.ico`
* Vector graphics: `.svg`

### 6. Smart Comment Syntax

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
* System files (.DS\_Store, Thumbs.db)

## License

MIT
