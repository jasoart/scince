/** A deliberately bounded TeX-like parser. It never executes source or emits HTML. */
export type MathNode =
  | { type: "row"; children: MathNode[] }
  | {
      type: "token";
      value: string;
      role: "identifier" | "number" | "operator" | "text";
      variant?: "normal" | "bold" | "italic";
    }
  | {
      type: "fraction";
      numerator: MathNode;
      denominator: MathNode;
      binomial?: boolean;
    }
  | { type: "root"; body: MathNode; index?: MathNode }
  | { type: "scripts"; base: MathNode; sub?: MathNode; sup?: MathNode }
  | { type: "accent"; body: MathNode; mark: string }
  | { type: "annotation"; body: MathNode; above?: MathNode; below?: MathNode }
  | { type: "matrix"; rows: MathNode[][]; brackets: "" | "()" | "[]" };

export class ScienceParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ScienceParseError";
  }
}

const symbols: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  varepsilon: "ϵ",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  vartheta: "ϑ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  varphi: "ϕ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  times: "×",
  cdot: "·",
  div: "÷",
  pm: "±",
  mp: "∓",
  le: "≤",
  leq: "≤",
  ge: "≥",
  geq: "≥",
  ne: "≠",
  neq: "≠",
  approx: "≈",
  sim: "∼",
  propto: "∝",
  equiv: "≡",
  infty: "∞",
  partial: "∂",
  nabla: "∇",
  sum: "∑",
  prod: "∏",
  int: "∫",
  iint: "∬",
  oint: "∮",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  Leftrightarrow: "⇔",
  angle: "∠",
  degree: "°",
  circ: "∘",
  perp: "⊥",
  parallel: "∥",
  mid: "|",
  lvert: "|",
  rvert: "|",
  langle: "⟨",
  rangle: "⟩",
  lbrace: "{",
  rbrace: "}",
  in: "∈",
  notin: "∉",
  cup: "∪",
  cap: "∩",
  emptyset: "∅",
  forall: "∀",
  exists: "∃",
  ldots: "…",
  cdots: "⋯",
  hbar: "ℏ",
  ell: "ℓ",
};
const functionNames = new Set([
  "sin",
  "cos",
  "tan",
  "arcsin",
  "arccos",
  "arctan",
  "sinh",
  "cosh",
  "log",
  "ln",
  "exp",
  "lim",
  "max",
  "min",
  "det",
]);
const subDigits: Record<string, string> = {
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
  "₊": "+",
  "₋": "−",
  "₌": "=",
  "₍": "(",
  "₎": ")",
  ₙ: "n",
  ₘ: "m",
  ₓ: "x",
  ₐ: "a",
  ₑ: "e",
  ₒ: "o",
  ₕ: "h",
  ₖ: "k",
  ₗ: "l",
  ₚ: "p",
  ₛ: "s",
  ₜ: "t",
  ⱼ: "j",
  ᵢ: "i",
  ᵣ: "r",
  ᵤ: "u",
  ᵥ: "v",
};
const supDigits: Record<string, string> = {
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
  "⁻": "−",
  "⁼": "=",
  "⁽": "(",
  "⁾": ")",
  ᴬ: "A",
  ᴮ: "B",
  ᴰ: "D",
  ᴱ: "E",
  ᴳ: "G",
  ᴴ: "H",
  ᴵ: "I",
  ᴶ: "J",
  ᴷ: "K",
  ᴸ: "L",
  ᴹ: "M",
  ᴺ: "N",
  ᴼ: "O",
  ᴾ: "P",
  ᴿ: "R",
  ᵀ: "T",
  ᵁ: "U",
  ⱽ: "V",
  ᵂ: "W",
  ᵃ: "a",
  ᵇ: "b",
  ᶜ: "c",
  ᵈ: "d",
  ᵉ: "e",
  ᶠ: "f",
  ᵍ: "g",
  ʰ: "h",
  ⁱ: "i",
  ʲ: "j",
  ᵏ: "k",
  ˡ: "l",
  ᵐ: "m",
  ⁿ: "n",
  ᵒ: "o",
  ᵖ: "p",
  ʳ: "r",
  ˢ: "s",
  ᵗ: "t",
  ᵘ: "u",
  ᵛ: "v",
  ʷ: "w",
  ˣ: "x",
  ʸ: "y",
  ᶻ: "z",
};
const operatorPattern = /[+\-−=<>×÷·/|:;,!%∑∫∏∮∬≈≠≤≥±∝→←↔⇒⇔∈∉∪∩∂∇∞()[\]]/u;
const token = (
  value: string,
  role: "identifier" | "number" | "operator" | "text" = "operator",
): MathNode => ({ type: "token", value, role });

class MathParser {
  private position = 0;
  private depth = 0;
  private nodes = 0;
  constructor(private readonly source: string) {}

  parse(): MathNode {
    const result = this.sequence(() => false);
    if (!result.children.length) throw new ScienceParseError("公式為空");
    return result;
  }

