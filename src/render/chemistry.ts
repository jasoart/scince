import { ScienceParseError } from "./math";

export type ChemicalUnit =
  | {
      type: "element";
      symbol: string;
      count: number;
      mass?: number;
      atomicNumber?: number;
    }
  | {
      type: "group";
      bracket: "()" | "[]";
      children: ChemicalUnit[];
      count: number;
    };
export interface ChemicalFormula {
  source: string;
  coefficient: number;
  segments: { multiplier: number; units: ChemicalUnit[] }[];
  /** Atom counts for one formula unit; coefficient is intentionally separate. */
  elements: Record<string, number>;
  charge: number;
  state?: "aq" | "s" | "l" | "g";
  electron: boolean;
}
export interface ChemicalReaction {
  reactants: ChemicalFormula[];
  products: ChemicalFormula[];
  arrow: "→" | "⇌" | "↔";
  arrowLabel?: string;
}
export interface BalanceCheck {
  balanced: boolean;
  elementsBalanced: boolean;
  chargeBalanced: boolean;
  reactants: { elements: Record<string, number>; charge: number };
  products: { elements: Record<string, number>; charge: number };
  /** product total − reactant total; zero entries are omitted. */
  difference: { elements: Record<string, number>; charge: number };
}

const periodicTable =
  "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(
    " ",
  );
const atomicNumbers = new Map(
  periodicTable.map((symbol, index) => [symbol, index + 1]),
);
const subscriptDigits: Record<string, string> = {
  "₀": "0",
  "₁": "1",
  "₂": "2",
  "₃": "3",
  "₄": "4",
  "₅": "5",
  "₆": "6",
  "₇": "7",
  "₈": "8",
  "₉": "9",
};
const superscriptDigits: Record<string, string> = {
  "⁰": "0",
  "¹": "1",
  "²": "2",
  "³": "3",
  "⁴": "4",
  "⁵": "5",
  "⁶": "6",
  "⁷": "7",
  "⁸": "8",
  "⁹": "9",
  "⁺": "+",
  "⁻": "-",
};
const maximumCount = 1_000_000_000;

function checked(value: number): number {
  if (!Number.isSafeInteger(value) || Math.abs(value) > maximumCount)
    throw new ScienceParseError("原子或電荷計數超過安全預算");
  return value;
}

function normalize(source: string): string {
  if (typeof source !== "string" || source.length > 4096)
    throw new ScienceParseError("化學式超過 4096 字元預算");
  let value = source.trim();
  if (value.startsWith("\\ce{") && value.endsWith("}"))
    value = value.slice(4, -1).trim();
  // Only terminal Unicode superscripts represent a charge; isotope notation is explicit.
  value = value.replace(/[₀-₉]/gu, (digit) => subscriptDigits[digit]);
  value = value.replace(
    /([A-Za-z)\]])_(?:\{(\d+)\}|(\d+))/gu,
    (
      _match,
      atom: string,
      grouped: string | undefined,
      bare: string | undefined,
    ) => `${atom}${grouped ?? bare}`,
  );
  value = value.replace(
    /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+(?=\s*(?:\((?:aq|s|l|g)\))?\s*$)/u,
    (charge) =>
      `^{${[...charge].map((digit) => superscriptDigits[digit]).join("")}}`,
  );
  return value.replace(/[−﹣]/gu, "-").replace(/[∙⋅]/gu, "·");
}

class FormulaParser {
  private position = 0;
  private depth = 0;
  private nodes = 0;
  constructor(private readonly value: string) {}

  parse(): ChemicalFormula["segments"] {
    const segments: ChemicalFormula["segments"] = [];
    do {
      const multiplier = segments.length ? this.readCount() : 1;
      const units = this.units();
      if (!units.length) throw new ScienceParseError("缺少化學式");
      segments.push({ multiplier, units });
      if (this.position === this.value.length) return segments;
      if (this.value[this.position++] !== "·")
        throw new ScienceParseError("非預期的化學式符號");
    } while (this.position < this.value.length);
    throw new ScienceParseError("結晶水分隔點後缺少化學式");
  }

  private readCount(): number {
    const number = /^\d+/u.exec(this.value.slice(this.position));
    if (!number) return 1;
    this.position += number[0].length;
    if (number[0].startsWith("0"))
      throw new ScienceParseError("原子數與係數必須是無前置零的正整數");
    return checked(Number(number[0]));
  }

  private isotopeInteger(marker: "^" | "_"): number | undefined {
    if (this.value[this.position] !== marker) return undefined;
    this.position++;
    const braces = this.value[this.position] === "{";
    if (braces) this.position++;
    if (!/\d/u.test(this.value[this.position] ?? ""))
      throw new ScienceParseError("同位素標記需要正整數");
    const number = this.readCount();
    if (braces && this.value[this.position++] !== "}")
      throw new ScienceParseError("同位素括號未成對");
    return number;
  }

