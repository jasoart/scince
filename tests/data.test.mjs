import assert from "node:assert/strict";
import { test } from "node:test";
import { readdir, readFile } from "node:fs/promises";
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
const { coreLessons, addedLessons, lessons, subjects } = await moduleData(
  "src/data/curriculum.ts",
);
const { completeLessons, lessonDetails, practiceCount } = await moduleData(
  "src/data/lesson-details.ts",
);
const nonempty = (value) =>
  assert.ok(typeof value === "string" && value.trim().length > 0);

test("all 64 core units have distinct, complete lessons and exact subject coverage", () => {
  assert.equal(coreLessons.length, 64);
  assert.equal(new Set(coreLessons.map((l) => l.id)).size, 64);
  for (const subject of subjects)
    assert.equal(
      coreLessons.filter((l) => l.subject === subject.id).length,
      16,
    );
  for (const l of coreLessons) {
    const d = lessonDetails[l.id];
    assert.ok(d, `Missing ${l.id}`);
    assert.ok(d.sections.length >= 3, l.id);
    assert.ok(
      d.sections.every((s) => s.heading && s.body.length >= 60),
      `Short teaching section: ${l.id}`,
    );
    assert.ok(
      d.sections.reduce((sum, s) => sum + s.body.length, 0) >= 230,
      `Insufficient teaching content: ${l.id}`,
    );
    assert.ok(d.workedExample.steps.length >= 3, l.id);
    assert.ok(d.practice.length >= 2, l.id);
  }
});

test("all 113 units have one distinct complete lesson and valid subject metadata", () => {
  assert.equal(lessons.length, 113);
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  assert.equal(completeLessons.length, lessons.length);
  assert.equal(
    new Set(completeLessons.map((l) => l.lessonId)).size,
    completeLessons.length,
  );
  assert.deepEqual(
    Object.keys(lessonDetails).sort(),
    lessons.map((l) => l.id).sort(),
  );
  assert.deepEqual(lessons, [...coreLessons, ...addedLessons]);
  const subjectIds = new Set(subjects.map((s) => s.id));
  for (const l of lessons) {
    const d = lessonDetails[l.id];
    assert.ok(d, `Missing ${l.id}`);
    assert.ok(subjectIds.has(l.subject), `Unknown subject: ${l.id}`);
    for (const field of [
      "title",
      "subtitle",
      "chapter",
      "explanation",
      "misconception",
    ])
      nonempty(l[field]);
    assert.ok(Number.isFinite(l.duration) && l.duration > 0, l.id);
    assert.ok(l.concepts.length >= 3, l.id);
    l.concepts.forEach(nonempty);
    l.formulas.forEach((formula) => {
      nonempty(formula.expression);
      nonempty(formula.meaning);
    });
    assert.ok(d.objectives.length >= 3, l.id);
    d.objectives.forEach(nonempty);
    assert.ok(d.prerequisites.length >= 1, l.id);
    d.prerequisites.forEach(nonempty);
    d.workedExample.steps.forEach(nonempty);
    nonempty(d.workedExample.question);
    nonempty(d.workedExample.answer);
    assert.ok(d.summary.length >= 3, l.id);
    d.summary.forEach(nonempty);
    nonempty(d.application);
  }
});

test("49 added units provide substantial teaching, worked solutions and original practice", () => {
  assert.equal(addedLessons.length, 49);
  const additions = {
    physics: 10,
    chemistry: 10,
    biology: 9,
    earth: 10,
    inquiry: 10,
  };
  for (const [prefix, count] of Object.entries(additions))
    assert.equal(
      addedLessons.filter((l) => l.id.startsWith(`${prefix}-`)).length,
      count,
      `Added ${prefix} curriculum size`,
    );
  const failures = [];
  for (const lesson of addedLessons) {
    assert.ok(!coreLessons.some((core) => core.id === lesson.id), lesson.id);
    const detail = lessonDetails[lesson.id];
    assert.ok(
      detail.sections.length >= 4,
      `Need 4 teaching sections: ${lesson.id}`,
    );
    assert.ok(
      detail.practice.length >= 3,
      `Need 3 practice questions: ${lesson.id}`,
    );
    assert.ok(
      detail.workedExample.steps.length >= 4,
      `Need 4 worked solution steps: ${lesson.id}`,
    );
    for (const section of detail.sections) {
      nonempty(section.heading);
      const hanCount = (section.body.match(/\p{Script=Han}/gu) ?? []).length;
      if (hanCount < 100)
        failures.push(
          `${lesson.id} / ${section.heading}: ${hanCount} Chinese characters`,
        );
    }
  }
  assert.deepEqual(
    failures,
    [],
    "Each added teaching section needs at least 100 Chinese characters",
  );
});

test("original self-check questions have valid alternatives, answer indexes and explanations", () => {
  const ids = new Set();
  let count = 0;
  for (const detail of completeLessons) {
    for (const q of detail.practice) {
      assert.ok(!ids.has(q.id), `Duplicate question ID ${q.id}`);
      ids.add(q.id);
      nonempty(q.prompt);
      assert.equal(q.options.length, 4, q.id);
      assert.equal(
        new Set(q.options).size,
        4,
        `Ambiguous duplicate alternatives: ${q.id}`,
      );
      q.options.forEach(nonempty);
      assert.ok(
        Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4,
        q.id,
      );
      assert.ok(q.explanation.length >= 20, `Missing explanation ${q.id}`);
      count++;
    }
  }
  assert.equal(count, practiceCount);
  assert.ok(count >= 275);
});

test("teaching sections and worked examples are substantive rather than repeated placeholders", () => {
  const bodies = completeLessons.flatMap((l) => l.sections.map((s) => s.body));
  assert.equal(
    new Set(bodies).size,
    bodies.length,
    "Teaching paragraphs must be distinct",
  );
  const examples = completeLessons.map((l) => l.workedExample.question);
  assert.equal(new Set(examples).size, completeLessons.length);
  assert.ok(
    !JSON.stringify(completeLessons).match(/待補|TODO|待撰寫|lorem ipsum/i),
  );
});

test("public release contains no historic exam PDFs, text indexes or paper endpoints", async () => {
  async function files(dir) {
    const result = [];
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      result.push(...(e.isDirectory() ? await files(p) : [p]));
    }
    return result;
  }
  const assets = await files("public");
  assert.deepEqual(
    assets.filter((p) =>
      /\/papers\/|\.pdf$|questions\.json|exam-11[1-5]/i.test(p),
    ),
    [],
  );
  const source = await readFile("src/App.tsx", "utf8");
  assert.ok(!source.includes('page === "papers"'));
  assert.ok(!source.includes("歷屆試題"));
  assert.ok(!source.includes("/papers/"));
});
