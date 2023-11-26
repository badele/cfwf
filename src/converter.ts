import { NamedArray } from "./types.ts";
import * as modcsv from "https://deno.land/std@0.204.0/csv/mod.ts";
import { CHARMARKERS, readTextFile } from "./utils.ts";
import { existsSync } from "https://deno.land/std@0.205.0/fs/exists.ts";
import { CFWF } from "./cfwf.ts";

///////////////////////////////////////////////////////////////////////////////
// CSV
// /////////////////////////////////////////////////////////////////////////////
export async function readCSVFile(filename: string): Promise<NamedArray> {
  const content = await readTextCSVFile(filename);
  return getCSVObject(content);
}

export async function readTextCSVFile(filename: string): Promise<string> {
  return await readTextFile(filename);
}

export function getCSVObject(content: string): NamedArray {
  let csv: NamedArray = {
    columns: [],
    rows: [],
  };
  const lines = modcsv.parse(content);

  csv = {
    columns: lines[0],
    rows: lines.slice(1),
  };

  return csv;
}

///////////////////////////////////////////////////////////////////////////////
// CFWF
// /////////////////////////////////////////////////////////////////////////////
export async function readCFWFFile(filename: string): Promise<CFWF> {
  const content = await readTextCFWFFile(filename);
  return getCFWFObject(content);
}

export async function readTextCFWFFile(filename: string): Promise<string> {
  const charyamlsep = CHARMARKERS.charyamlsep ?? "╌";

  const metaname = filename.replace(".cfwf", ".yaml");
  if (existsSync(metaname) === true) {
    const content = await readTextFile(filename);
    let metadatas = await readTextFile(metaname);

    // replace first --- occurence if exists
    if (metadatas.indexOf("---") === 0) {
      metadatas = metadatas.replace("---", "");
    }

    return `${content}\n${charyamlsep.repeat(3)}${metadatas}`;
  } else {
    const content = await readTextFile(filename);

    return content;
  }
}

export function getCFWFObject(content: string): CFWF {
  const cfwf = new CFWF({});
  cfwf.importCFWF(content);
  return cfwf;
}
