import { expect, test } from 'vitest';
import { computeUrlPath } from './url-path';

test('history mode strips the origin and the public path', () => {
  expect(
    computeUrlPath({
      href: 'http://localhost:8080/app/playwright/gallery/index.html?x=1',
      origin: 'http://localhost:8080',
      hash: '',
      publicPath: '/app/',
      vueRouterMode: 'history',
    }),
  ).toBe('/playwright/gallery/index.html?x=1');
});

test('history mode with the root public path keeps the path', () => {
  expect(
    computeUrlPath({
      href: 'http://localhost:8080/playwright/gallery/index.html',
      origin: 'http://localhost:8080',
      hash: '',
      publicPath: '/',
      vueRouterMode: 'history',
    }),
  ).toBe('/playwright/gallery/index.html');
});

test('history mode replaces the public path only at the start', () => {
  expect(
    computeUrlPath({
      href: 'http://localhost:8080/other/app/x',
      origin: 'http://localhost:8080',
      hash: '',
      publicPath: '/app/',
      vueRouterMode: 'history',
    }),
  ).toBe('/other/app/x');
});

test('hash mode uses the hash without the #', () => {
  expect(
    computeUrlPath({
      href: 'http://localhost:8080/#/second',
      origin: 'http://localhost:8080',
      hash: '#/second',
      publicPath: '/',
      vueRouterMode: 'hash',
    }),
  ).toBe('/second');
});

test('hash mode defaults to the root', () => {
  expect(
    computeUrlPath({
      href: 'http://localhost:8080/',
      origin: 'http://localhost:8080',
      hash: '',
      publicPath: '/',
      vueRouterMode: 'hash',
    }),
  ).toBe('/');
});
