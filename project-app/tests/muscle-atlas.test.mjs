import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";

const root = new URL("../public/models/muscle-atlas/", import.meta.url);

test("the recovery atlas contains a complete muscle layer and left hamstring group", () => {
  const atlas = JSON.parse(readFileSync(new URL("atlas.json", root), "utf8"));
  const compressed = readFileSync(new URL("muscles.bin.gz", root));
  const binary = gunzipSync(compressed);
  const hamstrings = new Set(["FJ1395M", "FJ1444M", "FJ1435M", "FJ1436M"]);

  assert.equal(atlas.parts.length, 402);
  assert.equal(atlas.triangles, 656120);
  assert.equal(binary.byteLength, atlas.chunks[0].bytes);
  assert.deepEqual(
    atlas.parts
      .filter((part) => hamstrings.has(part.id))
      .map((part) => part.name)
      .sort(),
    [
      "Left semimembranosus",
      "Left semitendinosus",
      "Long head of left biceps femoris",
      "Short head of left biceps femoris",
    ],
  );
  for (const part of atlas.parts) {
    assert.ok(part.positions + part.vertexCount * 12 <= binary.byteLength);
    assert.ok(part.normals + part.vertexCount * 6 <= binary.byteLength);
    assert.ok(part.indices + part.indexCount * 4 <= binary.byteLength);
  }
});

test("the packaged atlas keeps its required source attribution", () => {
  const attribution = readFileSync(new URL("ATTRIBUTION.md", root), "utf8");
  assert.match(attribution, /BodyParts3D/);
  assert.match(attribution, /CC Attribution 4\.0 International/);
  assert.match(attribution, /human-atlas/);
});