  private units(closing?: string): ChemicalUnit[] {
    if (++this.depth > 24) throw new ScienceParseError("化學式巢狀層數過深");
    const units: ChemicalUnit[] = [];
    while (this.position < this.value.length) {
      if (++this.nodes > 1000) throw new ScienceParseError("化學式節點過多");
      const character = this.value[this.position];
      if (closing && character === closing) {
        this.position++;
        this.depth--;
        return units;
      }
      if (character === "·" && !closing) break;
      if (character === "(" || character === "[") {
        const end = character === "(" ? ")" : "]";
        this.position++;
        const children = this.units(end);
        if (!children.length) throw new ScienceParseError("化學式群組不可為空");
        units.push({
          type: "group",
          bracket: character === "(" ? "()" : "[]",
          children,
          count: this.readCount(),
        });
        continue;
      }
      const mass = this.isotopeInteger("^");
      const atomicNumber = this.isotopeInteger("_");
      const element = /^[A-Z][a-z]?/u.exec(this.value.slice(this.position));
      if (!element || !atomicNumbers.has(element[0]))
        throw new ScienceParseError(
          `未知元素或格式：${this.value.slice(this.position, this.position + 8)}`,
        );
      const symbol = element[0];
      this.position += symbol.length;
      if (
        atomicNumber !== undefined &&
        atomicNumber !== atomicNumbers.get(symbol)
      )
        throw new ScienceParseError("同位素原子序與元素不符");
      if (mass !== undefined && mass < atomicNumbers.get(symbol)!)
        throw new ScienceParseError("質量數不得小於原子序");
      units.push({
        type: "element",
        symbol,
        count: this.readCount(),
        mass,
        atomicNumber,
      });
    }
    this.depth--;
    if (closing) throw new ScienceParseError("化學式括號未成對");
    return units;
  }
}

function countUnits(
  units: ChemicalUnit[],
  elements: Record<string, number>,
  factor: number,
) {
  for (const unit of units) {
    const multiplier = checked(factor * unit.count);
    if (unit.type === "group") countUnits(unit.children, elements, multiplier);
    else
      elements[unit.symbol] = checked(
        (elements[unit.symbol] ?? 0) + multiplier,
      );
  }
}

/** Parse a single species. Throws ScienceParseError for invalid or ambiguous syntax. */
export function parseChemicalFormula(source: string): ChemicalFormula {
  let value = normalize(source);
  let coefficient = 1;
  const leading = /^(\d+)\s*/u.exec(value);
  if (leading) {
    if (leading[1].startsWith("0"))
      throw new ScienceParseError("反應係數必須是無前置零的正整數");
    coefficient = checked(Number(leading[1]));
    value = value.slice(leading[0].length);
  }
  let state: ChemicalFormula["state"];
  const phase = /\s*\((aq|s|l|g)\)$/u.exec(value);
  if (phase) {
    state = phase[1] as ChemicalFormula["state"];
    value = value.slice(0, phase.index);
  }
  let charge = 0;
  const chargeMatch = /\^(?:\{(\d*)([+-])\}|(\d*)([+-]))$/u.exec(value);
  if (chargeMatch) {
    const magnitudeText = chargeMatch[1] ?? chargeMatch[3];
    if (magnitudeText?.startsWith("0"))
      throw new ScienceParseError("電荷量必須是正整數");
    const magnitude = magnitudeText ? checked(Number(magnitudeText)) : 1;
    charge = magnitude * ((chargeMatch[2] ?? chargeMatch[4]) === "+" ? 1 : -1);
    value = value.slice(0, chargeMatch.index);
  } else if (/[+-]$/u.test(value)) {
    // An unadorned sign denotes ±1. Fe3+ means Fe₃⁺; use Fe^{3+} for Fe³⁺.
    charge = value.endsWith("+") ? 1 : -1;
    value = value.slice(0, -1);
  }
  if (value === "e") {
    if (charge !== -1) throw new ScienceParseError("電子必須寫成 e^-");
    return {
      source,
      coefficient,
      segments: [],
      elements: {},
      charge,
      state,
      electron: true,
    };
  }
  // Whitespace can separate a coefficient or phase, never split an element token.
  if (/\s/u.test(value))
    throw new ScienceParseError("物種內不可加入空白，請用 + 分隔反應物");
  const segments = new FormulaParser(value).parse();
  const elements: Record<string, number> = {};
  for (const segment of segments)
    countUnits(segment.units, elements, segment.multiplier);
  return {
    source,
    coefficient,
    segments,
    elements,
    charge,
    state,
    electron: false,
  };
}

