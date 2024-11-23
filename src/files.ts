import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import ignore, { Ignore } from 'ignore';
import { DEFAULT_IGNORES, CLAUDE_FILES_DIR, UNSUPPORTED_EXTENSIONS } from './constants';
import { FileInfo, CopyResult } from './types';
import { formatFileSize } from './utils';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);
const appendFile = promisify(fs.appendFile);

async function addSourceComment(filePath: string, sourcePath: string): Promise<void> {
    try {
        // Read the file content
        const content = await readFile(filePath, 'utf8');
        
        // Get the relative path of the original file
        const relativePath = sourcePath.replace(/\\/g, '/');
        
        // Detect file type and choose appropriate comment syntax
        let commentPrefix = '//';
        const ext = path.extname(filePath).toLowerCase();
        
        switch (ext) {
            case '.py':
            case '.rb':
            case '.sh':
            case '.yaml':
            case '.yml':
                commentPrefix = '#';
                break;
            case '.html':
            case '.xml':
            case '.svg':
            case '.md':
            case '.markdown':
                commentPrefix = '<!--';
                break;
            case '.css':
            case '.scss':
            case '.sass':
            case '.less':
                commentPrefix = '/*';
                break;
            // Default is '//' for most programming languages
        }
        
        // Create the comment line
        let commentLine: string;
        if (commentPrefix === '/*') {
            commentLine = `/* Source: ${relativePath} */\n`;
        } else if (commentPrefix === '<!--') {
            commentLine = `<!-- Source: ${relativePath} -->\n`;
        } else {
            commentLine = `${commentPrefix} Source: ${relativePath}\n`;
        }
        
        // Write back the file with the comment
        await fs.promises.writeFile(filePath, commentLine + content);
    } catch (error) {
        // If we can't read/write the file as text, skip adding the comment
        console.log(`Note: Could not add source comment to ${path.basename(filePath)} (might be a binary file)`);
    }
}

export async function updateGitignore(baseDir: string): Promise<void> {
    const gitignorePath = path.join(baseDir, '.gitignore');
    
    try {
        // Check if .gitignore exists
        await access(gitignorePath, fs.constants.R_OK);
        
        // Read current content
        const content = await readFile(gitignorePath, 'utf8');
        const lines = content.split('\n');
        
        // Check if .claude-files is already in .gitignore
        if (!lines.some(line => line.trim() === CLAUDE_FILES_DIR + '/')) {
            // Add .claude-files/ to .gitignore
            await appendFile(gitignorePath, `\n${CLAUDE_FILES_DIR}/\n`);
            console.log(`Added ${CLAUDE_FILES_DIR}/ to .gitignore`);
        }
    } catch (error) {
        // If .gitignore doesn't exist, we don't create it
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return;
        }
        throw error;
    }
}

export async function loadGitignore(baseDir: string): Promise<Ignore> {
    const ig = ignore().add(DEFAULT_IGNORES);

    try {
        const gitignorePath = path.join(baseDir, '.gitignore');
        await access(gitignorePath, fs.constants.R_OK);
        const gitignoreContent = await readFile(gitignorePath, 'utf8');
        ig.add(gitignoreContent);
        console.log('.gitignore rules loaded successfully');
    } catch (error) {
        console.log('No .gitignore file found, using default rules');
    }

    return ig;
}

export async function getAllFiles(
    dirPath: string, 
    baseDir: string, 
    ig: Ignore
): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const items = await readdir(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const relativePath = path.relative(baseDir, fullPath);

        // Check if file should be ignored
        if (ig.ignores(relativePath)) {
            continue;
        }

        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
            // Recursion for subdirectories
            const subDirFiles = await getAllFiles(fullPath, baseDir, ig);
            files.push(...subDirFiles);
        } else {
            // Skip unsupported file formats
            const ext = path.extname(fullPath).toLowerCase();
            if (UNSUPPORTED_EXTENSIONS.includes(ext)) {
                continue;
            }
            
            // Get just the filename for flattened structure
            const fileName = path.basename(relativePath);
            files.push({
                sourcePath: fullPath,
                relativePath: fileName
            });
        }
    }

    return files;
}

export async function copyFilesToClaudeDir(
    files: FileInfo[], 
    baseDir: string
): Promise<CopyResult> {
    const claudeDir = path.join(baseDir, CLAUDE_FILES_DIR);
    let totalSize = 0;
    const failedCopies: string[] = [];
    const fileNameMap = new Map<string, string[]>();

    // First pass: collect all files with the same name
    for (const file of files) {
        const fileName = path.basename(file.relativePath);
        const existing = fileNameMap.get(fileName) || [];
        fileNameMap.set(fileName, [...existing, file.sourcePath]);
    }

    // Second pass: rename files that have duplicates
    for (const file of files) {
        const fileName = path.basename(file.relativePath);
        const duplicates = fileNameMap.get(fileName) || [];
        
        if (duplicates.length > 1) {
            // Get the parent directory name
            const parentDir = path.basename(path.dirname(file.sourcePath));
            
            // Only add parent directory name if it's not the root directory
            if (parentDir && parentDir !== '.') {
                const ext = path.extname(fileName);
                const baseName = path.basename(fileName, ext);
                file.relativePath = `${parentDir}_${baseName}${ext}`;
            }
        } else {
            file.relativePath = fileName;
        }
    }

    try {
        await mkdir(claudeDir);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
            throw error;
        }
    }

    for (const file of files) {
        const destPath = path.join(claudeDir, file.relativePath);

        try {
            // No need to create subdirectories anymore as all files will be in the root of .claude-files
            await copyFile(file.sourcePath, destPath);
            
            // Add source comment at the beginning of the file
            const sourceRelativePath = path.relative(baseDir, file.sourcePath);
            await addSourceComment(destPath, sourceRelativePath);
            
            const stats = await stat(file.sourcePath);
            totalSize += stats.size;
            
            const sourceRelativePathForLog = path.relative(baseDir, file.sourcePath);
            console.log(`✓ Copied: ${sourceRelativePathForLog} -> ${file.relativePath} (${formatFileSize(stats.size)})`);
        } catch (error) {
            const sourceRelativePath = path.relative(baseDir, file.sourcePath);
            console.error(`✗ Error copying ${sourceRelativePath}:`, error);
            failedCopies.push(sourceRelativePath);
        }
    }

    return {
        totalSize,
        successCount: files.length - failedCopies.length,
        failedCopies
    };
}
