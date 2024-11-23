export const CLAUDE_FILES_DIR = '.claude-files';

export const UNSUPPORTED_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.mp4',
    '.ico',
    '.svg'
];

export const DEFAULT_IGNORES = [
    '.git',
    'node_modules',
    CLAUDE_FILES_DIR,
    'dist',
    'build',
    'coverage',
    '.env',
    '.env.*',
    '*.log',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store',
    'Thumbs.db',
    // Lock files
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    'bun.lockb',
    'composer.lock',
    'Gemfile.lock',
    'poetry.lock',
    'Cargo.lock',
    'go.sum',
    'mix.lock',
    'gradle.lockfile',
    'pubspec.lock',
    'Podfile.lock'
];