function splitSpecies(side: string): string[] {
  const species: string[] = [];
  let start = 0;
  let braces = 0;
  let grouping = 0;
  for (let index = 0; index < side.length; index++) {
    const character = side[index];
    if (character === "{") braces++;
    else if (character === "}") braces--;
    else if (character === "(" || character === "[") grouping++;
    else if (character === ")" || character === "]") grouping--;
    if (braces < 0 || grouping < 0)
      throw new ScienceParseError("反應式括號未成對");
    if (character !== "+" || braces || grouping) continue;
    // In NH4^+ + OH^- the first + is a charge. Braced charges are unambiguous.
    const previous = side.slice(start, index).trimEnd();
    const next = side.slice(index + 1).trimStart();
    const caretCharge = /\^\d*$/u.test(previous);
    const bareCharge = !caretCharge && (next.startsWith("+") || !next.length);
    if (caretCharge || bareCharge) continue;
    species.push(side.slice(start, index).trim());
    start = index + 1;
  }
  if (braces || grouping) throw new ScienceParseError("反應式括號未成對");
  species.push(side.slice(start).trim());
  if (species.some((part) => !part) || species.length > 64)
    throw new ScienceParseError("反應物或生成物格式不完整");
  return species;
}

export function parseChemicalReaction(source: string): ChemicalReaction {
  if (typeof source !== "string" || source.length > 8192)
    throw new ScienceParseError("反應式超過 8192 字元預算");
  let value = source.trim();
  if (value.startsWith("\\ce{") && value.endsWith("}"))
    value = value.slice(4, -1).trim();
  let arrowLabel: string | undefined;
  const labeledArrow = value.indexOf("\\xrightarrow{");
  if (labeledArrow !== -1) {
    const opening = labeledArrow + "\\xrightarrow".length;
    let depth = 1;
    let end = opening + 1;
    for (; end < value.length && depth; end++) {
      if (value[end] === "{") depth++;
      else if (value[end] === "}") depth--;
      if (depth > 8) throw new ScienceParseError("反應條件註記過深");
    }
    if (depth) throw new ScienceParseError("反應條件括號未成對");
    arrowLabel = value
      .slice(opening + 1, end - 1)
      .replace(/\\(?:text|mathrm)\{([^{}\\]*)\}/gu, "$1");
    if (/[{}\\]/u.test(arrowLabel) || arrowLabel.length > 120)
      throw new ScienceParseError("反應條件僅接受短純文字或 text／mathrm");
    value = `${value.slice(0, labeledArrow)}→${value.slice(end)}`;
  }
  const arrows = [...value.matchAll(/<=>|<->|->|⇌|⇄|↔|→|⟶|=/gu)];
  if (arrows.length !== 1)
    throw new ScienceParseError("反應式必須包含一個反應箭號");
  const arrow = arrows[0];
  const left = value.slice(0, arrow.index).trim();
  const right = value.slice(arrow.index! + arrow[0].length).trim();
  return {
    reactants: splitSpecies(left).map(parseChemicalFormula),
    products: splitSpecies(right).map(parseChemicalFormula),
    arrow: ["<=>", "⇌", "⇄"].includes(arrow[0])
      ? "⇌"
      : ["<->", "↔"].includes(arrow[0])
        ? "↔"
        : "→",
    ...(arrowLabel ? { arrowLabel } : {}),
  };
}

export function isChemicalReaction(source: string): boolean {
  return /<=>|<->|->|⇌|⇄|↔|→|⟶|=|\\xrightarrow/u.test(source);
}

/** Checks atom counts and net charge, never guesses coefficients or predicts feasibility. */
export function checkReactionBalance(
  source: string | ChemicalReaction,
): BalanceCheck {
  const reaction =
    typeof source === "string" ? parseChemicalReaction(source) : source;
  const sum = (species: ChemicalFormula[]) => {
    const elements: Record<string, number> = {};
    let charge = 0;
    for (const formula of species) {
      for (const [symbol, count] of Object.entries(formula.elements))
        elements[symbol] = checked(
          (elements[symbol] ?? 0) + checked(count * formula.coefficient),
        );
      charge = checked(charge + checked(formula.charge * formula.coefficient));
    }
    return { elements, charge };
  };
  const reactants = sum(reaction.reactants);
  const products = sum(reaction.products);
  const differences: Record<string, number> = {};
  for (const symbol of new Set([
    ...Object.keys(reactants.elements),
    ...Object.keys(products.elements),
  ])) {
    const difference =
      (products.elements[symbol] ?? 0) - (reactants.elements[symbol] ?? 0);
    if (difference) differences[symbol] = difference;
  }
  const elementsBalanced = Object.keys(differences).length === 0;
  const chargeDifference = products.charge - reactants.charge;
  return {
    balanced: elementsBalanced && chargeDifference === 0,
    elementsBalanced,
    chargeBalanced: chargeDifference === 0,
    reactants,
    products,
    difference: { elements: differences, charge: chargeDifference },
  };
}
