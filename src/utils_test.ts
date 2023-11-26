// mod_test.ts
import { assertEquals } from "../test_deps.ts";
import { getCSVObject } from "./converter.ts";
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

test("getCSVObject", () => {
  const players_txt = Deno.readTextFileSync("samples/initdatas/players.csv");
  const players = getCSVObject(players_txt);

  assertEquals(10, players.rows.length);
  assertEquals(players.columns, [
    "winner_ioc",
    "name_first",
    "name_last",
    "hand",
    "height",
    "birth",
    "nbwins",
  ]);
});