  private budget() {
    if (++this.nodes > 1800) throw new ScienceParseError("公式節點過多");
    if (this.depth > 32) throw new ScienceParseError("公式巢狀層數過深");
  }

  private skipSpace() {
    while (
      /\s/u.test(this.source[this.position] ?? "") &&
      this.position < this.source.length
    )
      this.position++;
  }

  private sequence(stop: () => boolean): Extract<MathNode, { type: "row" }> {
    this.depth++;
    this.budget();
    const children: MathNode[] = [];
    while (this.position < this.source.length) {
      this.skipSpace();
      if (this.position >= this.source.length || stop()) break;
      const next = this.atom();
      if (next) children.push(this.withScripts(next));
    }
    this.depth--;
    return { type: "row", children };
  }

  private group(): MathNode {
    this.skipSpace();
    if (this.source[this.position] !== "{") {
      // TeX macros take a single token: \frac12 means 1/2, not 12/?.
      if (/\d/u.test(this.source[this.position] ?? ""))
        return token(this.source[this.position++], "number");
      this.depth++;
      this.budget();
      const single = this.atom();
      this.depth--;
      if (!single) throw new ScienceParseError("缺少公式引數");
      return single;
    }
    this.position++;
    const group = this.sequence(() => this.source[this.position] === "}");
    if (this.source[this.position++] !== "}")
      throw new ScienceParseError("大括號未成對");
    return group;
  }

