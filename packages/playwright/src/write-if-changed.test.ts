import {
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { expect, test } from 'vitest';
import { writeIfChanged } from './write-if-changed';

const OLD_MTIME_SECONDS = 1000000000;
const OLD_MTIME_MS = OLD_MTIME_SECONDS * 1000;

function createDirectory() {
  return mkdtempSync(path.join(tmpdir(), 'write-if-changed-'));
}

test('creates the missing directories of the file', () => {
  const directory = createDirectory();

  try {
    const file = path.join(directory, 'deep/nested/file.txt');
    writeIfChanged(file, 'first');

    expect(readFileSync(file, 'utf8')).toBe('first');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('leaves a file with identical content alone', () => {
  const directory = createDirectory();

  try {
    const file = path.join(directory, 'file.txt');
    writeIfChanged(file, 'same');
    utimesSync(file, OLD_MTIME_SECONDS, OLD_MTIME_SECONDS);

    writeIfChanged(file, 'same');

    expect(statSync(file).mtimeMs).toBe(OLD_MTIME_MS);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('rewrites a file whose content changed', () => {
  const directory = createDirectory();

  try {
    const file = path.join(directory, 'file.txt');
    writeIfChanged(file, 'first');
    utimesSync(file, OLD_MTIME_SECONDS, OLD_MTIME_SECONDS);

    writeIfChanged(file, 'second');

    expect(readFileSync(file, 'utf8')).toBe('second');
    expect(statSync(file).mtimeMs).not.toBe(OLD_MTIME_MS);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
