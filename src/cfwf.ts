import {
  Align,
  CFWFDataset,
  CFWFOptions,
  DatasetType,
  ExportTable,
  FormatCFWF,
  TableType,
} from "./types.ts";
import { AvailableFonts } from "https://deno.land/x/deno_figlet@1.0.0/src/types.ts";
import { existsSync } from "https://deno.land/std@0.205.0/fs/exists.ts";
import { align, getMaxWidth, max, searchMarker } from "./utils.ts";
import { modfmt, modyaml, text } from "../deps.ts";
import { version } from "./version.ts";

const footertitle = "cfwf@{VERSION} - https://github.com/badele/cfwf";

export class CFWF {
  config: CFWFDataset;
  writeroptions: CFWFOptions;

  // Title
  generatedtitle: string[];
  maxwidthtitle: number;

  constructor(dsconfig: CFWFDataset) {
    dsconfig.dataset = dsconfig.dataset || {};
    dsconfig.tables = dsconfig.tables || {};

    this.config = dsconfig;
    this.generatedtitle = [];
    this.maxwidthtitle = 0;

    this.writeroptions = {
      padding: 3,
      chartitlesep: "┈",
      chardescsep: "┄",
      chartabletop: "━",
      chartablemiddle: "─",
      chartablebottom: "━",
      charyamlsep: "╌",
    };
  }

  async _generateTitle(): Promise<void> {
    let { dataset } = this.config;
    const defaultDataset = { title: "", description: "" };
    dataset = dataset || defaultDataset;

    let { title, metadatas } = dataset;
    metadatas = metadatas || {};

    const font = metadatas.font as AvailableFonts ?? "doom";
    const removetitlelines = metadatas.removetitlelines ?? 2;

    const txttitle = await text(title ?? "", font);
    const ageneratedtitle = txttitle.split("\n").slice(
      0,
      -removetitlelines,
    );
    const maxwidthtitle = getMaxWidth(ageneratedtitle);

    this.generatedtitle = ageneratedtitle;
    this.maxwidthtitle = maxwidthtitle;
  }

  setDatasetProperties(params: DatasetType): void {
    const dataset = this.config.dataset || {};

    if (params) Object.assign(dataset, params);
  }

  addTable(tablename: string, params: TableType): void {
    const tables = this.config.tables || {};
    const table = tables[tablename] || {};

    const dataset = this.config.dataset || {};
    dataset.metadatas = dataset.metadatas || {};
    dataset.metadatas.orders = dataset.metadatas.orders || [];
    dataset.metadatas.orders.push(tablename);

    if (params) Object.assign(table, params);

    tables[tablename] = table;
  }

  getDatas(): Record<string, ExportTable> {
    const tables = this.config?.tables || {};

    const orders = this.config?.dataset?.metadatas?.orders || [];
    const result: Record<string, ExportTable> = {};

    for (const tablename of orders) {
      const table = tables[tablename] as TableType;
      if (table) {
        result[tablename] = {
          columns: table.columns || [],
          rows: table.rows || [],
        };
      }
    }

    return result;
  }

  async saveCFWF(
    filename: string,
    separate: boolean,
  ): Promise<void> {
    const { content, metadatas } = await this.outputCFWF(separate);

    const metaname = filename.replace(".cfwf", ".yaml");
    if (!separate) {
      await Deno.writeTextFile(
        filename,
        content,
      );
      if (existsSync(metaname) === true) {
        await Deno.remove(metaname);
      }
    } else {
      Deno.writeTextFileSync(filename, content);
      const metaname = filename.replace(".cfwf", ".yaml");
      Deno.writeTextFileSync(metaname, metadatas);
    }
  }

