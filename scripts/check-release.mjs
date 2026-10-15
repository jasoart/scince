import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
async function walk(dir) {
  const files = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    files.push(...(e.isDirectory() ? await walk(p) : [p]));
  }
  return files;
}
const files = await walk("dist");
const forbidden = files.filter((p) =>
  /[/\\](papers|reference-material)[/\\]|exam-11[1-5]|questions\.json|\.pdf$/i.test(
    p,
  ),
);
if (forbidden.length)
  throw new Error(
    `Private reference material in release: ${forbidden.join(", ")}`,
  );
const html = await readFile("dist/index.html", "utf8");
if (!html.includes("SCINCE")) throw new Error("Missing application HTML");
console.log(
  `Release checked: ${files.length} files; no exam PDFs, text or question indexes.`,
);
