import { createElement, Fragment, useMemo } from "react";
import type { ReactElement, ReactNode } from "react";
import { parseMath } from "./math";
import type { MathNode } from "./math";
import {
  isChemicalReaction,
  parseChemicalFormula,
  parseChemicalReaction,
} from "./chemistry";
import type { ChemicalFormula, ChemicalUnit } from "./chemistry";
import { splitScienceText } from "./text";
import "./science-renderer.css";

export { parseMath, ScienceParseError } from "./math";
export {
  checkReactionBalance,
  parseChemicalFormula,
  parseChemicalReaction,
} from "./chemistry";
export type { MathNode } from "./math";
export type {
  BalanceCheck,
  ChemicalFormula,
  ChemicalReaction,
} from "./chemistry";

// createElement creates native MathML elements; no source ever becomes markup.
const m = (
  tag: string,
  children: ReactNode[],
  attributes: Record<string, unknown> = {},
): ReactElement => createElement(tag, attributes, ...children);
const mn = (value: number | string) => m("mn", [String(value)]);
const mo = (value: string) => m("mo", [value]);
const row = (children: ReactNode[]) => m("mrow", children);

function renderMath(node: MathNode): ReactElement {
  switch (node.type) {
    case "row":
      return row(node.children.map(renderMath));
    case "token":
      return m(
        node.role === "number"
          ? "mn"
          : node.role === "operator"
            ? "mo"
            : node.role === "text"
              ? "mtext"
              : "mi",
        [node.value],
        node.variant ? { mathvariant: node.variant } : {},
      );
    case "fraction": {
      const fraction = m(
        "mfrac",
        [renderMath(node.numerator), renderMath(node.denominator)],
        node.binomial ? { linethickness: "0" } : {},
      );
      return node.binomial ? row([mo("("), fraction, mo(")")]) : fraction;
    }
    case "root":
      return node.index
        ? m("mroot", [renderMath(node.body), renderMath(node.index)])
        : m("msqrt", [renderMath(node.body)]);
    case "scripts":
      return node.sub && node.sup
        ? m("msubsup", [
            renderMath(node.base),
            renderMath(node.sub),
            renderMath(node.sup),
          ])
        : node.sub
          ? m("msub", [renderMath(node.base), renderMath(node.sub)])
          : m("msup", [renderMath(node.base), renderMath(node.sup!)]);
    case "accent":
      return m("mover", [renderMath(node.body), mo(node.mark)], {
        accent: "true",
      });
    case "annotation":
      return node.above && node.below
        ? m("munderover", [
            renderMath(node.body),
            renderMath(node.below),
            renderMath(node.above),
          ])
        : node.above
          ? m("mover", [renderMath(node.body), renderMath(node.above)], {
              accent: "false",
            })
          : m("munder", [renderMath(node.body), renderMath(node.below!)], {
              accentunder: "false",
            });
    case "matrix": {
      const table = m(
        "mtable",
        node.rows.map((cells) =>
          m(
            "mtr",
            cells.map((cell) => m("mtd", [renderMath(cell)])),
          ),
        ),
      );
      return node.brackets
        ? row([mo(node.brackets[0]), table, mo(node.brackets[1])])
        : table;
    }
  }
}

function renderChemicalUnit(unit: ChemicalUnit): ReactElement {
  let base: ReactElement;
  if (unit.type === "group")
    base = row([
      mo(unit.bracket[0]),
      ...unit.children.map(renderChemicalUnit),
      mo(unit.bracket[1]),
    ]);
  else {
    base = m("mi", [unit.symbol], { mathvariant: "normal" });
    if (unit.mass !== undefined || unit.atomicNumber !== undefined)
      base = m("mmultiscripts", [
        base,
        m("mprescripts", []),
        unit.atomicNumber === undefined ? m("mrow", []) : mn(unit.atomicNumber),
        unit.mass === undefined ? m("mrow", []) : mn(unit.mass),
      ]);
  }
  return unit.count !== 1 ? m("msub", [base, mn(unit.count)]) : base;
}

