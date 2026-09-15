import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

/*
  The public surface is the QuasarFixture interface and the matchers. A user
  names the type of a parameter through the main entry, so every type a module
  behind that surface exports must be re-exported there. main.ts lists them by
  hand. This test fails when a module gains a type the list lacks.
*/

const HELPERS_DIR = fileURLToPath(new URL('.', import.meta.url));
const SURFACE_FILES = ['main.ts', 'fixtures/quasar.ts'];

const TYPE_DECLARATION_RE = /^export (?:interface|type) (\w+)/gm;
const TYPE_RE_EXPORT_RE = /^export type \{([^}]*)\}/gm;
const RELATIVE_SPECIFIER_RE = /from '(\.{1,2}\/[^']+)'/g;

function read(file: string) {
  return readFileSync(path.join(HELPERS_DIR, file), 'utf8');
}

function captures(source: string, re: RegExp) {
  return [...source.matchAll(re)].flatMap(([, capture]) =>
    capture === undefined ? [] : [capture],
  );
}

function exportedTypeNames(source: string) {
  const reExported = captures(source, TYPE_RE_EXPORT_RE).flatMap((names) =>
    names.split(',').map((name) => name.trim()),
  );

  return [...captures(source, TYPE_DECLARATION_RE), ...reExported].filter(
    (name) => name !== '',
  );
}

/** The files a surface file imports or re-exports with a relative specifier. */
function importedFiles(file: string) {
  return captures(read(file), RELATIVE_SPECIFIER_RE).map((specifier) =>
    path.join(path.dirname(file), `${specifier}.ts`),
  );
}

test('main re-exports every type of the modules behind the public surface', () => {
  const exported = new Set(exportedTypeNames(read('main.ts')));
  const files = new Set(SURFACE_FILES.flatMap(importedFiles));

  const missing = [...files].flatMap((file) =>
    exportedTypeNames(read(file))
      .filter((name) => !exported.has(name))
      .map((name) => `${name} from ${file}`),
  );

  expect(missing).toEqual([]);
});
