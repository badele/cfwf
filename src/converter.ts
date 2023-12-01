import { TableType } from "./types.ts";
import * as modcsv from "https://deno.land/std@0.204.0/csv/mod.ts";
import { CHARMARKERS, readTextFile } from "./utils.ts";
import * as path from "https://deno.land/std@0.205.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.205.0/fs/exists.ts";
import { CFWF } from "./cfwf.ts";

///////////////////////////////////////////////////////////////////////////////
// CSV
// /////////////////////////////////////////////////////////////////////////////
export async function readDecodedCSVFile(filename: string): Promise<TableType> {
  const content = await readTextCSVFile(filename);
  const ext = path.extname(filename);
  const tablename = path.basename(filename, ext);

  return decodeCSVContent(tablename, content);
}

export async function readTextCSVFile(filename: string): Promise<string> {
  return await readTextFile(filename);
}

export function decodeCSVContent(
  tablename: string,
  content: string,
): TableType {
  const lines = modcsv.parse(content);
  return {
    tablename: tablename,
    columns: lines[0],
    rows: lines.slice(1),
  };
}

///////////////////////////////////////////////////////////////////////////////
// CFWF
// /////////////////////////////////////////////////////////////////////////////
export async function readCFWFFile(filename: string): Promise<CFWF> {
  const content = await readTextCFWFFile(filename);
  return decodeCFWFContent(content);
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

export function decodeCFWFContent(content: string): CFWF {
  const cfwf = new CFWF({});
  cfwf.importCFWF(content);
  return cfwf;
}
