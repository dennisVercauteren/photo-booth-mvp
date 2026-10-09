import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

test("generated sound pack contains valid offline WAV clips", async () => {
  for (const name of ["select","camera","transition","build","reveal"]) {
    const file = await fs.readFile(path.resolve("client/public/sounds/generated", name + ".wav"));
    assert.equal(file.toString("ascii", 0, 4), "RIFF");
    assert.equal(file.toString("ascii", 8, 12), "WAVE");
    assert.ok(file.byteLength > 1000);
  }
});
