// mod_test.ts
import { CFWF } from "./cfwf.ts";
import { assertEquals } from "../test_deps.ts";
import { modyaml } from "../deps.ts";
import { searchMarker } from "./utils.ts";
import { version } from "./version.ts";
import { CFWFOPTIONS, CFWFOptions } from "./types.ts";
import { readTextCFWFFile } from "./converter.ts";

const { test } = Deno;

const title = "this is a title";
const comment = "this is a comment";
const footer = `cfwf@${version} - https://github.com/badele/cfwf`;

const chartitlesep = CFWFOPTIONS.chartitlesep || "";
const chardescsep = CFWFOPTIONS.chardescsep || "";
const charyamlsep = CFWFOPTIONS.charyamlsep || "";

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
};

// const datas_dict = [
//   { "Id": 1, "larger column": 1, "right": 1, "center": 1, "left": 1 },
//   { "Id": 2, "larger column": 22, "right": 22, "center": 222, "left": 22 },
//   {
//     "Id": 3,
//     "larger column": 12.43,
//     "right": 333,
//     "center": 33333,
//     "left": 333,
//   },
//   {
//     "Id": 4,
//     "larger column": .123,
//     "right": 4444,
//     "center": 4444444,
//     "left": 4444,
//   },
//   {
//     "Id": 5,
//     "larger column": "",
//     "right": 55555,
//     "center": 555555555,
//     "left": 55555,
//   },
// ];

// const datas_dict_options = {
//   columns: [],
//   metadatas: {
//     aligns: [
//       "right",
//       "right",
//       "right",
//       "center",
//       "DEFAULTLEFT",
//     ],
//   },
// };

test("Generated title", async () => {
  const title = "this is a title\nis\ngenerated by other tools";
  const samples = new CFWF({
    dataset: {
      generatedtitle: title,
      description: "",
    },
  });

  const formater = await samples.outputCFWF(false);
  const lines = formater.content.split("\n");

  const titlemarkerpos = searchMarker(lines, chartitlesep || "");
  const descmarkerpos = searchMarker(lines, chardescsep || "");
  const yamlmarkerpos = searchMarker(lines, charyamlsep || "");

  assertEquals(3, titlemarkerpos);
  assertEquals(-1, descmarkerpos);
  assertEquals(5, yamlmarkerpos);

  assertEquals("generated by other tools", lines[2]);
  assertEquals(15, lines.length);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(
    lines.slice(yamlmarkerpos + 1).join("\n"),
  );

  const keys = Object.keys(dsinfos.dataset);

  assertEquals([
    "generatedtitle",
    "metadatas",
  ], keys);
});

test("Empty data", async () => {
  const samples = new CFWF({});

  const formated = await samples.outputCFWF(false);
  const lines = formated.content.split("\n");

  const titlemarkerpos = searchMarker(lines, chartitlesep || "");
  const descmarkerpos = searchMarker(lines, chardescsep || "");
  const yamlmarkerpos = searchMarker(lines, charyamlsep || "");

  assertEquals(-1, titlemarkerpos);
  assertEquals(-1, descmarkerpos);
  assertEquals(1, yamlmarkerpos);

  assertEquals(7, lines.length);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(lines.slice(yamlmarkerpos + 1).join("\n"));
  const datasetkeys = Object.keys(dsinfos.dataset);
  assertEquals([
    "metadatas",
  ], datasetkeys);
  assertEquals(
    `${footer}`,
    dsinfos.dataset.metadatas.generated_with,
  );
});

test("Title", async () => {
  // test title
  const samples = new CFWF({
    dataset: {
      title: title,
    },
  });

  const formated = await samples.outputCFWF(false);
  const lines = formated.content.split("\n");

  const titlemarkerpos = searchMarker(lines, chartitlesep || "");
  const descmarkerpos = searchMarker(lines, chardescsep || "");
  const yamlmarkerpos = searchMarker(lines, charyamlsep || "");

  assertEquals(8, titlemarkerpos);
  assertEquals(-1, descmarkerpos);
  assertEquals(10, yamlmarkerpos);

  assertEquals(17, lines.length);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(
    lines.slice(yamlmarkerpos + 1).join("\n"),
  );
  const keys = Object.keys(dsinfos.dataset);

  assertEquals([
    "metadatas",
    "title",
  ], keys);

  assertEquals(title, dsinfos.dataset.title);
  assertEquals(
    `${footer}`,
    dsinfos.dataset.metadatas.generated_with,
  );
});

test("Title & comment", async () => {
  // test title and comment
  const samples = new CFWF({
    dataset: {
      title: title,
      description: comment,
    },
  });

  const formated = await samples.outputCFWF(false);
  const lines = formated.content.split("\n");

  const titlemarkerpos = searchMarker(lines, chartitlesep || "");
  const descmarkerpos = searchMarker(lines, chardescsep || "");
  const yamlmarkerpos = searchMarker(lines, charyamlsep || "");

  assertEquals(8, titlemarkerpos);
  assertEquals(10, descmarkerpos);
  assertEquals(12, yamlmarkerpos);

  // deno-lint-ignore no-explicit-any
  const dsinfos: any = modyaml.parse(lines.slice(yamlmarkerpos + 1).join("\n"));
  const keys = Object.keys(dsinfos.dataset);
  assertEquals([
    "metadatas",
    "title",
  ], keys);
  assertEquals(title, dsinfos.dataset.title);
  assertEquals(`${footer}`, dsinfos.dataset.metadatas.generated_with);
});

