import { Align, ParsedCSV } from "./types.ts";
import * as modcsv from "https://deno.land/std@0.204.0/csv/mod.ts";

export function parseCSV(content: string): ParsedCSV {
  let csv: ParsedCSV = {
    columns: [],
    values: [],
  };
  const lines = modcsv.parse(content);

  csv = {
    columns: lines[0],
    values: lines.slice(1),
  };

  return csv;
}

export function max(a: number, b: number): number {
  return (a > b) ? a : b;
}

export function searchMarker(
  lines: string[],
  marker: string,
  fromline = 0,
): number {
  for (let idx = fromline; idx < lines.length; idx++) {
    if (lines[idx].indexOf(marker) > -1) return idx;
  }

  return -1;
}

export function getMaxWidth(lines: string[]): number {
  let maxmaintitlesize = 0;
  for (let idx = 0; idx < lines.length; idx++) {
    maxmaintitlesize = max(maxmaintitlesize, lines[idx].length);
  }
  return maxmaintitlesize;
}

export function align(align: Align, text: string, maxsize: number): string {
  switch (align) {
    case "center": {
      const begin = (maxsize - text.length) / 2;
      return text.padStart(begin + text.length).padEnd(maxsize);
    }
    case "right":
      return text.padStart(maxsize);

    case "left":
      return text.padEnd(maxsize);

    // left
    default:
      return text.padEnd(maxsize);
  }
}
