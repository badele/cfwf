// mod_test.ts
import { assertEquals, assertRejects, assertThrows } from "../test_deps.ts";
import { Align, arrayToCFWF } from "../mod.ts";

const { test } = Deno;

const datas = [
  [1, 1, 1, 1, 1],
  [2, 22, 22, 222, 22],
  [3, 12.43, 333, 33333, 333],
  [4, .123, 4444, 4444444, 4444],
  [5, "", 55555, 555555555, 55555],
];
const datas_options = {
  headers: [
    "Id",
    "larger column",
    "col",
    "column",
    "other column",
  ],
  aligns: [
    Align.Right,
    Align.Right,
    Align.Right,
    Align.Center,
    Align.Left,
  ],
  title: "Test",
};

const cryptos = [
  [
    "2023-11-04",
    "yahoo",
    "ADA-EUR",
    "Cardano EUR",
    0.30382475,
    "EUR",
    0.0089045465,
    3.02,
  ],
  [
    "2023-11-04",
    "yahoo",
    "BTC-EUR",
    "Bitcoin EUR",
    32382.293,
    "EUR",
    523.85547,
    1.64,
  ],
  [
    "2023-11-04",
    "yahoo",
    "DOGE-EUR",
    "Dogecoin EUR",
    0.06409328,
    "EUR",
    0.0016048551,
    2.57,
  ],
  [
    "2023-11-04",
    "yahoo",
    "ETH-EUR",
    "Ethereum EUR",
    1715.4004,
    "EUR",
    50.568848,
    3.04,
  ],
  [
    "2023-11-04",
    "yahoo",
    "MATIC-EUR",
    "Polygon EUR",
    0.625949,
    "EUR",
    0.0191679,
    3.16,
  ],
  [
    "2023-11-04",
    "yahoo",
    "500.PA",
    "Amundi Index Solutions - Amundi S&P 500 UCITS ETF",
    78.79,
    "EUR",
    0.30999756,
    0.4,
  ],
];

test("Test empty array", async () => {
  const result = await arrayToCFWF([]);
  assertEquals(result, "");
});

test("Test columns and headers columns size", async () => {
  await assertRejects(
    async () => {
      await arrayToCFWF(datas, { headers: datas_options.headers.slice(0, -1) });
    },
    Error,
    "They have 5 columns and 4 header columns",
  );
});

test("Test headers and aligns columns size", async () => {
  await assertRejects(
    async () => {
      await arrayToCFWF(datas, {
        headers: datas_options.headers,
        aligns: datas_options.aligns.slice(0, -1),
      });
    },
    Error,
    "They have 5 columns and 4 aligns",
  );
});

test("Test header", async () => {
  const result = await arrayToCFWF(datas, datas_options);
  const aresult = result.split("\n");

  // Test header
  assertEquals(aresult[10][0], "━");

  assertEquals(
    aresult[11],
    "Id   larger column     col    column     other column",
  );

  assertEquals(
    aresult[12],
    "──   ─────────────   ─────   ─────────   ────────────",
  );

  // test size from header
  for (let idx = 10; idx < aresult.length; idx++) {
    assertEquals(aresult[idx].length, 53);
  }
});

test("Test number parameters", async () => {
  const result = await arrayToCFWF(datas, datas_options);
  const aresult = result.split("\n");

  assertEquals(
    aresult[13],
    " 1           1.000       1       1       1           ",
  );
  assertEquals(
    aresult[16],
    " 4           0.123    4444    4444444    4444        ",
  );
});