  private rawGroup(): string {
    this.skipSpace();
    if (this.source[this.position++] !== "{")
      throw new ScienceParseError("缺少文字括號");
    const start = this.position;
    while (
      this.position < this.source.length &&
      this.source[this.position] !== "}"
    ) {
      if (/[{\\]/u.test(this.source[this.position]))
        throw new ScienceParseError("文字命令只接受純文字");
      this.position++;
    }
    if (this.position >= this.source.length)
      throw new ScienceParseError("文字括號未成對");
    return this.source.slice(start, this.position++);
  }

  private command(): string {
    this.position++;
    const name = /^[A-Za-z]+/u.exec(this.source.slice(this.position));
    if (name) {
      this.position += name[0].length;
      return name[0];
    }
    return this.source[this.position++] ?? "";
  }

  private atom(): MathNode | null {
    this.budget();
    const character = this.source[this.position];
    if (!character) throw new ScienceParseError("公式未完成");
    if (character === "{") return this.group();
    if (
      character === "}" ||
      character === "^" ||
      character === "_" ||
      character === "&"
    )
      throw new ScienceParseError(`非預期符號 ${character}`);
    if (character === "\\") {
      const name = this.command();
      if (
        name === "frac" ||
        name === "dfrac" ||
        name === "tfrac" ||
        name === "binom"
      )
        return {
          type: "fraction",
          numerator: this.group(),
          denominator: this.group(),
          binomial: name === "binom",
        };
      if (name === "sqrt") {
        this.skipSpace();
        let index: MathNode | undefined;
        if (this.source[this.position] === "[") {
          this.position++;
          index = this.sequence(() => this.source[this.position] === "]");
          if (this.source[this.position++] !== "]")
            throw new ScienceParseError("根指數括號未成對");
        }
        return { type: "root", body: this.group(), index };
      }
      if (name === "xrightarrow" || name === "xleftarrow") {
        this.skipSpace();
        let below: MathNode | undefined;
        if (this.source[this.position] === "[") {
          this.position++;
          below = this.sequence(() => this.source[this.position] === "]");
          if (this.source[this.position++] !== "]")
            throw new ScienceParseError("箭號註記括號未成對");
        }
        return {
          type: "annotation",
          body: token(name === "xrightarrow" ? "→" : "←"),
          above: this.group(),
          below,
        };
      }
      if (name === "overset" || name === "underset") {
        const label = this.group();
        return {
          type: "annotation",
          body: this.group(),
          ...(name === "overset" ? { above: label } : { below: label }),
        };
      }
      if (
        [
          "vec",
          "overrightarrow",
          "hat",
          "bar",
          "overline",
          "dot",
          "ddot",
        ].includes(name)
      ) {
        return {
          type: "accent",
          body: this.group(),
          mark: (
            {
              vec: "→",
              overrightarrow: "→",
              hat: "^",
              bar: "¯",
              overline: "¯",
              dot: "˙",
              ddot: "¨",
            } as Record<string, string>
          )[name],
        };
      }
      if (
        ["text", "mathrm", "mathbf", "mathit", "operatorname"].includes(name)
      ) {
        const value = this.rawGroup();
        return {
          type: "token",
          value,
          role: "text",
          variant:
            name === "mathbf"
              ? "bold"
              : name === "mathit"
                ? "italic"
                : "normal",
        };
      }
      if (name === "begin") return this.matrix(this.rawGroup());
      if (name === "left" || name === "right") {
        this.skipSpace();
        if (this.source[this.position] === ".") this.position++;
        return null;
      }
      if (
        name === "," ||
        name === ";" ||
        name === ":" ||
        name === "!" ||
        name === " " ||
        name === "quad" ||
        name === "qquad"
      )
        return token(" ", "text");
      if (["{", "}", "|", "%", "#", "_", "$"].includes(name))
        return token(name);
      if (name === ".") return null;
      if (functionNames.has(name))
        return {
          type: "token",
          value: name,
          role: "identifier",
          variant: "normal",
        };
      if (Object.hasOwn(symbols, name))
        return token(
          symbols[name],
          /[A-Za-zΑ-ωℏℓ]/u.test(symbols[name]) ? "identifier" : "operator",
        );
      throw new ScienceParseError(`不支援的命令 \\${name}`);
    }
    const number = /^\d+(?:\.\d+)?/u.exec(this.source.slice(this.position));
    if (number) {
      this.position += number[0].length;
      return token(number[0], "number");
    }
    let point = String.fromCodePoint(this.source.codePointAt(this.position)!);
    this.position += point.length;
    while (
      this.position < this.source.length &&
      /\p{M}/u.test(this.source[this.position])
    )
      point += this.source[this.position++];
    // Unicode subscripts and superscripts must follow a base, never stand alone.
    if (Object.hasOwn(subDigits, point) || Object.hasOwn(supDigits, point))
      throw new ScienceParseError("上下標缺少底數");
    return token(
      point,
      operatorPattern.test(point)
        ? "operator"
        : /\p{L}/u.test(point)
          ? "identifier"
          : "text",
    );
  }

  private withScripts(base: MathNode): MathNode {
    let sub: MathNode | undefined;
    let sup: MathNode | undefined;
    while (this.position < this.source.length) {
      this.skipSpace();
      const character = this.source[this.position];
      let target: "sub" | "sup" | undefined;
      let value: MathNode;
      if (character === "_" || character === "^") {
        target = character === "_" ? "sub" : "sup";
        this.position++;
        this.skipSpace();
        if (this.source[this.position] === "(") {
          // Common calculator-style a^(b+c), including nested parentheses.
          this.position++;
          let nested = 0;
          value = this.sequence(() => {
            if (this.source[this.position] === "(") nested++;
            else if (this.source[this.position] === ")") {
              if (!nested) return true;
              nested--;
            }
            return false;
          });
          if (this.source[this.position++] !== ")")
            throw new ScienceParseError("上下標括號未成對");
        } else value = this.group();
      } else if (
        Object.hasOwn(subDigits, character) ||
        Object.hasOwn(supDigits, character)
      ) {
        const mapping = Object.hasOwn(subDigits, character)
          ? subDigits
          : supDigits;
        target = mapping === subDigits ? "sub" : "sup";
        let text = "";
        while (Object.hasOwn(mapping, this.source[this.position]))
          text += mapping[this.source[this.position++]];
        value = token(text, /^\d+$/u.test(text) ? "number" : "identifier");
      } else break;
      if (target === "sub") {
        if (sub) throw new ScienceParseError("重複下標");
        sub = value;
      } else {
        if (sup) throw new ScienceParseError("重複上標");
        sup = value;
      }
    }
    return sub || sup ? { type: "scripts", base, sub, sup } : base;
  }

  private matrix(environment: string): MathNode {
    if (!["matrix", "pmatrix", "bmatrix"].includes(environment))
      throw new ScienceParseError("只支援 matrix、pmatrix、bmatrix");
    const rows: MathNode[][] = [];
    let cells: MathNode[] = [];
    const ending = `\\end{${environment}}`;
    while (this.position < this.source.length) {
      const cell = this.sequence(
        () =>
          this.source[this.position] === "&" ||
          this.source.startsWith("\\\\", this.position) ||
          this.source.startsWith("\\end", this.position),
      );
      cells.push(cell);
      if (this.source.startsWith(ending, this.position)) {
        this.position += ending.length;
        rows.push(cells);
        if (
          rows.length > 12 ||
          cells.length > 12 ||
          rows.some((row) => row.length !== rows[0].length)
        )
          throw new ScienceParseError("矩陣需為至多 12 × 12 的長方形");
        return {
          type: "matrix",
          rows,
          brackets:
            environment === "pmatrix"
              ? "()"
              : environment === "bmatrix"
                ? "[]"
                : "",
        };
      }
      if (this.source[this.position] === "&") {
        this.position++;
        continue;
      }
      if (this.source.startsWith("\\\\", this.position)) {
        this.position += 2;
        rows.push(cells);
        cells = [];
        if (rows.length > 12) throw new ScienceParseError("矩陣過大");
        continue;
      }
      throw new ScienceParseError("矩陣結尾不符");
    }
    throw new ScienceParseError("矩陣未結束");
  }
}

export function parseMath(source: string): MathNode {
  if (typeof source !== "string" || source.length > 8192)
    throw new ScienceParseError("公式超過 8192 字元預算");
  const trimmed = source
    .trim()
    .replace(/^\\\((.*)\\\)$/su, "$1")
    .replace(/^\\\[(.*)\\\]$/su, "$1")
    .replace(/^\$\$(.*)\$\$$/su, "$1")
    .replace(/^\$(.*)\$$/su, "$1");
  return new MathParser(trimmed).parse();
}
