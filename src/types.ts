export interface FileInfo {
  sourcePath: string;
  relativePath: string;
}

export interface CopyResult {
  totalSize: number;
  successCount: number;
  failedCopies: string[];
}
