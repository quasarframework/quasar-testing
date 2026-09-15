import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { expect, test } from 'vitest';
import { demoTargetPath, listFiles } from './install-helpers';

/*
  Renders every demo template for both languages with the engine
  @quasar/app-vite uses in api.render(), and checks that each output parses.
  The engine is not on the package's exports map, so the test loads it by file
  path. The install script builds the same scope.
*/

interface TemplateEngine {
  renderTemplate: (
    template: string,
    scope: Record<string, unknown>,
    options: { varName: false },
  ) => string | symbol;
}

const DEMO_TEMPLATE_DIR = fileURLToPath(
  new URL('./templates/demo/', import.meta.url),
);
const SCRIPT_BLOCK_RE =
  /<script(?: setup)?(?: lang="ts")?>([\s\S]*?)<\/script>/;
const TEMPLATE_TAG = '<%';

const require = createRequire(import.meta.url);
const appViteDir = path.dirname(
  require.resolve('@quasar/app-vite/package.json'),
);
const { renderTemplate } = (await import(
  pathToFileURL(path.join(appViteDir, 'lib/utils/template.js')).href
)) as TemplateEngine;

function render(file: string, shouldSupportTypeScript: boolean) {
  const template = readFileSync(path.join(DEMO_TEMPLATE_DIR, file), 'utf8');
  const output = renderTemplate(
    template,
    {
      shouldSupportTypeScript,
      ts: (text: string) => (shouldSupportTypeScript ? text : ''),
    },
    { varName: false },
  );

  if (typeof output !== 'string') {
    throw new Error(`${file} failed to render`);
  }

  return output;
}

/** The script of a .vue file, which may have none, or the whole content of any other file. */
function scriptOf(targetPath: string, content: string) {
  if (!targetPath.endsWith('.vue')) {
    return content;
  }

  return SCRIPT_BLOCK_RE.exec(content)?.[1] ?? '';
}

function syntaxErrors(targetPath: string, content: string) {
  const isVue = targetPath.endsWith('.vue');
  const isTypeScript =
    /\.tsx?$/.test(targetPath) || (isVue && content.includes('lang="ts"'));
  const fileName = isVue
    ? `${targetPath}.${isTypeScript ? 'ts' : 'js'}`
    : targetPath;

  const { diagnostics = [] } = ts.transpileModule(
    scriptOf(targetPath, content),
    {
      fileName,
      reportDiagnostics: true,
      compilerOptions: {
        jsx: ts.JsxEmit.Preserve,
        target: ts.ScriptTarget.ESNext,
      },
    },
  );

  return diagnostics.map((diagnostic) =>
    ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
  );
}

const files = listFiles(DEMO_TEMPLATE_DIR);

test('the demo tree holds the components, the specs and the stories', () => {
  expect(files).toEqual(
    expect.arrayContaining([
      'test/playwright/demo/QuasarDialog.vue',
      'test/playwright/demo/QuasarDialog.spec.ts',
      'test/playwright/demo/QuasarDialog.default.story.vue',
      'test/playwright/demo/QuasarMenu.story.tsx',
    ]),
  );
});

for (const shouldSupportTypeScript of [true, false]) {
  const language = shouldSupportTypeScript ? 'TypeScript' : 'JavaScript';

  test(`every demo template renders to valid ${language}`, () => {
    for (const file of files) {
      const targetPath = demoTargetPath(file, shouldSupportTypeScript);
      const content = render(file, shouldSupportTypeScript);

      expect(content, file).not.toContain(TEMPLATE_TAG);
      expect(syntaxErrors(targetPath, content), targetPath).toEqual([]);
    }
  });
}

test('a JavaScript app gets no TypeScript in the demo files', () => {
  for (const file of files) {
    const content = render(file, false);

    expect(content, file).not.toContain('lang="ts"');
    expect(content, file).not.toMatch(/: (string|HTMLImageElement)\b/);
  }
});