function renderChemicalFormula(formula: ChemicalFormula): ReactElement {
  const parts: ReactNode[] = [];
  if (formula.coefficient !== 1) parts.push(mn(formula.coefficient));
  let molecule = formula.electron
    ? m("mi", ["e"], { mathvariant: "normal" })
    : row(
        formula.segments.flatMap((segment, index) => [
          ...(index ? [mo("·")] : []),
          ...(segment.multiplier !== 1 ? [mn(segment.multiplier)] : []),
          ...segment.units.map(renderChemicalUnit),
        ]),
      );
  if (formula.charge)
    molecule = m("msup", [
      molecule,
      row([
        ...(Math.abs(formula.charge) !== 1
          ? [mn(Math.abs(formula.charge))]
          : []),
        mo(formula.charge > 0 ? "+" : "−"),
      ]),
    ]);
  parts.push(molecule);
  if (formula.state) parts.push(m("mtext", [`(${formula.state})`]));
  return row(parts);
}

function renderChemistry(source: string): ReactElement {
  if (!isChemicalReaction(source))
    return renderChemicalFormula(parseChemicalFormula(source));
  const reaction = parseChemicalReaction(source);
  const side = (species: ChemicalFormula[]) =>
    species.flatMap((formula, index) => [
      ...(index ? [mo("+")] : []),
      renderChemicalFormula(formula),
    ]);
  const arrow = reaction.arrowLabel
    ? m("mover", [mo(reaction.arrow), m("mtext", [reaction.arrowLabel])], {
        accent: "false",
      })
    : mo(reaction.arrow);
  return row([...side(reaction.reactants), arrow, ...side(reaction.products)]);
}

export function ScienceFormula({
  source,
  kind = "auto",
  display = false,
  className = "",
}: {
  source: string;
  kind?: "auto" | "math" | "chemistry";
  display?: boolean;
  className?: string;
}) {
  const result = useMemo(() => {
    try {
      if (
        kind === "chemistry" ||
        (kind === "auto" && source.trim().startsWith("\\ce{"))
      )
        return { node: renderChemistry(source), error: "" };
      if (
        kind === "auto" &&
        /[A-Z]/u.test(source) &&
        /\d|[₀-₉]|[a-z][A-Z]|[A-Z][a-z]|[()[\]]|->|→|⇌/u.test(source)
      ) {
        try {
          return { node: renderChemistry(source), error: "" };
        } catch {
          /* An ordinary physics expression may resemble a species. */
        }
      }
      return { node: renderMath(parseMath(source)), error: "" };
    } catch (cause) {
      return {
        node: null,
        error: cause instanceof Error ? cause.message : "無法解析此公式",
      };
    }
  }, [source, kind]);
  const classes = `sr-formula${display ? " sr-display" : ""}${result.error ? " sr-fallback" : ""}${className ? ` ${className}` : ""}`;
  return (
    <span
      className={classes}
      data-science-kind={kind}
      data-render-status={result.error ? "fallback" : "rendered"}
      title={result.error ? `保留原文：${result.error}` : undefined}
    >
      {result.node
        ? m("math", [result.node], {
            xmlns: "http://www.w3.org/1998/Math/MathML",
            display: display ? "block" : "inline",
            role: "math",
          })
        : source.length > 8192
          ? `${source.slice(0, 8192)}…`
          : source}
    </span>
  );
}

export function ScienceText({ text }: { text: string }) {
  const segments = useMemo(() => splitScienceText(text), [text]);
  return (
    <span className="sr-text">
      {segments.map((segment, index) =>
        segment.type === "text" ? (
          <Fragment key={index}>{segment.source}</Fragment>
        ) : (
          <ScienceFormula
            key={index}
            source={segment.source}
            kind={segment.kind}
            display={segment.display}
          />
        ),
      )}
    </span>
  );
}
