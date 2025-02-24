import { Table } from "./types";

export function average(arr: number[]) {
  if (!arr.length) {
    return null;
  }
  const sum = arr.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

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
