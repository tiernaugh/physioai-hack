import { gzipSync } from "node:zlib";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const source = resolve(process.argv[2] ?? "");
if (!process.argv[2]) {
  throw new Error("Usage: node scripts/extract-muscle-atlas.mjs /path/to/human-atlas");
}

const sourceModels = join(source, "public", "models");
const atlas = JSON.parse(readFileSync(join(sourceModels, "atlas.json"), "utf8"));
const chunks = atlas.chunks.map((chunk) =>
  readFileSync(join(sourceModels, basename(chunk.url))),
);
const parts = atlas.parts.filter((part) => part.system === "muscular");
const segments = [];
let bytes = 0;

function append(buffer, alignment) {
  const padding = (alignment - (bytes % alignment)) % alignment;
  if (padding) {
    segments.push(Buffer.alloc(padding));
    bytes += padding;
  }
  const offset = bytes;
  segments.push(buffer);
  bytes += buffer.length;
  return offset;
}

for (const part of parts) {
  const sourceChunk = chunks[part.chunk];
  const positions = sourceChunk.subarray(
    part.positions,
    part.positions + part.vertexCount * 3 * Float32Array.BYTES_PER_ELEMENT,
  );
  const normals = sourceChunk.subarray(
    part.normals,
    part.normals + part.vertexCount * 3 * Int16Array.BYTES_PER_ELEMENT,
  );
  const indices = sourceChunk.subarray(
    part.indices,
    part.indices + part.indexCount * Uint32Array.BYTES_PER_ELEMENT,
  );
  part.chunk = 0;
  part.positions = append(positions, Float32Array.BYTES_PER_ELEMENT);
  part.normals = append(normals, Int16Array.BYTES_PER_ELEMENT);
  part.indices = append(indices, Uint32Array.BYTES_PER_ELEMENT);
}

const binary = Buffer.concat(segments);
const compressed = gzipSync(binary, { level: 9 });
const included = new Set(parts.map((part) => part.id));
const concepts = atlas.concepts
  .map((concept) => ({
    ...concept,
    elements: concept.elements.filter((id) => included.has(id)),
  }))
  .filter((concept) => concept.elements.length > 0);
const output = {
  version: `${atlas.version} · muscular layer`,
  source: atlas.source ?? "BodyParts3D 4.0",
  scope: "Adult male reference musculature extracted for the AI Physio recovery demo.",
  parts,
  concepts,
  triangles: parts.reduce((total, part) => total + part.indexCount / 3, 0),
  chunks: [
    {
      url: "/models/muscle-atlas/muscles.bin.gz",
      bytes: binary.length,
      gzipBytes: compressed.length,
    },
  ],
};

const destination = resolve("public", "models", "muscle-atlas");
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, "muscles.bin.gz"), compressed);
writeFileSync(join(destination, "atlas.json"), `${JSON.stringify(output)}\n`);

console.log(
  JSON.stringify(
    {
      parts: parts.length,
      triangles: output.triangles,
      rawBytes: binary.length,
      gzipBytes: compressed.length,
      destination,
    },
    null,
    2,
  ),
);
