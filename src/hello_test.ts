// mod_test.ts
import { assertEquals } from "../test_deps.ts";
import { getHelloWorld } from "../mod.ts";

const { test } = Deno;

test(function test_get_hello_world() {
  assertEquals(getHelloWorld(), "\x1b[1mHello World\x1b[22m");
});
