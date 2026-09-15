import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

function readFileIfExists(file: string) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
}

/** Writes the file, creating its directories, unless it already holds this content. */
export function writeIfChanged(file: string, content: string) {
  if (content === readFileIfExists(file)) {
    return;
  }

  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
}
