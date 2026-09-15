import { expect, test } from 'vitest';
import { matchesRoute } from './route-match';

test('matches the pathname in history mode', () => {
  expect(matchesRoute(new URL('http://localhost:8080/second'), 'second')).toBe(
    true,
  );
  expect(
    matchesRoute(
      new URL('http://localhost:8080/books/12/pages/3'),
      'books/*/pages/*',
    ),
  ).toBe(true);
  expect(matchesRoute(new URL('http://localhost:8080/second'), 'home')).toBe(
    false,
  );
});

test('matches the hash in hash mode', () => {
  expect(
    matchesRoute(new URL('http://localhost:8080/#/second'), 'second'),
  ).toBe(true);
  expect(matchesRoute(new URL('http://localhost:8080/#/second'), 'home')).toBe(
    false,
  );
});

test('ignores the query string', () => {
  expect(
    matchesRoute(new URL('http://localhost:8080/second?tab=1'), 'second'),
  ).toBe(true);
});

test('ignores a plain anchor in history mode', () => {
  expect(
    matchesRoute(new URL('http://localhost:8080/second#section-2'), 'second'),
  ).toBe(true);
});

test('ignores the query string inside the hash in hash mode', () => {
  expect(
    matchesRoute(new URL('http://localhost:8080/#/second?tab=1'), 'second'),
  ).toBe(true);
});

test('a star does not cross a slash', () => {
  expect(
    matchesRoute(new URL('http://localhost:8080/books/12/pages'), 'books/*'),
  ).toBe(false);
});