  importCFWF(content: string): void {
    const chartitlesep = this.writeroptions.chartitlesep ?? "┈";
    const chardescsep = this.writeroptions.chardescsep ?? "┄";
    const chartabletop = this.writeroptions.chartabletop ?? "━";
    const chartablemiddle = this.writeroptions.chartablemiddle ?? "─";
    const chartablebottom = this.writeroptions.chartablebottom ?? "━";
    const charyamlsep = this.writeroptions.charyamlsep ?? "╌";

    let lastmarkerpos = 0;
    let tabletopmarkerpos = 0;
    let tablebottommarkerpos = 0;
    let tabletablenamepos = 0;
    let tablesubtitlepos = 0;

    const lines = content.split("\n");

    // Search title and description separators
    const titlemarkerpos = searchMarker(lines, chartitlesep);
    const descmarkerpos = searchMarker(lines, chardescsep);
    const yamlmarkerpos = searchMarker(lines, charyamlsep);
    lastmarkerpos = max(titlemarkerpos, descmarkerpos);

    this.config = modyaml.parse(
      lines.slice(yamlmarkerpos + 1, -1).join("\n"),
    ) as CFWFDataset;

    const dataset = this.config.dataset || {};

    if (descmarkerpos > -1) {
      dataset.description = lines.slice(
        titlemarkerpos + 1,
        descmarkerpos,
      ).join("\n");
    }

    let hastable = searchMarker(lines, chartabletop, lastmarkerpos);
    while (hastable > -1) {
      tabletopmarkerpos = searchMarker(lines, chartabletop, lastmarkerpos);
      if (tabletopmarkerpos > -1) {
        // search table
        tablebottommarkerpos = searchMarker(
          lines,
          chartablebottom,
          tabletopmarkerpos + 1,
        );

        tabletablenamepos = tabletopmarkerpos - 3;
        tablesubtitlepos = tabletopmarkerpos - 2;
        const tablename = lines[tabletablenamepos];

        this.config.tables = this.config.tables || {};
        const table = this.config.tables[tablename];

        table.subtitle = lines[tablesubtitlepos];
        table.description = lines.slice(
          lastmarkerpos + 1,
          tabletablenamepos - 1,
        )
          .join("\n");

        const headerline = lines[tabletopmarkerpos + 1];
        const widthline = lines[tabletopmarkerpos + 2];

        const beginspace = widthline.indexOf(" ");
        const endspace = widthline.indexOf(chartablemiddle, beginspace);
        const paddingsize = endspace - beginspace;
        const headerseps = widthline.split(" ".repeat(paddingsize));

        const columns = [];
        let beginpos = 0;
        const headersizes = [];
        for (let idx = 0; idx < headerseps.length; idx++) {
          const headerlength = headerseps[idx].length;
          headersizes.push([beginpos, headerlength]);
          columns.push(
            headerline.slice(beginpos, beginpos + headerlength).trim(),
          );
          beginpos += headerlength + paddingsize;
        }
        table.columns = columns;

        const rows = [];
        for (
          let idx = tabletopmarkerpos + 3;
          idx < tablebottommarkerpos;
          idx++
        ) {
          const cols = [];
          for (let hdx = 0; hdx < headersizes.length; hdx++) {
            const svalue = lines[idx].substring(
              headersizes[hdx][0],
              headersizes[hdx][0] + headersizes[hdx][1],
            ).trim();
            const nvalue = Number(svalue);
            if (nvalue) {
              cols.push(nvalue);
            } else {
              cols.push(svalue);
            }
          }
          rows.push(cols);
        }
        table.rows = rows;

        lastmarkerpos = tablebottommarkerpos + 1;

        hastable = searchMarker(lines, chartabletop, lastmarkerpos);
      }
    }

    // console.log("GETDATAS", this.getDatas());
  }

