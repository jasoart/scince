import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

async function moduleData(file) {
  const result = await build({
    entryPoints: [file],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
}

const { officialScope, scopeSource } = await moduleData(
  "src/data/official-scope.ts",
);
const { lessons } = await moduleData("src/data/curriculum.ts");
const { coverage, unlinkedScope } = await moduleData("src/data/coverage.ts");
const { physicsCoverageNotes } = await moduleData("src/data/extra-physics.ts");
const { chemistryCoverageNotes } = await moduleData(
  "src/data/extra-chemistry.ts",
);
const { biologyCoverageNotes } = await moduleData("src/data/extra-biology.ts");
const { earthCoverageNotes } = await moduleData("src/data/extra-earth.ts");
const notes = [
  ...physicsCoverageNotes,
  ...chemistryCoverageNotes,
  ...biologyCoverageNotes,
  ...earthCoverageNotes,
];

test("source index contains exactly 163 official content codes and 14 internal inquiry indexes", () => {
  assert.equal(officialScope.length, 177);
  assert.equal(new Set(officialScope.map((row) => row.code)).size, 177);
  const counts = {
    physics: 49,
    chemistry: 46,
    biology: 26,
    earth: 42,
    inquiry: 14,
  };
  const prefixes = { physics: "P", chemistry: "C", biology: "B", earth: "E" };
  for (const [subject, count] of Object.entries(counts)) {
    const rows = officialScope.filter((row) => row.subject === subject);
    assert.equal(rows.length, count, subject);
    if (subject !== "inquiry")
      for (const row of rows)
        assert.match(
          row.code,
          new RegExp(`^${prefixes[subject]}[A-Z][a-z]-Vc-\\d+$`),
        );
  }
  assert.deepEqual(
    officialScope
      .filter((row) => row.subject === "inquiry")
      .map((row) => row.code),
    Array.from({ length: 14 }, (_, i) => `IQ-${i + 1}`),
  );
  for (const row of officialScope) {
    assert.ok(row.description.trim(), row.code);
    assert.ok(Number.isInteger(row.sourcePage), row.code);
    assert.equal(row.pdfPage, row.sourcePage + 4, row.code);
    if (row.subject === "inquiry")
      assert.ok(row.sourcePage >= 53 && row.sourcePage <= 55, row.code);
    else assert.ok(row.sourcePage >= 42 && row.sourcePage <= 51, row.code);
  }
  const expectedPerPage = {
    42: 21,
    43: 13,
    44: 17,
    45: 16,
    46: 15,
    47: 13,
    48: 21,
    49: 18,
    50: 18,
    51: 11,
  };
  for (const [page, count] of Object.entries(expectedPerPage))
    assert.equal(
      officialScope.filter((row) => row.sourcePage === Number(page)).length,
      count,
      `Source page ${page}`,
    );
  assert.equal(
    scopeSource.sha256,
    "2fd1446ccc739b41551d7215c0d61cf21da51779f06b99aeccf02ead60c946c4",
  );
  assert.ok(
    scopeSource.title && scopeSource.edition && scopeSource.notes.length > 0,
  );
});

test("coverage preserves source metadata and links every item to existing lessons", () => {
  assert.equal(coverage.length, officialScope.length);
  assert.deepEqual(
    unlinkedScope,
    [],
    "Every scope item needs a valid lesson link",
  );
  const ids = new Set(lessons.map((lesson) => lesson.id));
  const source = new Map(officialScope.map((row) => [row.code, row]));
  assert.equal(
    new Set(coverage.map((row) => row.code)).size,
    officialScope.length,
  );
  for (const row of coverage) {
    const original = source.get(row.code);
    assert.ok(original, `Unknown source code: ${row.code}`);
    for (const field of ["subject", "description", "sourcePage", "pdfPage"])
      assert.equal(row[field], original[field], `${row.code} / ${field}`);
    assert.ok(row.lessons.length > 0, row.code);
    assert.equal(
      new Set(row.lessons.map((lesson) => lesson.id)).size,
      row.lessons.length,
      row.code,
    );
    for (const lesson of row.lessons)
      assert.ok(
        ids.has(lesson.id),
        `${row.code} links missing lesson ${lesson.id}`,
      );
  }
});

test("coverage editorial notes reference valid source codes and lesson identifiers", () => {
  const sourceCodes = new Set(officialScope.map((row) => row.code));
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  assert.equal(
    new Set(notes.map((note) => note.code)).size,
    notes.length,
    "Duplicate notes would be hidden by first-match lookup",
  );
  for (const note of notes) {
    assert.ok(sourceCodes.has(note.code), `Unknown note code: ${note.code}`);
    assert.ok(
      note.lessonIds.length > 0,
      `Empty lesson references: ${note.code}`,
    );
    assert.equal(
      new Set(note.lessonIds).size,
      note.lessonIds.length,
      note.code,
    );
    for (const id of note.lessonIds)
      assert.ok(
        lessonIds.has(id),
        `${note.code} references missing lesson ${id}`,
      );
    const linked = coverage.find((row) => row.code === note.code);
    for (const id of note.lessonIds)
      assert.ok(
        linked.lessons.some((lesson) => lesson.id === id),
        `${note.code} drops editorial link ${id}`,
      );
  }
});
