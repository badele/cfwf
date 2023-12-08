import {
  Align,
  CFWFDataset,
  DatasetType,
  FormatCFWF,
  TableType,
} from "./types.ts";
import { AvailableFonts } from "https://deno.land/x/deno_figlet@1.0.0/src/types.ts";
import { existsSync } from "https://deno.land/std@0.205.0/fs/exists.ts";
import {
  align,
  DEFAULTOPTIONS,
  getMaxWidth,
  max,
  searchMarker,
  wrapText,
} from "./utils.ts";
import { modfmt, modyaml, text } from "../deps.ts";
import { version } from "./version.ts";

const footertitle = "cfwf@{VERSION} - https://github.com/badele/cfwf";

export class CFWF {
  config: CFWFDataset;

  // Title
  generatedtitle: string[];
  // maxwidthtitle: number;

  constructor(dsconfig: CFWFDataset) {
    dsconfig.dataset = dsconfig.dataset || {};
    dsconfig.tables = dsconfig.tables || [];

    this.config = dsconfig;
    this.generatedtitle = [];
    // this.maxwidthtitle = 0;
  }

  async _generateTitle(): Promise<void> {
    let { dataset } = this.config;
    const defaultDataset = { title: "", description: "" };
    dataset = dataset || defaultDataset;

    let { title, metadatas } = dataset;
    metadatas = metadatas || {};

    const font = metadatas.font as AvailableFonts ?? DEFAULTOPTIONS.font;
    const removetitlelines = metadatas.removetitlelines ??
      DEFAULTOPTIONS.removetitlelines;
    const width = metadatas.width ?? DEFAULTOPTIONS.width;

    const txttitle = await text(title ?? "", font);
    const ageneratedtitle = txttitle.split("\n").slice(
      0,
      -removetitlelines,
    );

    const maxwidth = getMaxWidth(txttitle.split("\n"));
    const nbspace = (width - maxwidth) / 2;

    if (nbspace > 0) {
      for (let idx = 0; idx < ageneratedtitle.length; idx++) {
        ageneratedtitle[idx] = " ".repeat(nbspace) +
          ageneratedtitle[idx].trimEnd();
      }
    }

    this.generatedtitle = ageneratedtitle;
  }

  setDatasetProperties(params: DatasetType): void {
    const dataset = this.config.dataset || {};

    if (params) Object.assign(dataset, params);
  }

  addTable(table: TableType): void {
    const tables = this.config.tables || [];

    tables.push({ ...table });
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
    const chartitlesep = DEFAULTOPTIONS.chartitlesep;
    const chardescsep = DEFAULTOPTIONS.chardescsep;
    const chartabletop = DEFAULTOPTIONS.chartabletop;
    const chartablemiddle = DEFAULTOPTIONS.chartablemiddle;
    const chartablebottom = DEFAULTOPTIONS.chartablebottom;
    const chartabledesc = DEFAULTOPTIONS.chartabledesc;
    const charyamlsep = DEFAULTOPTIONS.charyamlsep;

    let lastmarkerpos = 0;
    let tabletopmarkerpos = 0;
    let tablebottommarkerpos = 0;
    let tabledescpos = 0;

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
    const tables = this.config.tables || [];

    if (descmarkerpos > -1) {
      dataset.description = lines.slice(
        titlemarkerpos + 1,
        descmarkerpos,
      ).join(" ");
    }

    let hastable = searchMarker(lines, chartabletop, lastmarkerpos + 1);

    let tblidx = -1;
    while (hastable > -1) {
      tblidx++;
      const table = tables[tblidx] || {};
      tabletopmarkerpos = searchMarker(lines, chartabletop, lastmarkerpos + 1);

      if (tabletopmarkerpos > -1) {
        // search bottom table marker
        tablebottommarkerpos = searchMarker(
          lines,
          chartablebottom,
          tabletopmarkerpos + 1,
        );

        // search description marker
        tabledescpos = searchMarker(
          lines,
          chartabledesc,
          lastmarkerpos + 1,
        );

        let tablemarkertitlepos = tabletopmarkerpos;
        if (tabledescpos > -1 && tabledescpos < tabletopmarkerpos) {
          table.description = lines.slice(
            tabledescpos + 1,
            tabletopmarkerpos - 1,
          ).join(" ");
          tablemarkertitlepos = tabledescpos;
        }

        if (lines[tablemarkertitlepos - 3].trim() === "") {
          table.tablename = lines[tablemarkertitlepos - 2];
        } else {
          table.tablename = lines[tablemarkertitlepos - 3];
          table.subtitle = lines[tablemarkertitlepos - 2];
        }

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
  }

  async outputCFWF(separate: boolean): Promise<FormatCFWF> {
    const padding = DEFAULTOPTIONS.padding;
    const chartitlesep = DEFAULTOPTIONS.chartitlesep;
    const chardescsep = DEFAULTOPTIONS.chardescsep;
    const chartabletop = DEFAULTOPTIONS.chartabletop;
    const chartablemiddle = DEFAULTOPTIONS.chartablemiddle;
    const chartablebottom = DEFAULTOPTIONS.chartablebottom;
    const chartabledesc = DEFAULTOPTIONS.chartabledesc;
    const charyamlsep = DEFAULTOPTIONS.charyamlsep;

    const lines: string[] = [];

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
    tables = tables || [];
    const metadatas = dataset.metadatas || {};

    const { title, generatedtitle, description } = dataset;
    const datasetwidth = metadatas.width ?? DEFAULTOPTIONS.width;

    // Compute max dataset title width size
    if (title && title.length > 0) {
      await this._generateTitle();
    }
    if (generatedtitle) {
      this.generatedtitle = generatedtitle.split("\n");
    }

    if (this.generatedtitle && this.generatedtitle.length > 0) {
      lines.push(this.generatedtitle.join("\n"));
      lines.push(
        align(
          "center",
          chartitlesep.repeat(3),
          datasetwidth,
        ).trimEnd(),
      );
    }

    if (description && description.length > 0) {
      lines.push(wrapText(description, datasetwidth).trimEnd());
      lines.push(
        align("center", chardescsep.repeat(3), datasetwidth).trimEnd(),
      );
    }

    // Generate tables
    for (const table of tables) {
      const tablename = table.tablename;
      const defaultTable = {
        tablename: "",
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

            switch (typeof col) {
              case "number": {
                if (colnbfloat[cidx] > 0) {
                  cols.push(modfmt.sprintf("%.*f", colnbfloat[cidx], col));
                } else {
                  cols.push(col.toString());
                }

                break;
              }
              case "string": {
                cols.push(col.toString());

                break;
              }
              default:
                cols.push("");

                break;
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
      lines.push("");
      if (tablename) {
        lines.push(tablename);
      }

      if (table.subtitle) {
        lines.push(table.subtitle);
      }

      // add table description
      if (table.description) {
        lines.push("");
        lines.push(
          align("center", chartabledesc.repeat(3), datasetwidth).trimEnd(),
        );
        lines.push(wrapText(table.description, datasetwidth).trimEnd());
      }

      // Add top line header
      lines.push("");
      lines.push(chartabletop.repeat(headerlinesize));

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
      lines.push(headers.join("").trimEnd());
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
        lines.push(line.join("").trimEnd());
      }

      // Add bottom line header
      lines.push(chartablebottom.repeat(headerlinesize));
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
