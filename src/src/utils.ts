import { Table } from "./types";

export function average(arr: number[]) {
  if (!arr.length) {
    return null;
  }
  const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return sum / arr.length;
}

export function getColumn<T extends Record<string, any>, K extends keyof T>(
  t: Table<T>,
  k: K
) {
  return t.map((t) => t[k]);
}

export function omitField<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  field: K
) {
  const { [field]: _, ...rest } = obj;
  return rest;
}

export function parseCustomDate(dateStr: string) {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month, day);
}

export function displayDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return date.toLocaleDateString("en-GB", options);
}

export function printTable<T extends Record<string, any>>(arr: T[]) {
  const transformed = Object.fromEntries(
    [...arr.entries()].map(([_index, d]) => [d.uid, omitField(d, "uid")])
  );
  console.table(transformed);
}

export function formatWage(number: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

export function getPercentile(value: number, list: number[]): number {
  // Handle edge cases
  if (list.length === 0) {
    throw new Error("List cannot be empty");
  }

  // Sort the list in ascending order
  const sortedList = [...list].toSorted((a, b) => a - b);

  // Count how many values are strictly less than the given value
  let countBelow = 0;
  // Count how many values are equal to the given value
  let countEqual = 0;

  for (const item of sortedList) {
    if (item < value) {
      countBelow++;
    } else if (item === value) {
      countEqual++;
    } else {
      break; // Since list is sorted, no need to continue
    }
  }

  // Calculate percentile using the standard formula:
  // Percentile = (countBelow + 0.5 * countEqual) / totalCount * 100
  const percentile = ((countBelow + 0.5 * countEqual) / list.length) * 100;

  return Math.round(percentile * 100) / 100;
}

export function sortIntoCohorts(numbers: number[]): {
  bottom: number[];
  middle: number[];
  top: number[];
} {
  if (numbers.length === 0) {
    return { bottom: [], middle: [], top: [] };
  }

  const sorted = numbers.toSorted((a, b) => a - b);

  const third = Math.ceil(numbers.length / 3);

  return {
    bottom: sorted.slice(0, third),
    middle: sorted.slice(third, third * 2),
    top: sorted.slice(third * 2),
  };
}

export function getCohort(
  num: number,
  cohorts: { bottom: number[]; middle: number[]; top: number[] }
): string {
  if (cohorts.bottom.length === 0) return "No data available";

  const maxBottom = cohorts.bottom[cohorts.bottom.length - 1];
  const minMiddle = cohorts.middle[0];
  const maxMiddle = cohorts.middle[cohorts.middle.length - 1];
  const minTop = cohorts.top[0];

  if (num <= maxBottom) return "Bottom";
  if (num >= minMiddle && num <= maxMiddle) return "Middle";
  if (num >= minTop) return "Top";

  return "Out of range";
}