test("Columns and headers columns size from generated_by_sh.cfwf", async () => {
  const options: CFWFOptions = {
    chartabletop: "━",
    chartablemiddle: "─",
    chartablebottom: "━",
  };

  const content = await readTextCFWFFile("samples/generated_by_sh.cfwf");
  const lines = content.split("\n");

  const titlemarkerpos = searchMarker(lines, chartitlesep || "");
  const descmarkerpos = searchMarker(lines, chardescsep || "");
  const yamlmarkerpos = searchMarker(lines, charyamlsep || "");

  assertEquals(8, titlemarkerpos);
  assertEquals(12, descmarkerpos);
  assertEquals(125, yamlmarkerpos);

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

// test("No row", () => {
//   const samples = new CFWF({
//     title: title,
//     comment: comment,
//   });
//
//   assertThrows(
//     () => {
//       samples.addArray(
//         "number",
//         "test numbers",
//         "",
//         datas_array_options.columns,
//         [],
//         datas_array_options,
//       );
//     },
//     Error,
//     "Table has no data",
//   );
// });

// test("Number col and columns", () => {
//   const samples = new CFWF({
//     title: title,
//     comment: comment,
//   });
//
//   assertThrows(
//     () => {
//       samples.addArray(
//         "number",
//         "test numbers",
//         "",
//         ["one columns"],
//         datas_array,
//         datas_array_options,
//       );
//     },
//     Error,
//     "They have 5 columns and 1 renamed columns",
//   );
// });

// test("Aligns provided", () => {
//   const samples = new CFWF({
//     title: title,
//     comment: comment,
//   });
//
//   const newoptions = structuredClone(datas_array_options);
//   newoptions.aligns = ["onealign"];
//   assertThrows(
//     () => {
//       samples.addArray(
//         "number",
//         "test numbers",
//         "",
//         datas_array_options.columns,
//         datas_array,
//         newoptions,
//       );
//     },
//     Error,
//     "They have 5 columns and 1 aligns",
//   );
//
//   delete newoptions.aligns;
//   assertThrows(
//     () => {
//       samples.addArray(
//         "number",
//         "test numbers",
//         "",
//         datas_array_options.columns,
//         datas_array,
//         newoptions,
//       );
//     },
//     Error,
//     "No aligns metadatas found",
//   );
// });

test("Number & array", async () => {
  const options: CFWFOptions = {
    chartabletop: "━",
    chartablemiddle: "─",
    chartablebottom: "━",
  };

  const samples = new CFWF({
    dataset: {
      title: title,
      description: comment,
    },
  });

  samples.addTable("number", {
    subtitle: "test numbers",
    description: "This test is used to check the alignment of numbers",
    columns: datas_array_options.columns,
    rows: datas_array,
    metadatas: {
      aligns: datas_array_options.aligns,
    },
  });

  const formated = await samples.outputCFWF(false);
  const lines = formated.content.split("\n");

  const titlemarkerpos = searchMarker(lines, chartitlesep || "");
  const descmarkerpos = searchMarker(lines, chardescsep || "");
  const yamlmarkerpos = searchMarker(lines, charyamlsep || "");

  assertEquals(8, titlemarkerpos);
  assertEquals(10, descmarkerpos);
  assertEquals(27, yamlmarkerpos);

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

// test("Number & dict", async () => {
//   const options: writerOptions = {
//     charseparator: "┈",
//     chartabletop: "━",
//     chartablemiddle: "─",
//     chartablebottom: "━",
//   };
//
//   const samples = new CFWF({
//     title: title,
//     comment: comment,
//   });
//
//   samples.setTable(
//     "number",
//     {
//       subtitle: "test numbers",
//       comment: "",
//       columns: datas_dict_options.columns,
//       rows: datas_dict,
//       metadatas: datas_dict_options.metadatas,
//     },
//   );
//
//   const content = await samples.outputCFWF({});
//   const lines = content.split("\n");
//   const beginheadermarker = searchMarker(lines, options.chartabletop || "");
//
//   assertEquals(
//     "Id   larger column   right    center     left ",
//     lines[beginheadermarker + 1],
//   );
//   assertEquals(
//     "──   ─────────────   ─────   ─────────   ─────",
//     lines[beginheadermarker + 2],
//   );
//   assertEquals(
//     " 3          12.430     333     33333     333  ",
//     lines[beginheadermarker + 5],
//   );
// });

// test("Feature yaml infos order", async () => {
//   const samples = new CFWF({});
//
//   const content = await samples.outputCFWF({});
//   const lines = content.split("\n");
//
//   // deno-lint-ignore no-explicit-any
//   const dsinfos: any = modyaml.parse(lines.join("\n"));
//   const keys = Object.keys(dsinfos.dataset);
//   assertEquals([
//     "generated_with",
//     "removetitlelines",
//   ], keys);
// });

test("Feature (no key element can be found in the doc with marker", async () => {
  const content = await readTextCFWFFile("samples/generated_by_sh.cfwf");
  const lines = content.split("\n");

  let idx = 0;
  while (lines[idx].indexOf("dataset:") < 0) {
    idx++;
  }

  const syaml = lines.slice(idx);
  // deno-lint-ignore no-explicit-any
  const pyaml = modyaml.parse(syaml.join("\n")) as any;

  const beforekeys = Object.keys(pyaml.dataset);

  // Remove keys can be found in the document with the marker
  delete pyaml.dataset.comment;

  const afterkeys = Object.keys(pyaml.dataset);
  assertEquals(afterkeys, beforekeys);
});

test("Reader & regenerate", async () => {
  const samples = new CFWF({});
  const content = await readTextCFWFFile("samples/generated_by_sh.cfwf");

  samples.importCFWF(content);
  await samples.saveCFWF("samples/samples_regenerated.cfwf", false);

  const newcontent = await readTextCFWFFile("samples/samples_regenerated.cfwf");
  assertEquals(newcontent, content);
});
