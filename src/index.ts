import * as path from 'path';
import { CLAUDE_FILES_DIR } from './constants';
import { formatFileSize } from './utils';
import { loadGitignore, getAllFiles, copyFilesToClaudeDir, updateGitignore } from './files';

async function main() {
    try {
        const baseDir = process.argv[2] || './';
        const absoluteBaseDir = path.resolve(baseDir);

        console.log(`Analyzing directory: ${absoluteBaseDir}`);
        
        // Load gitignore rules and update .gitignore if needed
        await updateGitignore(absoluteBaseDir);
        const ig = await loadGitignore(absoluteBaseDir);
        
        // Get list of files
        const files = await getAllFiles(absoluteBaseDir, absoluteBaseDir, ig);
        console.log(`\nTotal files to copy: ${files.length}`);
        
        // Copy files
        if (files.length > 0) {
            const result = await copyFilesToClaudeDir(files, absoluteBaseDir);
            
            console.log(`\nSummary:`);
            console.log(`- Total size copied: ${formatFileSize(result.totalSize)}`);
            console.log(`- Successfully copied files: ${result.successCount}`);
            
            if (result.failedCopies.length > 0) {
                console.log(`- Failed copies: ${result.failedCopies.length}`);
                console.log('\nFailed files:');
                result.failedCopies.forEach(file => console.log(`- ${file}`));
            }

            console.log(`\nFiles have been copied to ${CLAUDE_FILES_DIR}/`);
        } else {
            console.log('\nNo files to copy.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();