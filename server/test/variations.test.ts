import test from "node:test";
import assert from "node:assert/strict";
import { variationForStyle } from "../src/styles/variations.js";
import { styleService } from "../src/styles/styleService.js";

test("wildcard prompts have style-specific scenes and keep identities", () => {
  const ids = ["viking", "k-pop", "astronaut"];
  const wildcardPrompts = ids.map((id) => variationForStyle(id, 2));
  assert.equal(new Set(wildcardPrompts).size, ids.length);
  for (const [index, id] of ids.entries()) {
    assert.match(wildcardPrompts[index], /WILD CARD ART DIRECTION/);
    assert.match(wildcardPrompts[index], /Keep every person/);
    const style = styleService.getStyleById(id);
    assert.ok(style);
    const complete = styleService.buildPrompt(style, wildcardPrompts[index]);
    assert.match(complete, /Identity lock/);
    assert.match(complete, /Count every person/);
  }
  assert.doesNotMatch(variationForStyle("viking", 0), /WILD CARD ART DIRECTION/);
  assert.doesNotMatch(variationForStyle("viking", 1), /WILD CARD ART DIRECTION/);
});
