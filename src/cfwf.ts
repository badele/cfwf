import { Align, readerOptions, writerOptions } from "./types.ts";
import { AvailableFonts } from "https://deno.land/x/deno_figlet@1.0.0/src/types.ts";
import { Table } from "./table.ts";
import { align, getMaxWidth, max, searchMarker } from "./utils.ts";
import { modfmt, modyaml, text } from "../deps.ts";
import { version } from "./version.ts";

const footertitle = "Generated with https://github.com/badele/cfwf";

export class CFWF {
  // deno-lint-ignore no-explicit-any
  infos: any;
  tables: Record<string, Table>;

  // Title
  generatedtitle: string[];
  maxwidthtitle: number;

  // deno-lint-ignore no-explicit-any
  constructor(infos: any) {
    if (!infos.font && infos.title) infos.font = "doom";
    // if (infos.generatedtitle) delete infos.title;
    // if (!infos.title && !infos.generatedtitle) infos.title = "VIDE";
    if (!infos.comment) infos.comment = "";
    if (!infos.removetitlelines) infos.removetitlelines = 2;

    this.infos = infos;
    this.tables = {};

    // Title
    this.generatedtitle = [];
    this.maxwidthtitle = 0;
  }

  async _generateTitle(): Promise<void> {
    const txttitle = await text(
      this.infos.title,
      this.infos.font as AvailableFonts,
    );
    const ageneratedtitle = txttitle.split("\n").slice(
      0,
      -this.infos.removetitlelines,
    );
    const maxwidthtitle = getMaxWidth(ageneratedtitle);

    this.generatedtitle = ageneratedtitle;
    this.maxwidthtitle = maxwidthtitle;
  }

  addArray(
    tablename: string,
    subtitle: string,
    comment: string,
    columns: string[],
    // deno-lint-ignore no-explicit-any
    rows: any[],
    // deno-lint-ignore no-explicit-any
    infos: any,
  ): void {
    this.tables[tablename] = new Table(
      tablename,
      subtitle,
      comment,
      columns,
      rows,
      infos,
    );
  }

  fromCFWF(content: string, {
    charseparator = "┈",
    chartabletop = "━",
    chartablemiddle = "─",
    chartablebottom = "━",
  }: readerOptions): void {
    let lastmarkerpos = 0;
    let tabletopmarkerpos = 0;
    let tablebottommarkerpos = 0;
    let tabletablenamepos = 0;
    let tablesubtitlepos = 0;

    // deno-lint-ignore no-explicit-any
    let fromYAML: any = {};
    const tables: Table[] = [];

    const lines = content.split("\n");

    // Search title and comment
    const titlemarkerpos = searchMarker(lines, charseparator);
    const commentmarkerpos = searchMarker(
      lines,
      charseparator,
      titlemarkerpos + 1,
    );
    lastmarkerpos = commentmarkerpos + 1;

    let endfile = false;
    while (!endfile) {
      const table: Table = {
        tablename: "",
        subtitle: "",
        comment: "",
        columns: [],
        // aligns: [],
        rows: [],
        metas: {},
      };

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

        table.tablename = lines[tabletablenamepos];
        table.subtitle = lines[tablesubtitlepos];
        table.comment = lines.slice(lastmarkerpos + 1, tabletablenamepos - 1)
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
        tables.push(table);

        lastmarkerpos = tablebottommarkerpos + 1;
      } else {
        endfile = true;
        fromYAML = modyaml.parse(lines.slice(lastmarkerpos, -1).join("\n"));
        this.infos = fromYAML._infos_;

        this.generatedtitle = lines.slice(0, titlemarkerpos);
        this.infos.comment = lines.slice(
          titlemarkerpos + 1,
          commentmarkerpos,
        ).join("\n");
      }
    }

