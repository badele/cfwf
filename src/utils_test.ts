// mod_test.ts
import { assertEquals } from "../test_deps.ts";
import { readDecodedCSVFile } from "./converter.ts";
import { align, max } from "./utils.ts";

const { test } = Deno;

test("Test max", () => {
  assertEquals(max(0, -1), 0);
  assertEquals(max(0, 0), 0);
  assertEquals(max(0, 1), 1);
  assertEquals(max(-1, 0), 0);
  assertEquals(max(0, 0), 0);
  assertEquals(max(1, 0), 1);
});

test("Test align", () => {
  assertEquals(align("left", "left", 10), "left      ");
  assertEquals(align("center", "center", 10), "  center  ");
  assertEquals(align("center", "center", 11), "  center   ");
  assertEquals(align("right", "right", 10), "     right");
});

test("readDecodedCSV from file", async () => {
  let { rows, columns } = await readDecodedCSVFile(
    "samples/initdatas/players.csv",
  );

  rows = rows || [];
  columns = columns || [];
  assertEquals(10, rows.length);
  assertEquals(columns, [
    "winner_ioc",
    "name_first",
    "name_last",
    "hand",
    "height",
    "birth",
    "nbwins",
  ]);
});

test("readDecodedCSV from remote file", async () => {
  let { rows, columns } = await readDecodedCSVFile(
    "https://media.githubusercontent.com/media/datablist/sample-csv-files/main/files/people/people-100.csv",
  );

  rows = rows || [];
  columns = columns || [];
  assertEquals(100, rows.length);
  assertEquals(columns, [
    "Index",
    "User Id",
    "First Name",
    "Last Name",
    "Sex",
    "Email",
    "Phone",
    "Date of birth",
    "Job Title",
  ]);
});
