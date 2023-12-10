import { TableType } from "./types.ts";
import { DEFAULTOPTIONS, readTextFile } from "./utils.ts";
import * as path from "https://deno.land/std@0.205.0/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.205.0/fs/exists.ts";
import { CFWF } from "./cfwf.ts";
import pl from "npm:nodejs-polars@0.8.3";
import {
  Destination,
  download,
} from "https://deno.land/x/download@v2.0.2/mod.ts";

///////////////////////////////////////////////////////////////////////////////
// CSV
// /////////////////////////////////////////////////////////////////////////////

export async function readCSV(path: string): Promise<TableType> {
  const r = /https?\:\/\//;

  if (r.test(path)) {
    return await readCSVFromURL(path);
  } else {
    return readCSVFromFile(path);
  }
}

export function readCSVFromFile(filename: string): TableType {
  const ext = path.extname(filename);
  const tablename = path.basename(filename, ext);

  const df = pl.readCSV(filename);
  return {
    tablename: tablename,
    columns: df.columns,
    rows: df.rows(),
  };
}

export async function readCSVFromURL(url: string): Promise<TableType> {
  const ext = path.extname(url);
  const tablename = path.basename(url, ext);

  const foldername = "./.download";
  const filename = `${tablename}.csv`;
  try {
    const destination: Destination = {
      file: filename,
      dir: foldername,
    };
    await download(url, destination);
  } catch (err) {
    console.log(err);
  }

  const df = pl.readCSV(`${foldername}/${filename}`);
  return {
    tablename: tablename,
    columns: df.columns,
    rows: df.rows(),
  };
}

// export async function readTextFile(filename: string): Promise<string> {
//   const r = /https?\:\/\//;
//
//   let content = "";
//   if (r.test(filename)) {
//     const resp = await fetch(filename);
//     content = await resp.text();
//   } else {
//     content = await Deno.readTextFile(filename);
//   }
//
//   return content;
// }

///////////////////////////////////////////////////////////////////////////////
// CFWF
// /////////////////////////////////////////////////////////////////////////////
export async function readCFWFFile(filename: string): Promise<CFWF> {
  const content = await readTextCFWFFile(filename);
  return decodeCFWFContent(content);
}

export async function readTextCFWFFile(filename: string): Promise<string> {
  const charyamlsep = DEFAULTOPTIONS.charyamlsep ?? "╌";

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
