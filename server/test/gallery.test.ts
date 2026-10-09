import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { createGalleryRouter } from "../src/routes/gallery.js";

test("sales gallery returns categorized GitHub images and serves them over /api", async () => {
  const app = express();
  app.use(createGalleryRouter());
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const origin = `http://127.0.0.1:${address.port}`;
    const result = await fetch(`${origin}/api/gallery`);
    assert.equal(result.status, 200);
    const body = await result.json() as { pictures: string[]; boothDesigns: string[] };
    assert.ok(Array.isArray(body.pictures));
    assert.ok(body.boothDesigns.some((name) => name.includes("01-kpop-festival-preview.webp")));
    const picture = await fetch(origin + body.boothDesigns[0]);
    assert.equal(picture.status, 200);
    assert.match(picture.headers.get("content-type") ?? "", /image\/webp/);
    assert.ok((await picture.arrayBuffer()).byteLength > 1000);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
  }
});
