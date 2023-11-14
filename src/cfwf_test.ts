// mod_test.ts
import { CFWF } from "./cfwf.ts";
import { assertEquals, assertGreater, assertThrows } from "../test_deps.ts";
import { modyaml } from "../deps.ts";
import { searchMarker } from "./utils.ts";
import { version } from "./version.ts";
import { writerOptions } from "./types.ts";

const { test } = Deno;

const title = "this is a title";
const comment = "this is a comment";
const footer = "Generated with https://github.com/badele/cfwf";

const datas_array = [
  [1, 1, 1, 1, 1],
  [2, 22, 22, 222, 22],
  [3, 12.43, 333, 33333, 333],
  [4, .123, 4444, 4444444, 4444],
  [5, "", 55555, 555555555, 55555],
];

const datas_array_options = {
  columns: [
    "Id",
    "larger column",
    "right",
    "center",
    "left",
  ],
  aligns: [
    "right",
    "right",
    "right",
    "center",
    "DEFAULTLEFT",
  ],
  title: "Test",
};

const datas_dict = [
  { "Id": 1, "larger column": 1, "right": 1, "center": 1, "left": 1 },
  { "Id": 2, "larger column": 22, "right": 22, "center": 222, "left": 22 },
  {
    "Id": 3,
    "larger column": 12.43,
    "right": 333,
    "center": 33333,
    "left": 333,
  },
  {
    "Id": 4,
    "larger column": .123,
    "right": 4444,
    "center": 4444444,
    "left": 4444,
  },
  {
    "Id": 5,
    "larger column": "",
    "right": 55555,
    "center": 555555555,
    "left": 55555,
  },
];

const datas_dict_options = {
  columns: [],
  aligns: [
    "right",
    "right",
    "right",
    "center",
    "DEFAULTLEFT",
  ],
  title: "Test",
};

test("Generated title", async () => {
  const samples = new CFWF({
    generatedtitle: "this is a title\nis\ngenerated by other tools",
    comment: "",
  });
  const content = await samples.toCFWF({});
  const lines = content.split("\n");

  assertEquals("generated by other tools", lines[2]);
  assertEquals(10, lines.length);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(lines.slice(4).join("\n"));
  const keys = Object.keys(dsinfos._infos_);
  assertEquals(keys, [
    "generated_with",
    "generatedtitle",
    "removetitlelines",
  ]);
});

test("Empty data", async () => {
  const samples = new CFWF({});

  const content = await samples.toCFWF({});
  const lines = content.split("\n");

  assertEquals("", lines[0]);
  assertEquals(5, lines.length);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(lines.join("\n"));
  const keys = Object.keys(dsinfos._infos_);
  assertEquals([
    "generated_with",
    "removetitlelines",
  ], keys);
  assertEquals(`${footer}@${version}`, dsinfos._infos_.generated_with);
});

test("Title", async () => {
  // test title
  const samples = new CFWF({
    title: title,
  });

  const content = await samples.toCFWF({});
  const lines = content.split("\n");

  assertEquals(16, lines.length);
  assertGreater(lines[8].indexOf("┈"), 0);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(lines.slice(9).join("\n"));
  const keys = Object.keys(dsinfos._infos_);
  assertEquals(keys, [
    "font",
    "generated_with",
    "removetitlelines",
    "title",
  ]);
  assertEquals(title, dsinfos._infos_.title);
  assertEquals("doom", dsinfos._infos_.font);
  assertEquals(`${footer}@${version}`, dsinfos._infos_.generated_with);
});

test("Title & comment", async () => {
  // test title and comment
  const samples = new CFWF({
    title: title,
    comment: comment,
  });

  const content = await samples.toCFWF({});
  const lines = content.split("\n");

  assertEquals(18, lines.length);
  assertGreater(lines[8].indexOf("┈"), 0);
  assertGreater(lines[10].indexOf("┈"), 0);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(lines.slice(11).join("\n"));
  const keys = Object.keys(dsinfos._infos_);
  assertEquals(keys, [
    "font",
    "generated_with",
    "removetitlelines",
    "title",
  ]);
  assertEquals(title, dsinfos._infos_.title);
  assertEquals("doom", dsinfos._infos_.font);
  assertEquals(`${footer}@${version}`, dsinfos._infos_.generated_with);
});

test("Columns and headers columns size from samples.cfwf", () => {
  const options: writerOptions = {
    charseparator: "┈",
    chartabletop: "━",
    chartablemiddle: "─",
    chartablebottom: "━",
  };

  const content = Deno.readTextFileSync("samples.cfwf");
  const lines = content.split("\n");

  // Search title and comment marker
  const titlemarkerpos = searchMarker(lines, options.charseparator || "");
  const commentmarkerpos = searchMarker(
    lines,
    options.charseparator || "",
    titlemarkerpos + 1,
  );
  assertEquals(8, titlemarkerpos);
  assertEquals(12, commentmarkerpos);

  let beginheadermarker = searchMarker(lines, options.chartabletop || "");
  let endheadermarker = searchMarker(
    lines,
    options.chartablebottom || "",
    beginheadermarker + 1,
  );

  // players
  let table = lines.slice(beginheadermarker, endheadermarker + 1);
  assertEquals(table[table.length - 1].length, table[0].length);
  assertEquals(
    "winner_ioc   name_first   name_last   hand   height   birth   nbwins",
    table[1],
  );
  assertEquals(
    "──────────   ──────────   ─────────   ────   ──────   ─────   ──────",
    table[2],
  );
  assertEquals(
    "SRB               Novak   Djokovic     R        188    1987       64",
    table[3],
  );

  // australian
  beginheadermarker = searchMarker(
    lines,
    options.chartabletop || "",
    endheadermarker + 1,
  );
  endheadermarker = searchMarker(
    lines,
    options.chartablebottom || "",
    beginheadermarker + 1,
  );

  table = lines.slice(beginheadermarker, endheadermarker + 1);

  assertEquals(table[table.length - 1].length, table[0].length);
  assertEquals(
    "year   tourney name      birth nat       winner    ",
    table[1],
  );
  assertEquals(
    "────   ───────────────   ─────────   ──────────────",
    table[2],
  );
  assertEquals(
    "2022   Australian Open      ESP       Rafael Nadal ",
    table[3],
  );
});

