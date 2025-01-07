export const CLAUDE_FILES_DIR = '.claude-files';
export const CLAUDE_FILESIGNORE = '.claude-filesignore';

export const UNSUPPORTED_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp',
    '.mp4',
    '.ico',
    '.svg',
    // Font files
    '.ttf',
    '.otf',
    '.woff',
    '.woff2',
    '.eot',
    // Audio files
    '.mp3',
    '.wav',
    '.aac',
    '.flac',
    '.m4a',
    // Video files
    '.mp4',
    '.webm',
    '.ogv',
    '.avi',
    '.mov',
    '.wmv',
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