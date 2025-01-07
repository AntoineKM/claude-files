import * as path from 'path';
import { Command } from 'commander';
import { CLAUDE_FILES_DIR } from './constants';
import { formatFileSize } from './utils';
import { loadIgnoreRules, getAllFiles, copyFilesToClaudeDir, updateGitignore } from './files';
import { version } from '../package.json';

const program = new Command();

program
    .name('claude-files')
    .description('Prepare local files for Claude Projects by copying them to a single directory')
    .version(version)
    .argument('[directory]', 'directory to process', './')
    .option('-i, --ignore <patterns...>', 'patterns to ignore (can be used multiple times)')
    .option('-d, --dry-run', 'show what would be copied without copying')
    .option('-v, --verbose', 'show detailed output')
    .option('--no-comments', 'do not add source comments to files')
    .parse();

async function main() {
    try {
        const options = program.opts();
        const baseDir = program.args[0] || './';
        const absoluteBaseDir = path.resolve(baseDir);
        const ignorePatterns = options.ignore || [];

        if (options.verbose) {
            console.log('Options:', {
                baseDir: absoluteBaseDir,
                ignorePatterns,
                dryRun: options.dryRun,
                addComments: options.comments,
            });
        }

        console.log(`Analyzing directory: ${absoluteBaseDir}`);
        
        // Load gitignore rules and update .gitignore if needed
        if (!options.dryRun) {
            await updateGitignore(absoluteBaseDir);
        }
        const ig = await loadIgnoreRules(absoluteBaseDir, ignorePatterns);
        
        // Get list of files
        const files = await getAllFiles(absoluteBaseDir, absoluteBaseDir, ig);
        console.log(`\nTotal files to process: ${files.length}`);

        if (options.dryRun) {
            console.log('\nFiles that would be copied:');
            files.forEach(file => {
                const relativePath = path.relative(absoluteBaseDir, file.sourcePath);
                console.log(`- ${relativePath} -> ${file.relativePath}`);
            });
            return;
        }
        
        // Copy files
        if (files.length > 0) {
            const result = await copyFilesToClaudeDir(files, absoluteBaseDir, options.comments);
            
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