test("No row", () => {
  const samples = new CFWF({
    title: title,
    comment: comment,
  });

  assertThrows(
    () => {
      samples.addArray(
        "number",
        "test numbers",
        "",
        datas_array_options.columns,
        [],
        datas_array_options,
      );
    },
    Error,
    "Table has no data",
  );
});

test("Number col and columns", () => {
  const samples = new CFWF({
    title: title,
    comment: comment,
  });

  assertThrows(
    () => {
      samples.addArray(
        "number",
        "test numbers",
        "",
        ["one columns"],
        datas_array,
        datas_array_options,
      );
    },
    Error,
    "They have 5 columns and 1 renamed columns",
  );
});

test("Aligns provided", () => {
  const samples = new CFWF({
    title: title,
    comment: comment,
  });

  const newoptions = structuredClone(datas_array_options);
  newoptions.aligns = ["onealign"];
  assertThrows(
    () => {
      samples.addArray(
        "number",
        "test numbers",
        "",
        datas_array_options.columns,
        datas_array,
        newoptions,
      );
    },
    Error,
    "They have 5 columns and 1 aligns",
  );

  delete newoptions.aligns;
  assertThrows(
    () => {
      samples.addArray(
        "number",
        "test numbers",
        "",
        datas_array_options.columns,
        datas_array,
        newoptions,
      );
    },
    Error,
    "No aligns metadatas found",
  );
});

test("Number & array", async () => {
  const options: writerOptions = {
    charseparator: "┈",
    chartabletop: "━",
    chartablemiddle: "─",
    chartablebottom: "━",
  };

  const samples = new CFWF({
    title: title,
    comment: comment,
  });

  samples.addArray(
    "number",
    "test numbers",
    "",
    datas_array_options.columns,
    datas_array,
    datas_array_options,
  );

  const content = await samples.toCFWF({});
  const lines = content.split("\n");
  const beginheadermarker = searchMarker(lines, options.chartabletop || "");

  assertEquals(
    "Id   larger column   right    center     left ",
    lines[beginheadermarker + 1],
  );
  assertEquals(
    "──   ─────────────   ─────   ─────────   ─────",
    lines[beginheadermarker + 2],
  );
  assertEquals(
    " 3          12.430     333     33333     333  ",
    lines[beginheadermarker + 5],
  );
});

test("Number & dict", async () => {
  const options: writerOptions = {
    charseparator: "┈",
    chartabletop: "━",
    chartablemiddle: "─",
    chartablebottom: "━",
  };

  const samples = new CFWF({
    title: title,
    comment: comment,
  });

  samples.addArray(
    "number",
    "test numbers",
    "",
    datas_dict_options.columns,
    datas_dict,
    datas_dict_options,
  );

  const content = await samples.toCFWF({});
  const lines = content.split("\n");
  const beginheadermarker = searchMarker(lines, options.chartabletop || "");

  assertEquals(
    "Id   larger column   right    center     left ",
    lines[beginheadermarker + 1],
  );
  assertEquals(
    "──   ─────────────   ─────   ─────────   ─────",
    lines[beginheadermarker + 2],
  );
  assertEquals(
    " 3          12.430     333     33333     333  ",
    lines[beginheadermarker + 5],
  );
});

test("Feature yaml infos order", async () => {
  const samples = new CFWF({});

  const content = await samples.toCFWF({});
  const lines = content.split("\n");

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(lines.join("\n"));
  const keys = Object.keys(dsinfos._infos_);
  assertEquals(keys, [
    "generated_with",
    "removetitlelines",
  ]);
});

test("Feature (no key element can be found in the doc with marker", () => {
  const content = Deno.readTextFileSync("samples.cfwf");
  const lines = content.split("\n");

  let idx = 0;
  while (lines[idx].indexOf("_infos_:") < 0) {
    idx++;
  }

  const syaml = lines.slice(idx);
  // deno-lint-ignore no-explicit-any
  const pyaml = modyaml.parse(syaml.join("\n")) as any;

  const beforekeys = Object.keys(pyaml._infos_);

  // Remove keys can be found in the document with the marker
  delete pyaml._infos_.comment;

  const afterkeys = Object.keys(pyaml._infos_);
  assertEquals(afterkeys, beforekeys);
});

test("Reader", async () => {
  const samples = new CFWF({});
  const content = Deno.readTextFileSync("samples.cfwf");

  samples.fromCFWF(content, {});
  const generatedcontent = await samples.toCFWF();
  Deno.writeTextFileSync("samples_regenerated.cfwf", generatedcontent);

  const newcontent = Deno.readTextFileSync("samples_regenerated.cfwf");
  assertEquals(newcontent, content);
});
