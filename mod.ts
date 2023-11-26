export * from "./src/cfwf.ts";
export * from "./src/types.ts";

import { CFWFDataset, NamedArray } from "./src/types.ts";
import { version } from "./src/version.ts";
import {
  Command,
  CompletionsCommand,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";
import { existsSync } from "https://deno.land/std@0.205.0/fs/exists.ts";
import * as path from "https://deno.land/std@0.205.0/path/mod.ts";
import { CFWF } from "./src/cfwf.ts";
import { getCSVObject, readCSVFile } from "./src/converter.ts";
import { readTextFile } from "./src/utils.ts";

// deno-lint-ignore no-explicit-any
function initDatasetFile(options: any): void {
  const cfwf: CFWFDataset = {
    dataset: {
      metadatas: {},
    },
    tables: {},
  };

  Deno.writeTextFileSync(options.configname, JSON.stringify(cfwf));
}

function readConfig(configname: string): CFWFDataset {
  if (existsSync(configname) === false) {
    return {};
  }

  return JSON.parse(Deno.readTextFileSync(configname));
}

// deno-lint-ignore no-explicit-any
async function exportCFWF(options: any): Promise<void> {
  const config = readConfig(options.configname);

  const cfwf = new CFWF(config);
  if (options.filename) {
    cfwf.saveCFWF(options.filename, options.separate);
  } else {
    const formated = await cfwf.outputCFWF(false);
    console.log(formated.content);
  }
}

// deno-lint-ignore no-explicit-any
function setDatasetProperties(options: any): void {
  const cfg: CFWFDataset = readConfig(options.configname) || {};
  const cfwf = new CFWF(cfg);

  let { dataset } = cfg || {};
  let { metadatas } = dataset || {};

  dataset = dataset || {};
  metadatas = metadatas || {};

  if (options.title) {
    dataset.title = options.title ?? dataset.title;

    metadatas.font = options.font;
    metadatas.removetitlelines = options.removetitlelines;
  } else if (options.generatedtitle) {
    dataset.generatedtitle = options.generatedtitle;
  }

  if (options.description) {
    dataset.description = options.description;
  }

  if (options.metadatas) {
    Object.assign(metadatas, JSON.parse(options.metadatas));
  }

  cfwf.setDatasetProperties(dataset);
  Deno.writeTextFileSync(options.configname, JSON.stringify(cfwf.config));
}

// deno-lint-ignore no-explicit-any
async function convertFile(options: any): Promise<void> {
  let inputcapacity = false;
  let outputcapacity = false;

  const iext = path.extname(options.input);
  const oext = path.extname(options.output);
  let namedarray: NamedArray = {
    columns: [],
    rows: [],
  };

  // Input
  switch (iext) {
    case ".csv":
      namedarray = await readCSVFile(options.input);
      inputcapacity = true;
      break;
  }

  // Output
  switch (oext) {
    case ".cfwf":
      namedarray = await readCSVFile(options.input);
      outputcapacity = true;
      break;
  }

  if (inputcapacity === false) {
    throw new Error("Input file format not supported");
  }

  if (outputcapacity === false) {
    throw new Error("Output file format not supported");
  }

  const cfwf = new CFWF({});

  // cfwf.setDatasetProperties({
  //   title: options.title,
  //   description: options.description,
  // });

  const tablename = options.tablename || path.basename(options.input, iext);
  cfwf.addTable(tablename, {
    columns: namedarray.columns,
    rows: namedarray.rows,
    metadatas: {
      aligns: options.aligns,
      sources: [
        options.input,
      ],
    },
  });

  cfwf.saveCFWF(options.output, false);
}

// deno-lint-ignore no-explicit-any
async function addTable(options: any): Promise<void> {
  const cfg: CFWFDataset = readConfig(options.configname) || {};
  const cfwf = new CFWF(cfg);

  let { tables } = cfg;
  tables = tables || {};

  if (!options.tablename) {
    throw new Error("No table name");
  }

  const table = tables[options.tablename] || {
    columns: [],
    rows: [],
  };

  table.columns = table.columns || [];
  table.rows = table.rows || [];
  table.metadatas = table.metadatas || {};

  if (options.columns) {
    table.columns = options.columns;
  }

  if (options.filename) {
    const content = await readTextFile(options.filename);
    const datas = getCSVObject(content);

    if (table.columns && table.columns.length === 0) {
      table.columns = datas.columns;
    }
    table.rows = datas.rows;
  }

  if (options.subtitle) {
    table.subtitle = options.subtitle;
  }

  if (options.description) {
    table.description = options.description;
  }

  if (options.metadatas) {
    Object.assign(
      // deno-lint-ignore no-explicit-any
      table.metadatas as Record<string, any>,
      JSON.parse(options.metadatas),
    );
  }

  if (options.aligns) {
    table.metadatas.aligns = options.aligns;
  }

  // tables[options.tablename] = table;

  cfwf.addTable(options.tablename, table);
  Deno.writeTextFileSync(options.configname, JSON.stringify(cfwf.config));
}

if (import.meta.main) {
  const cmdconvert = new Command()
    .description("Convert files")
    .option("-i, --input <intput:file>", "Input filenme", {
      required: true,
    })
    .option("-o, --output <output:file>", "Output filenme", {
      required: true,
    })
    .option("-t, --tablename <tablename:string>", "Define table name", {})
    .option("-s, --subtitle <subtitle:string>", "Define table subtitle", {})
    .option("-l, --columns <column:string[]>", "Columns name", { default: [] })
    .option("-a, --aligns <column:string[]>", "Aligns for each columns", {})
    .option("-S, --separate", "Separate content & metadatas", {})
    .action((options) => convertFile(options));

  const cmdtable = new Command()
    .description("Configure table")
    // Add table
    .command("add", "Add table configuration")
    .option("-c, --configname <configname:file>", "Config filenme", {
      required: true,
    })
    .option("-f, --filename <filename:file>", "File to be load", {
      required: true,
    })
    .option("-t, --tablename <tablename:string>", "Define table name", {
      required: true,
    })
    .option(
      "-d, --description <description:string>",
      "Define table description",
      {},
    )
    .option("-s, --subtitle <subtitle:string>", "Define table subtitle", {})
    .option("-l, --columns <column:string[]>", "Columns name", { default: [] })
    .option("-a, --aligns <column:string[]>", "Aligns for each columns", {
      required: true,
    })
    .option(
      "-m, --metadatas <metadatas:string>",
      "Define dataset metadatas (JSON format)",
      {},
    )
    .action((options) => addTable(options));

  const cmddataset = new Command()
    .description("Configure dataset")
    // Init
    .command("init", "Init dataset file")
    .option("-c, --configname <configname:file>", "Config filenme", {
      required: true,
    })
    .action((options) => initDatasetFile(options))
    // Set
    .command("set", "Set dataset properties")
    .option("-c, --configname <configname:file>", "Config filenme", {
      required: true,
    })
    .option("-f, --font <title:string>", "Define title font", {})
    .option("-t, --title <title:string>", "Define dataset title", {})
    .option(
      "-d, --description <title:string>",
      "Define dataset description",
    )
    .option(
      "-g, --generatedtitle <generated:string>",
      "Generated title",
      { conflicts: ["title", "font"] },
    )
    .option(
      "-m, --metadatas <metadatas:string>",
      "Define dataset metadatas (JSON format)",
      {},
    )
    .action((options) => setDatasetProperties(options))
    // Table
    .command("table", cmdtable);

  const cmd = new Command()
    .name("cfwf")
    .version(version)
    .description("CFWF Command line")
    .command("completions", new CompletionsCommand())
    .command(
      "convert",
      cmdconvert,
    )
    .command(
      "dataset",
      cmddataset,
    )
    .command("export", "output to stdout the dataset to cfwf format file")
    .option("-c, --configname <configname:file>", "Config filenme", {
      required: true,
    })
    .option("-o, --output", "output to stdout")
    .option("-f, --filename <filename:file>", "export to filename", {
      conflicts: ["output"],
    })
    .option("-S, --separate", "Separate content & metadatas", {
      conflicts: ["output"],
    })
    .action((options) => exportCFWF(options));

  if (Deno.args.length === 0) {
    cmd.showHelp();
  } else {
    cmd.parse(Deno.args);
  }
}
