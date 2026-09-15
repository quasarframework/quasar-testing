import { expect, test } from 'vitest';
import { normalizePromptsAnswers } from './prompt-answers';

test('keeps the options', () => {
  expect(normalizePromptsAnswers({ options: ['code-coverage'] })).toStrictEqual(
    { options: ['code-coverage'] },
  );
});

test('gives no options when the value is not an array', () => {
  expect(normalizePromptsAnswers({ options: 'x' })).toStrictEqual({
    options: [],
  });
});

test('drops options that are not strings', () => {
  expect(normalizePromptsAnswers({ options: ['demo', 1, null] })).toStrictEqual(
    { options: ['demo'] },
  );
});
