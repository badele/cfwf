import { Align, CFWFOptions } from "./types.ts";

export const DEFAULTOPTIONS: CFWFOptions = {
  width: 120,
  padding: 3,
  removetitlelines: 2,
  font: "doom",
  chartitlesep: "┈",
  chardescsep: "┄",
  chartabletop: "━",
  chartablemiddle: "─",
  chartablebottom: "━",
  chartabledesc: "╌",
  charyamlsep: "╴",
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

export function wrapText(text: string, width: number): string {
  const lines: string[] = [];
  const words = text.split(" ");

  let line = "";
  for (let idx = 0; idx < words.length; idx++) {
    const word = words[idx];

    if (line.length + word.length > width) {
      lines.push(line.trimEnd());
      line = "";
    }
    line += word + " ";
  }
  lines.push(line.trimEnd());

  return lines.join("\n");
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