  async outputCFWF(separate: boolean): Promise<FormatCFWF> {
    const padding = this.writeroptions.padding ?? 3;
    const chartitlesep = this.writeroptions.chartitlesep ?? "┈";
    const chardescsep = this.writeroptions.chardescsep ?? "┄";
    const chartabletop = this.writeroptions.chartabletop ?? "━";
    const chartablemiddle = this.writeroptions.chartablemiddle ?? "─";
    const chartablebottom = this.writeroptions.chartablebottom ?? "━";
    const charyamlsep = this.writeroptions.charyamlsep ?? "╌";

    const lines: string[] = [];
    let maxwidthdescription = 0;

    const config = structuredClone(this.config);

    let { dataset, tables } = config as CFWFDataset;
    const defaultDataset = {
      title: "",
      description: "",
      generatedtitle: "",
      metadatas: {
        orders: [],
      },
    };

    dataset = dataset || defaultDataset;
    tables = tables || {};
    const metadatas = dataset.metadatas || {};

    let { title, generatedtitle, description } = dataset;

    // Compute max dataset title width size
    if (title && title.length > 0) {
      await this._generateTitle();
    }
    if (generatedtitle) {
      this.generatedtitle = generatedtitle.split("\n");
      this.maxwidthtitle = getMaxWidth(this.generatedtitle);
    }

    // Compute max dataset description width size
    if (description && description.length > 0) {
      description = description.replaceAll("\\n", "\n");
      const adescription = description.split("\n");
      maxwidthdescription = getMaxWidth(adescription);
    }
    // Compute title or description max size
    const maxwidthline = max(this.maxwidthtitle, maxwidthdescription);

    if (this.generatedtitle && this.generatedtitle.length > 0) {
      lines.push(this.generatedtitle.join("\n"));
      lines.push(
        align(
          "center",
          chartitlesep.repeat(3),
          maxwidthline,
        ),
      );
    }

    if (description && description.length > 0) {
      lines.push(description);
      lines.push(align("center", chardescsep.repeat(3), maxwidthline));
    }

    // Generate tables
    const tablenames = metadatas.orders || [];
    for (const tablename of tablenames) {
      const table = tables[tablename];

      const defaultTable = {
        title: "",
        description: "",
        rows: [],
        columns: [],
        metadatas: {},
      };

      let { metadatas: tmetadatas } = table || defaultTable;
      tmetadatas = tmetadatas || {};

      //search the needed number of float size for each columns
      const colnbfloat: Record<number, number> = {};
      if (table.rows) {
        for (const row of table.rows) {
          for (let cidx = 0; cidx < row.length; cidx++) {
            const col = row[cidx];
            if (typeof col === "number") {
              const colvalue = col.toString();
              const dotpos = colvalue.indexOf(".");
              colnbfloat[cidx] = max(
                colnbfloat[cidx],
                (dotpos != -1) ? colvalue.length - dotpos - 1 : 0,
              );
            }
          }
        }
      }

      // Compute number floats needed for each columns
      // deno-lint-ignore no-explicit-any
      const srows: any[] = [];

      if (table.rows) {
        for (const row of table.rows) {
          // deno-lint-ignore no-explicit-any
          const cols: any[] = [];
          for (let cidx = 0; cidx < row.length; cidx++) {
            const col = row[cidx];

            if (typeof col === "number" && colnbfloat[cidx] > 0) {
              cols.push(modfmt.sprintf("%.*f", colnbfloat[cidx], col));
            } else {
              cols.push(col.toString());
            }
          }
          srows.push(cols);
        }
      }

      // Init columns size with the header size
      let { columns } = table;
      columns = columns || [];

      const columnssize: number[] = columns.map((col) => col.length);

      // compute the content columns size
      for (const itemrow of srows) {
        for (let colidx = 0; colidx < itemrow.length; colidx++) {
          const content = itemrow[colidx];
          columnssize[colidx] = max(content.length, columnssize[colidx]);
        }
      }

      let { aligns } = tmetadatas || [];

      if (!aligns) {
        aligns = Array(columns.length).fill("left");
      }
      tmetadatas.aligns = aligns;

      // compute total line size
      const headerlinesize = columnssize.reduce((acc, size) => acc + size, 0) +
        (padding * (columns.length - 1));

      // add tablename and subtitle
      if (table.description) {
        lines.push("");
        lines.push(table.description);
      }

      lines.push("");
      if (tablename) {
        lines.push(tablename);
      }

      if (table.subtitle) {
        lines.push(table.subtitle);
        lines.push("");
      }

      // Add top line header
      if (chartabletop) lines.push(chartabletop.repeat(headerlinesize));

      // add header columns
      const headers: string[] = [];
      const middlelineheader: string[] = [];

      for (let idx = 0; idx < columns.length; idx++) {
        const cname = columns[idx];
        const csize = columnssize[idx];

        if (idx > 0) {
          headers.push(" ".repeat(padding));
          middlelineheader.push(" ".repeat(padding));
        }

        if (aligns) {
          headers.push(
            align(aligns[idx] as Align, cname, csize),
          );
        }
        middlelineheader.push(chartablemiddle.repeat(csize));
      }

      // add middle header line separator
      lines.push(headers.join(""));
      lines.push(middlelineheader.join(""));

      // Add rows datas
      for (let rowidx = 0; rowidx < srows.length; rowidx++) {
        const line = [];
        const coldata = srows[rowidx];

        for (let colidx = 0; colidx < coldata.length; colidx++) {
          const csize = columnssize[colidx];

          if (colidx > 0) line.push(" ".repeat(padding));
          // line.push(coldata[colidx].padEnd(csize));

          if (aligns) {
            line.push(
              align(
                aligns[colidx] as Align,
                coldata[colidx],
                csize,
              ),
            );
          }
        }
        lines.push(line.join(""));
      }

      // Add bottom line header
      if (chartablebottom) lines.push(chartablebottom.repeat(headerlinesize));
    }

    lines.push("");

    delete dataset.description;

    metadatas.generated_with = footertitle.replaceAll("{VERSION}", version);

    for (const table of Object.values(tables)) {
      delete table.columns;
      delete table.description;
      delete table.rows;
      delete table.subtitle;
    }

    dataset.metadatas = metadatas;

    const smeta = modyaml.stringify(config, { sortKeys: true });

    if (!separate) {
      lines.push(charyamlsep.repeat(3));
      lines.push(smeta);
      return { content: lines.join("\n"), metadatas: "" };
    } else {
      return { content: lines.join("\n"), metadatas: `---\n${smeta}` };
    }
  }
}
