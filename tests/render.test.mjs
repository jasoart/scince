import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import ts from "typescript";

// Exercise the shipped TypeScript and React implementation without another test runtime.
const require = createRequire(import.meta.url);
const modules = new Map();
async function moduleURL(name) {
  if (modules.has(name)) return modules.get(name);
  const extension = name === "ScienceRenderer" ? "tsx" : "ts";
  const source = await readFile(
    new URL(`../src/render/${name}.${extension}`, import.meta.url),
    "utf8",
  );
  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(
    result.diagnostics?.filter(
      (item) => item.category === ts.DiagnosticCategory.Error,
    ),
    [],
  );
  let javascript = result.outputText.replace(
    /import\s+['"]\.\/science-renderer\.css['"];?/gu,
    "",
  );
  for (const dependency of ["math", "chemistry", "text"]) {
    if (
      javascript.includes(`'./${dependency}'`) ||
      javascript.includes(`"./${dependency}"`)
    )
      javascript = javascript
        .replaceAll(
          `'./${dependency}'`,
          JSON.stringify(await moduleURL(dependency)),
        )
        .replaceAll(
          `"./${dependency}"`,
          JSON.stringify(await moduleURL(dependency)),
        );
  }
  for (const dependency of ["react", "react/jsx-runtime"])
    javascript = javascript
      .replaceAll(
        `"${dependency}"`,
        JSON.stringify(pathToFileURL(require.resolve(dependency)).href),
      )
      .replaceAll(
        `'${dependency}'`,
        JSON.stringify(pathToFileURL(require.resolve(dependency)).href),
      );
  const url = `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
  modules.set(name, url);
  return url;
}
const { parseMath, ScienceParseError } = await import(await moduleURL("math"));
const { parseChemicalFormula, parseChemicalReaction, checkReactionBalance } =
  await import(await moduleURL("chemistry"));
const { splitScienceText } = await import(await moduleURL("text"));
const { ScienceFormula, ScienceText } = await import(
  await moduleURL("ScienceRenderer")
);
const html = (component, props) =>
  renderToStaticMarkup(createElement(component, props));
const atoms = (source) => parseChemicalFormula(source).elements;
const catalogModules = new Map();
async function catalogURL(name) {
  if (catalogModules.has(name)) return catalogModules.get(name);
  const source = await readFile(
    new URL(`../src/data/${name}.ts`, import.meta.url),
    "utf8",
  );
  let javascript = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  }).outputText;
  for (const match of javascript.matchAll(/from ['"]\.\/([^'"]+)['"]/gu))
    javascript = javascript.replace(
      match[0],
      `from ${JSON.stringify(await catalogURL(match[1]))}`,
    );
  const url = `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
  catalogModules.set(name, url);
  return url;
}

test("math parser constructs fractions, roots, Greek identifiers and scripts", () => {
  const ast = parseMath(
    String.raw`v=\frac{\Delta x}{\Delta t}+\sqrt[3]{x_1^2}`,
  );
  assert.equal(ast.type, "row");
  assert.equal(ast.children[2].type, "fraction");
  assert.equal(ast.children[2].numerator.children[0].value, "Δ");
  assert.equal(ast.children[4].type, "root");
  assert.equal(ast.children[4].index.children[0].value, "3");
  assert.equal(ast.children[4].body.children[0].type, "scripts");
  const markup = html(ScienceFormula, {
    source: String.raw`\sum_{i=1}^{n}\vec{F}_i=\int_0^t a\,dt`,
    kind: "math",
  });
  assert.match(markup, /<msubsup>/);
  assert.match(markup, /<mover accent="true">/);
  assert.match(markup, /∑/);
  assert.match(markup, /∫/);
});

test("existing Unicode scientific notation remains supported", () => {
  const markup = html(ScienceFormula, {
    source: "F = Gm₁m₂ / r²; λ ∝ 1/f",
    kind: "math",
  });
  assert.match(markup, /data-render-status="rendered"/);
  assert.match(markup, /<msub><mi>m<\/mi><mn>1<\/mn><\/msub>/);
  assert.match(markup, /<msup><mi>r<\/mi><mn>2<\/mn><\/msup>/);
  assert.match(markup, /λ/);
  const labels = html(ScienceFormula, { source: "Iᴬi + eₛ", kind: "math" });
  assert.match(labels, /<msup><mi>I<\/mi><mi>A<\/mi><\/msup>/);
  assert.match(labels, /<msub><mi>e<\/mi><mi>s<\/mi><\/msub>/);
});

test("compact TeX fractions, annotated arrows, conditional bars and calculator exponents retain their meaning", () => {
  const fraction = parseMath(String.raw`\frac12`).children[0];
  assert.equal(fraction.numerator.value, "1");
  assert.equal(fraction.denominator.value, "2");
  const source = String.raw`2C\xrightarrow{S\text{期}}4C; P(A\mid B)=\frac12`;
  const markup = html(ScienceFormula, { source, kind: "math" });
  assert.match(markup, /data-render-status="rendered"/);
  assert.match(markup, /<mover accent="false">/);
  assert.match(markup, /<mtext mathvariant="normal">期<\/mtext>/);
  assert.match(markup, /<mo>\|<\/mo>/);
  const power = parseMath("N=N₀(½)^(t / (2t))").children.at(-1);
  assert.equal(power.type, "scripts");
  assert.equal(power.sup.type, "row");
  assert.ok(power.sup.children.some((node) => node.value === "/"));
});

test("rectangular matrices produce native MathML with preserved cell positions", () => {
  const source = String.raw`\begin{pmatrix}1 & 2 \\ 3 & \frac{4}{5}\end{pmatrix}`;
  const ast = parseMath(source).children[0];
  assert.equal(ast.type, "matrix");
  assert.equal(ast.rows.length, 2);
  assert.equal(ast.rows[1][1].children[0].type, "fraction");
  const markup = html(ScienceFormula, { source, kind: "math" });
  assert.equal((markup.match(/<mtr>/gu) ?? []).length, 2);
  assert.equal((markup.match(/<mtd>/gu) ?? []).length, 4);
  assert.throws(
    () => parseMath(String.raw`\begin{matrix}1&2\\3\end{matrix}`),
    ScienceParseError,
  );
});

test("mathematical parsing refuses unknown commands, mismatched syntax and excess work", () => {
  for (const source of [
    String.raw`\href{javascript:alert(1)}{x}`,
    String.raw`\htmlClass{x}{y}`,
    String.raw`\input{/etc/passwd}`,
    String.raw`\write18{echo x}`,
    "{x",
    "x^^2",
    "x_1_2",
    "\\",
  ])
    assert.throws(() => parseMath(source), ScienceParseError, source);
  assert.throws(() => parseMath("x".repeat(8193)), ScienceParseError);
  assert.throws(
    () => parseMath("{".repeat(40) + "x" + "}".repeat(40)),
    ScienceParseError,
  );
  assert.throws(() => parseMath("\\sqrt".repeat(40) + "x"), ScienceParseError);
});

test("invalid input falls back to escaped source; no executable markup is created", () => {
  const source = String.raw`\href{javascript:alert(1)}{<img src=x onerror=alert(1)>}`;
  const markup = html(ScienceFormula, { source, kind: "math" });
  assert.match(markup, /data-render-status="fallback"/);
  assert.match(markup, /&lt;img/);
  assert.doesNotMatch(markup, /<img|<script|<a\s/u);
  const literal = html(ScienceText, {
    text: "<script>alert(1)</script> and $x^2$",
  });
  assert.doesNotMatch(literal, /<script/u);
  assert.match(literal, /&lt;script&gt;/);
  assert.match(literal, /<math/u);
});

test("chemical parser counts nested groups and coordination complexes accurately", () => {
  assert.deepEqual(atoms("Ca(OH)2"), { Ca: 1, O: 2, H: 2 });
  assert.deepEqual(atoms("Al2(SO4)3"), { Al: 2, S: 3, O: 12 });
  assert.deepEqual(atoms("K4[Fe(CN)6]"), { K: 4, Fe: 1, C: 6, N: 6 });
  assert.deepEqual(atoms("((CH3)2CH)2O"), { C: 6, H: 14, O: 1 });
  assert.deepEqual(atoms("Og"), { Og: 1 });
});

test("hydrates include their own multipliers and preserve reaction coefficient separately", () => {
  const formula = parseChemicalFormula("2CuSO4·5H2O(s)");
  assert.deepEqual(formula.elements, { Cu: 1, S: 1, O: 9, H: 10 });
  assert.equal(formula.coefficient, 2);
  assert.equal(formula.state, "s");
  assert.equal(formula.segments[1].multiplier, 5);
  assert.deepEqual(atoms("Na2CO3·10H2O"), { Na: 2, C: 1, O: 13, H: 20 });
});

test("ions distinguish atom subscripts from superscript charges and support electrons", () => {
  assert.equal(parseChemicalFormula("NH4^+").charge, 1);
  assert.deepEqual(atoms("NH4^+"), { N: 1, H: 4 });
  assert.equal(parseChemicalFormula("SO4^{2-}").charge, -2);
  assert.deepEqual(atoms("SO₄²⁻"), { S: 1, O: 4 });
  assert.equal(parseChemicalFormula("SO₄²⁻").charge, -2);
  assert.equal(parseChemicalFormula("NH₄⁺(aq)").charge, 1);
  assert.equal(parseChemicalFormula("e^-").electron, true);
  assert.deepEqual(atoms("e^-"), {});
});

test("isotope prescripts validate atomic number and leave elemental counting unchanged", () => {
  const formula = parseChemicalFormula("^{14}_{6}C");
  assert.deepEqual(formula.elements, { C: 1 });
  assert.equal(formula.segments[0].units[0].mass, 14);
  assert.equal(formula.segments[0].units[0].atomicNumber, 6);
  assert.throws(() => parseChemicalFormula("^{14}_{7}C"), ScienceParseError);
  assert.throws(() => parseChemicalFormula("^{2}_{6}C"), ScienceParseError);
  const markup = html(ScienceFormula, {
    source: "^{14}_{6}C",
    kind: "chemistry",
  });
  assert.match(markup, /<mmultiscripts>/);
  assert.match(markup, /<mprescripts><\/mprescripts><mn>6<\/mn><mn>14<\/mn>/);
});

test("reaction parser distinguishes ionic signs from species separators", () => {
  const reaction = parseChemicalReaction("NH4^+ + OH^- -> NH3 + H2O");
  assert.equal(reaction.reactants.length, 2);
  assert.equal(reaction.reactants[0].charge, 1);
  assert.equal(reaction.reactants[1].charge, -1);
  assert.equal(checkReactionBalance("H^++OH^-->H2O").balanced, true);
  assert.equal(checkReactionBalance("H+ + OH- -> H2O").balanced, true);
  assert.equal(parseChemicalReaction("N2 + 3H2 ⇌ 2NH3").arrow, "⇌");
});

test("reaction validation separately checks atoms and net charge", () => {
  assert.equal(checkReactionBalance("2H2 + O2 -> 2H2O").balanced, true);
  assert.equal(
    checkReactionBalance("CaCO3(s) -> CaO(s) + CO2(g)").balanced,
    true,
  );
  assert.equal(
    checkReactionBalance(
      "2MnO4^- + 5C2O4^{2-} + 16H^+ -> 2Mn^{2+} + 10CO2 + 8H2O",
    ).balanced,
    true,
  );
  assert.equal(checkReactionBalance("Fe^{3+} + e^- -> Fe^{2+}").balanced, true);
  const chargeFailure = checkReactionBalance("Fe^{2+} -> Fe^{3+}");
  assert.equal(chargeFailure.elementsBalanced, true);
  assert.equal(chargeFailure.chargeBalanced, false);
  assert.equal(chargeFailure.difference.charge, 1);
  const atomFailure = checkReactionBalance("H2 + O2 -> H2O");
  assert.equal(atomFailure.balanced, false);
  assert.deepEqual(atomFailure.difference.elements, { O: -1 });
});

test("chemical parser rejects unknown elements, incomplete groups and integer overflow", () => {
  for (const source of [
    "Xx2",
    "Ca(OH2",
    "H0",
    "0H2O",
    "H01",
    "NH4^{0+}",
    "CuSO4·",
    "H2 O",
    "e^+",
    "H99999999999999999999",
    "K[Fe(CN)6))",
  ])
    assert.throws(
      () => parseChemicalFormula(source),
      ScienceParseError,
      source,
    );
  assert.throws(
    () => parseChemicalFormula("(".repeat(30) + "H" + ")".repeat(30)),
    ScienceParseError,
  );
  assert.throws(
    () => parseChemicalFormula("H".repeat(4097)),
    ScienceParseError,
  );
  for (const source of ["H2 + -> H2", "H2 -> H2 -> H2", "H2 + O2"])
    assert.throws(() => checkReactionBalance(source), ScienceParseError);
});

test("chemistry presentation uses element subscripts, ionic superscripts, states and reaction arrows", () => {
  const markup = html(ScienceFormula, {
    source: String.raw`\ce{NH4^+(aq) + OH^-(aq) -> NH3(g) + H2O(l)}`,
    kind: "chemistry",
    display: true,
  });
  assert.match(markup, /data-render-status="rendered"/);
  assert.match(markup, /<msub>/);
  assert.match(markup, /<msup>/);
  assert.match(markup, /mathvariant="normal"/);
  assert.match(markup, /<mtext>\(aq\)<\/mtext>/);
  assert.match(markup, /<mo>→<\/mo>/);
  assert.match(markup, /display="block"/);
  const photosynthesis = String.raw`6CO_2+6H_2O\xrightarrow{\text{光能}}C_6H_{12}O_6+6O_2`;
  assert.equal(checkReactionBalance(photosynthesis).balanced, true);
  const annotated = html(ScienceFormula, {
    source: photosynthesis,
    kind: "chemistry",
  });
  assert.match(annotated, /data-render-status="rendered"/);
  assert.match(annotated, /<mtext>光能<\/mtext>/);
  assert.throws(
    () => parseChemicalReaction(String.raw`H2\xrightarrow{\href{x}{y}}H2`),
    ScienceParseError,
  );
});

test("mixed prose handles all supported delimiters, nested chemistry braces and escaped dollars", () => {
  const text = String.raw`費用 \$20；速度 $v=\frac{x}{t}$。\(F=ma\) $$x^2$$ \[y_1\] \ce{SO4^{2-}}。`;
  const formulas = splitScienceText(text).filter(
    (segment) => segment.type === "formula",
  );
  assert.equal(formulas.length, 5);
  assert.deepEqual(
    formulas.map((formula) => formula.display),
    [false, false, true, true, false],
  );
  assert.equal(formulas[4].source, "SO4^{2-}");
  assert.equal(formulas[4].kind, "chemistry");
  assert.ok(html(ScienceText, { text }).includes(String.raw`費用 \$20`));
  assert.equal(
    splitScienceText("未完成 $x 與 \\ce{H2O").every(
      (segment) => segment.type === "text",
    ),
    true,
  );
});

test("mixed prose limits rendering work and preserves a readable truncated tail", () => {
  const segments = splitScienceText("$x$ ".repeat(1000));
  assert.ok(segments.length <= 257);
  assert.ok(segments.at(-1).type === "text");
  const markup = html(ScienceText, { text: "a".repeat(80_000) });
  assert.ok(markup.length < 65_000);
  assert.match(markup, /…/);
});

test("every shipped catalog and detailed-course formula renders without a silent syntax fallback", async () => {
  const { lessons } = await import(await catalogURL("curriculum"));
  const { physicalDetails } = await import(
    await catalogURL("details-physical")
  );
  const { lifeEarthDetails } = await import(
    await catalogURL("details-life-earth")
  );
  const failures = [];
  for (const lesson of lessons)
    for (const formula of lesson.formulas) {
      const markup = html(ScienceFormula, { source: formula.expression });
      if (markup.includes('data-render-status="fallback"'))
        failures.push(`${lesson.id}: ${formula.expression}`);
    }
  const scanInline = (value, lessonId) => {
    if (typeof value === "string")
      for (const segment of splitScienceText(value)) {
        if (
          segment.type === "formula" &&
          html(ScienceFormula, {
            source: segment.source,
            kind: segment.kind,
          }).includes('data-render-status="fallback"')
        )
          failures.push(`${lessonId} inline: ${segment.source}`);
      }
    else if (Array.isArray(value))
      value.forEach((item) => scanInline(item, lessonId));
    else if (value && typeof value === "object")
      Object.values(value).forEach((item) => scanInline(item, lessonId));
  };
  for (const lesson of [...physicalDetails, ...lifeEarthDetails]) {
    for (const section of lesson.sections)
      if (
        section.formula &&
        html(ScienceFormula, {
          source: section.formula,
          kind: section.kind ?? "math",
        }).includes('data-render-status="fallback"')
      )
        failures.push(`${lesson.lessonId}: ${section.formula}`);
    scanInline(lesson, lesson.lessonId);
  }
  assert.deepEqual(failures, []);
});
