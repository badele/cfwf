import { modfmt, text } from "../deps.ts";

export enum Align {
  Left,
  Center,
  Right,
}

function max(a: number, b: number): number {
  return (a > b) ? a : b;
}

function align(align: Align, text: string, maxsize: number): string {
  switch (align) {
    case Align.Center: {
      const begin = (maxsize - text.length) / 2;
      return text.padStart(begin + text.length).padEnd(maxsize);
    }
    case Align.Right:
      return text.padStart(maxsize);

    case Align.Left:
      return text.padEnd(maxsize);
  }
}

export type exportOptions = {
  headers?: string[];
  aligns?: Align[];
  padding?: number;
  charlinetop?: string;
  charlinemiddle?: string;
  charlinebottom?: string;
  title?: string;
};

export async function arrayToCFWF(
  // deno-lint-ignore no-explicit-any
  rows: any,
  {
    headers = [],
    aligns = [],
    padding = 3,
    charlinetop = "━",
    charlinemiddle = "─",
    charlinebottom = "━",
    title = "",
  }: exportOptions = {},
): Promise<string> {
  if (rows.length == 0) return "";
  if (rows[0].length != headers.length) {
    throw new Error(
      `They have ${
        rows[0].length
      } columns and ${headers.length} header columns`,
    );
  }
  if (aligns.length != headers.length) {
    throw new Error(
      `They have ${headers.length} columns and ${aligns.length} aligns`,
    );
  }

  //search the needed number of float size for each columns
  const colnbfloat: Record<number, number> = {};
  // deno-lint-ignore no-explicit-any
  rows.forEach((row: any) => {
    for (let idx = 0; idx < row.length; idx++) {
      const col = row[idx];
      if (typeof col === "number") {
        const colvalue = col.toString();
        const dotpos = colvalue.indexOf(".");
        colnbfloat[idx] = max(
          colnbfloat[idx],
          (dotpos != -1) ? colvalue.length - dotpos - 1 : 0,
        );
      }
    }
  });

  // convert all entries to string
  // deno-lint-ignore no-explicit-any
  const srows: any[] = [];
  // deno-lint-ignore no-explicit-any
  rows.forEach((row: any) => {
    // deno-lint-ignore no-explicit-any
    const cols: any[] = [];
    for (let idx = 0; idx < row.length; idx++) {
      const col = row[idx];
      if (typeof col === "number" && colnbfloat[idx] > 0) {
        cols.push(modfmt.sprintf("%.*f", colnbfloat[idx], col));
      } else {
        cols.push(col.toString());
      }
    }
    srows.push(cols);
  });
  const lines: string[] = [];
  const columnssize: number[] = [];

  // Init columns size with the header size
  for (let idx = 0; idx < headers.length; idx++) {
    columnssize.push(headers[idx].length);
  }

  // compute the content columns size
  for (let rowidx = 0; rowidx < srows.length; rowidx++) {
    const itemrow = srows[rowidx];
    for (let colidx = 0; colidx < itemrow.length; colidx++) {
      const content = itemrow[colidx];
      columnssize[colidx] = max(content.length, columnssize[colidx]);
    }
  }

  // compute total line size
  let headerlinesize = 0;
  for (let idx = 0; idx < headers.length; idx++) {
    if (idx > 0) headerlinesize += padding;
    headerlinesize += columnssize[idx];
  }

  // Add top line header
  if (charlinetop) lines.push(charlinetop.repeat(headerlinesize));

  // add header columns
  const header: string[] = [];
  const middlelineheader: string[] = [];
  for (let idx = 0; idx < headers.length; idx++) {
    const cname = headers[idx];
    const csize = columnssize[idx];

    if (idx > 0) {
      header.push(" ".repeat(padding));
      middlelineheader.push(" ".repeat(padding));
    }

    header.push(align(aligns[idx], cname, csize));
    middlelineheader.push(charlinemiddle.repeat(csize));
  }
  lines.push(header.join(""));
  lines.push(middlelineheader.join(""));

  // Add rows datas
  for (let rowidx = 0; rowidx < srows.length; rowidx++) {
    const line = [];
    const coldata = srows[rowidx];

    for (let colidx = 0; colidx < coldata.length; colidx++) {
      const csize = columnssize[colidx];

      if (colidx > 0) line.push(" ".repeat(padding));
      // line.push(coldata[colidx].padEnd(csize));
      line.push(align(aligns[colidx], coldata[colidx], csize));
    }
    lines.push(line.join(""));
  }

  // Add bottom line header
  if (charlinebottom) lines.push(charlinebottom.repeat(headerlinesize));

  // add title
  if (title) {
    const txttitle = await text(title, "doom");
    const atitle = txttitle.split("\n");
    let maxtitlesize = 0;
    let titlepadding = 0;
    for (let idx = 0; idx < atitle.length; idx++) {
      maxtitlesize = max(atitle[idx].length, maxtitlesize);
      titlepadding = headerlinesize - maxtitlesize;
    }

    for (let idx = 0; idx < atitle.length; idx++) {
      atitle[idx] = atitle[idx].padStart(headerlinesize - (titlepadding / 2));
    }
    lines.unshift(atitle.join("\n"));
  }

  return lines.join("\n");
}
