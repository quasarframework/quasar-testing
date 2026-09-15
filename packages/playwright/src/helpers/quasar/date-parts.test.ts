import { expect, test } from 'vitest';
import { toDateParts } from './date-parts';

test('reads a Date object in local time', () => {
  expect(toDateParts(new Date(2023, 1, 23))).toStrictEqual({
    year: 2023,
    month: 2,
    day: 23,
  });
});

test('parses a Quasar mask string', () => {
  expect(toDateParts('2023/02/23')).toStrictEqual({
    year: 2023,
    month: 2,
    day: 23,
  });
});

test('parses an ISO date-only string as the displayed date', () => {
  expect(toDateParts('2023-02-23')).toStrictEqual({
    year: 2023,
    month: 2,
    day: 23,
  });
});

test('passes calendar-native parts through', () => {
  expect(toDateParts({ year: 1402, month: 12, day: 4 })).toStrictEqual({
    year: 1402,
    month: 12,
    day: 4,
  });
});

test('rejects an unparsable string', () => {
  expect(() => toDateParts('not a date')).toThrow(/not a valid date/);
});

test('rejects an out-of-range month', () => {
  expect(() => toDateParts({ year: 2023, month: 13, day: 1 })).toThrow(
    /out of range/,
  );
});

test('rejects an out-of-range day', () => {
  expect(() => toDateParts({ year: 2023, month: 1, day: 0 })).toThrow(
    /out of range/,
  );
});
