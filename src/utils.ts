import { CFWF } from "./cfwf.ts";
import { Align, CFWFOptions } from "./types.ts";

export const CHARMARKERS: CFWFOptions = {
  padding: 3,
  chartitlesep: "┈",
  chardescsep: "┄",
  chartabletop: "━",
  chartablemiddle: "─",
  chartablebottom: "━",
  charyamlsep: "╌",
};

export async function readTextFile(filename: string): Promise<string> {
  const r = /https?\:\/\//;

  let content = "";
  if (r.test(filename)) {
    const resp = await fetch(filename);
    content = await resp.text();
  } else {
    content = await Deno.readTextFile(filename);
  }

  return content;
}

export function getCFWFObject(content: string): CFWF {
  const cfwf = new CFWF({});
  cfwf.importCFWF(content);
  return cfwf;
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