    this._generateTitle();
    for (let idx = 0; idx < tables.length; idx++) {
      const table = tables[idx];

      this.addArray(
        table.tablename,
        table.subtitle,
        table.comment,
        table.columns,
        // global[table.tablename].aligns,
        table.rows,
        table.metas = fromYAML[table.tablename],
      );
    }
  }

  async toCFWF({
    padding = 3,
    charseparator = "┈",
    chartabletop = "━",
    chartablemiddle = "─",
    chartablebottom = "━",
  }: writerOptions = {}): Promise<string> {
    // deno-lint-ignore no-explicit-any
    const infos: any = {};

    const lines: string[] = [];
    let maxwidthcomment = 0;

    // Compute max title width size
    if (this.infos.title) {
      await this._generateTitle();
    } else {
      if (this.infos.generatedtitle) {
        this.generatedtitle = this.infos.generatedtitle.split("\n");
        this.maxwidthtitle = getMaxWidth(this.generatedtitle);
      }
    }

    // Compute max comment width size
    if (this.infos.comment) {
      const acomment = this.infos.comment.split("\n");
      maxwidthcomment = getMaxWidth(acomment);
    }

    // Compute title or comment max size
    const maxwidthline = max(this.maxwidthtitle, maxwidthcomment);
    if (this.generatedtitle && this.generatedtitle.length > 0) {
      lines.push(this.generatedtitle.join("\n"));
      lines.push(align("center", charseparator.repeat(3), maxwidthline));
    }

    if (this.infos.comment && this.infos.comment.length > 0) {
      lines.push(this.infos.comment);
      lines.push(align("center", charseparator.repeat(3), maxwidthline));
    }

    // Generate tables
    let table: Table;
    const tablenames = Object.keys(this.tables);
    tablenames.forEach((tablename) => {
      table = this.tables[tablename];

      //search the needed number of float size for each columns
      const colnbfloat: Record<number, number> = {};
      for (let ridx = 0; ridx < table.rows.length; ridx++) {
        const row = table.rows[ridx];
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

      // Compute number floats needed for each columns
      // deno-lint-ignore no-explicit-any
      const srows: any[] = [];
      for (let ridx = 0; ridx < table.rows.length; ridx++) {
        const row = table.rows[ridx];
        // deno-lint-ignore no-explicit-any
        const cols: any[] = [];
        for (let cidx = 0; cidx < row.length; cidx++) {
          // const colname = table.columns[cidx];
          const col = row[cidx];
          if (typeof col === "number" && colnbfloat[cidx] > 0) {
            cols.push(modfmt.sprintf("%.*f", colnbfloat[cidx], col));
          } else {
            cols.push(col.toString());
          }
        }
        srows.push(cols);
      }

      // Init columns size with the header size
      const columnssize: number[] = [];
      for (let idx = 0; idx < table.columns.length; idx++) {
        columnssize.push(table.columns[idx].length);
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
      for (let idx = 0; idx < table.columns.length; idx++) {
        if (idx > 0) headerlinesize += padding;
        headerlinesize += columnssize[idx];
      }

      // add tablename and subtitle
      if (table.comment) {
        lines.push("");
        lines.push(table.comment);
      }

      if (table.subtitle) {
        lines.push("");
        lines.push(table.tablename);
        lines.push(table.subtitle);
        lines.push("");
      }

      // Add top line header
      if (chartabletop) lines.push(chartabletop.repeat(headerlinesize));

      // add header columns
      const headers: string[] = [];
      const middlelineheader: string[] = [];

      for (let idx = 0; idx < table.columns.length; idx++) {
        const cname = table.columns[idx];
        const csize = columnssize[idx];

        if (idx > 0) {
          headers.push(" ".repeat(padding));
          middlelineheader.push(" ".repeat(padding));
        }

        headers.push(align(table.metas.aligns[idx] as Align, cname, csize));
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
          line.push(
            align(table.metas.aligns[colidx] as Align, coldata[colidx], csize),
          );
        }
        lines.push(line.join(""));

        infos[tablename] = {};
        infos[tablename]["aligns"] = table.metas.aligns;

        // Add another metas to export
        Object.keys(table.metas).forEach((key) =>
          infos[tablename][key] = table.metas[key]
        );
      }

      // Add bottom line header
      if (chartablebottom) lines.push(chartablebottom.repeat(headerlinesize));
    });

    // Add another metas to export
    infos._infos_ = structuredClone(this.infos);
    infos._infos_.removetitlelines = this.infos.removetitlelines;
    infos._infos_.generated_with = `${footertitle}@${version}`;
    delete infos._infos_.comment;

    lines.push("");
    const smeta = modyaml.stringify(infos, { flowLevel: 2, sortKeys: true });
    lines.push(smeta);

    return lines.join("\n");
  }
}
