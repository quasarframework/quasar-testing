export interface DateParts {
  year: number;
  /** 1 to 12 */
  month: number;
  day: number;
}

export type DateInput = Date | string | DateParts;

const JANUARY_INDEX_OFFSET = 1;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const MIN_DAY = 1;

// ECMA-262 reads a bare YYYY-MM-DD string as UTC. West of Greenwich, the local
// day of that value is the day before. Quasar's default mask is YYYY/MM/DD. Both forms are
// matched here and read as the displayed date.
const DATE_ONLY_PATTERN = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;

function partsFromDate(date: Date): DateParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + JANUARY_INDEX_OFFSET,
    day: date.getDate(),
  };
}

function partsFromString(value: string): DateParts {
  const dateOnlyMatch = DATE_ONLY_PATTERN.exec(value);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return { year: Number(year), month: Number(month), day: Number(day) };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`"${value}" is not a valid date`);
  }

  return partsFromDate(date);
}

function assertInRange(parts: DateParts): DateParts {
  const { month, day } = parts;
  if (!Number.isInteger(month) || month < MIN_MONTH || month > MAX_MONTH) {
    throw new Error(
      `Month ${month} is out of range (${MIN_MONTH}-${MAX_MONTH})`,
    );
  }

  if (!Number.isInteger(day) || day < MIN_DAY) {
    throw new Error(`Day ${day} is out of range (>= ${MIN_DAY})`);
  }

  return parts;
}

/**
 * Date objects are read in local time. YYYY-MM-DD and YYYY/MM/DD strings are
 * read as the displayed date. Other strings fall back to the platform date
 * parser, read in local time. A parts object is used as it is.
 */
export function toDateParts(value: DateInput): DateParts {
  if (value instanceof Date) {
    return assertInRange(partsFromDate(value));
  }

  if (typeof value === 'string') {
    return assertInRange(partsFromString(value));
  }

  return assertInRange(value);
}
