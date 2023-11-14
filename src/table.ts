export class Table {
  tablename: string;
  subtitle: string;
  comment: string;
  columns: string[];
  // aligns: string[];
  // deno-lint-ignore no-explicit-any
  rows: any[];
  // metas, customised fields and also some value cannot be computer from
  // fulltext document
  // deno-lint-ignore no-explicit-any
  metas: any;

  constructor(
    tablename: string,
    subtitle: string,
    comment: string,
    columns: string[],
    // aligns: string[],
    // deno-lint-ignore no-explicit-any
    rows: any[],
    // deno-lint-ignore no-explicit-any
    metas: any,
  ) {
    if (rows.length == 0) throw new Error("Table has no data");

    let nbcols = 0;
    const isarray = rows[0] instanceof Array;
    let keys: string[];

    if (isarray) {
      nbcols = rows[0].length;
      keys = columns;
    } else {
      // Get headers information from row content
      keys = Object.keys(rows[0]);
      nbcols = keys.length;

      if (columns.length == 0) columns = keys;

      // convert arraykey to array
      for (let rdx = 0; rdx < rows.length; rdx++) {
        rows[rdx] = Object.values(rows[rdx]);
      }
    }

    if (nbcols > 0 && (nbcols != columns.length)) {
      throw new Error(
        `They have ${nbcols} columns and ${columns.length} renamed columns`,
      );
    }

    if (!metas.aligns) {
      throw new Error(
        `No aligns metadatas found`,
      );
    }

    if (nbcols != metas.aligns.length) {
      throw new Error(
        `They have ${nbcols} columns and ${metas.aligns.length} aligns`,
      );
    }

    // let objrows = rows;
    // if (!isarray) {
    //   if (keys != columns) {
    //     for (let rdx = 0; rdx < rows.length; rdx++) {
    //       const row = rows[rdx];
    //       for (let kdx = 0; kdx < keys.length; kdx++) {
    //         if (keys[kdx] != columns[kdx]) {
    //           row[columns[kdx]] = row[keys[kdx]];
    //           delete row[keys[kdx]];
    //         }
    //         // console.log(`${keys[kdx]} => ${columns[kdx]}`);
    //       }
    //     }
    //   }
    // }

    // objrows = [];
    // for (let ridx = 0; ridx < rows.length; ridx++) {
    //   // deno-lint-ignore no-explicit-any
    //   const fields: any = {};
    //   const cols = rows[ridx];
    //   for (let cidx = 0; cidx < cols.length; cidx++) {
    //     // item[headers[cidx]["name"]] = rows[ridx][cidx];
    //     fields[keys[cidx]] = cols[cidx];
    //   }
    //   objrows.push(fields);
    // }

    this.tablename = tablename;
    this.subtitle = subtitle;
    this.comment = comment;
    // this.aligns = aligns;
    this.columns = columns;
    this.rows = rows;
    this.metas = metas;
  }
}
