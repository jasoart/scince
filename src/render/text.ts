export type ScienceTextSegment =
  | { type: "text"; source: string }
  | {
      type: "formula";
      source: string;
      kind: "auto" | "chemistry";
      display: boolean;
    };

/** Recognizes explicit scientific delimiters only; ordinary prose remains plain text. */
export function splitScienceText(input: string): ScienceTextSegment[] {
  const text = input.length > 64_000 ? `${input.slice(0, 64_000)}…` : input;
  const segments: ScienceTextSegment[] = [];
  let position = 0;
  let plainStart = 0;
  let scanBudget = 128_000;
  const escaped = (at: number) => {
    let slashes = 0;
    while (at > 0 && text[--at] === "\\") slashes++;
    return slashes % 2 === 1;
  };
  while (position < text.length && segments.length < 255 && scanBudget > 0) {
    scanBudget--;
    const chemistry = text.startsWith("\\ce{", position) && !escaped(position);
    const block = text.startsWith("$$", position) && !escaped(position);
    const dollar = !block && text[position] === "$" && !escaped(position);
    const parenthesis = text.startsWith("\\(", position) && !escaped(position);
    const square = text.startsWith("\\[", position) && !escaped(position);
    if (!chemistry && !block && !dollar && !parenthesis && !square) {
      position++;
      continue;
    }
    const start = position;
    let source = "";
    let end = -1;
    if (chemistry) {
      let depth = 1;
      let cursor = position + 4;
      for (; cursor < text.length && cursor - start <= 8192; cursor++) {
        if (--scanBudget <= 0) break;
        if (!escaped(cursor)) {
          if (text[cursor] === "{") depth++;
          if (text[cursor] === "}" && --depth === 0) {
            end = cursor + 1;
            break;
          }
        }
      }
      if (end !== -1) source = text.slice(start + 4, end - 1);
    } else {
      const opener = block ? "$$" : dollar ? "$" : parenthesis ? "\\(" : "\\[";
      const closer = block ? "$$" : dollar ? "$" : parenthesis ? "\\)" : "\\]";
      let cursor = start + opener.length;
      while ((cursor = text.indexOf(closer, cursor)) !== -1) {
        if (!escaped(cursor)) {
          end = cursor + closer.length;
          source = text.slice(start + opener.length, cursor);
          break;
        }
        cursor += closer.length;
      }
      // Account for unsuccessful searches too, so malformed prose stays bounded.
      scanBudget -= (end === -1 ? text.length : end) - start;
    }
    if (end === -1 || !source.trim()) {
      position += chemistry ? 4 : block ? 2 : 1;
      continue;
    }
    if (start > plainStart)
      segments.push({ type: "text", source: text.slice(plainStart, start) });
    segments.push({
      type: "formula",
      source,
      kind: chemistry ? "chemistry" : "auto",
      display: block || square,
    });
    plainStart = end;
    position = end;
  }
  if (plainStart < text.length)
    segments.push({ type: "text", source: text.slice(plainStart) });
  return segments;
}
