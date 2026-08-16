import type { Token, SyntaxMode, ParseError } from "./types";

export class TokenizeError extends Error {
  constructor(public detail: ParseError) {
    super(detail.message);
  }
}

const WORD_OPS: Record<string, Token["type"]> = {
  AND: "AND",
  OR: "OR",
  XOR: "XOR",
  XNOR: "XNOR",
  NAND: "NAND",
  NOR: "NOR",
  NOT: "NOT",
};

const CONSTS: Record<string, string> = {
  TRUE: "1",
  FALSE: "0",
};

function isLetter(c: string) {
  return /[A-Za-z_]/.test(c);
}
function isWordChar(c: string) {
  return /[A-Za-z0-9_]/.test(c);
}

/** Strips an optional "F =" style assignment prefix. Returns [name, body, offset]. */
export function splitAssignment(input: string): {
  name: string | null;
  body: string;
  offset: number;
} {
  const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(?!=)\s*/.exec(input);
  if (m) return { name: m[1]!, body: input.slice(m[0].length), offset: m[0].length };
  return { name: null, body: input, offset: 0 };
}

export function tokenize(source: string, mode: SyntaxMode): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const push = (type: Token["type"], value: string, start: number, end: number) =>
    tokens.push({ type, value, start, end });

  while (i < source.length) {
    const c = source[i]!;
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const start = i;
    // Unicode / symbol operators
    switch (c) {
      case "(":
        push("LPAREN", c, start, i + 1);
        i++;
        continue;
      case ")":
        push("RPAREN", c, start, i + 1);
        i++;
        continue;
      case ",":
        push("COMMA", c, start, i + 1);
        i++;
        continue;
      case "'":
      case "\u2019":
        push("POSTFIX_NOT", "'", start, i + 1);
        i++;
        continue;
      case "!":
      case "~":
      case "\u00ac":
      case "\u0305": // Combining Overline
        push("NOT", c, start, i + 1);
        i++;
        continue;
      case "\u2014": // Em dash often used as overline in some fonts
      case "\u2013": // En dash
      case "\u00af": // Macron
        push("NOT", c, start, i + 1);
        i++;
        continue;
      case ".":
      case "*":
      case "\u2227":
      case "&":
        push("AND", c, start, i + 1);
        i++;
        continue;
      case "+":
      case "|":
      case "\u2228":
        push("OR", c, start, i + 1);
        i++;
        continue;
      case "^":
      case "\u2295":
        push("XOR", c, start, i + 1);
        i++;
        continue;
      case "\u2299":
        push("XNOR", c, start, i + 1);
        i++;
        continue;
      case "0":
      case "1":
        push("CONST", c, start, i + 1);
        i++;
        continue;
    }

    if (isLetter(c)) {
      let j = i;
      while (j < source.length && isWordChar(source[j]!)) j++;
      const word = source.slice(i, j);
      const upper = word.toUpperCase();
      if (WORD_OPS[upper]) {
        // Handle common OCR errors or variations in Boolean notation
        push(WORD_OPS[upper]!, upper, i, j);
        i = j;
        continue;
      }
      if (CONSTS[upper] !== undefined) {
        push("CONST", CONSTS[upper]!, i, j);
        i = j;
        continue;
      }
      if (mode === "single-letter") {
        // Split "XYZ" into separate variables (implicit AND handled by parser).
        // Digits attach to the preceding letter: A1B -> A1, B
        let k = i;
        while (k < j) {
          let m = k + 1;
          while (m < j && /[0-9_]/.test(source[m]!)) m++;
          push("VAR", source.slice(k, m), k, m);
          k = m;
        }
        i = j;
        continue;
      }
      push("VAR", word, i, j);
      i = j;
      continue;
    }

    if (/[0-9]/.test(c)) {
      throw new TokenizeError({
        type: "InvalidConstant",
        position: i,
        token: c,
        message: `Unsupported numeric literal "${c}" at position ${i}. Only 0 and 1 are valid.`,
        suggestion: "Use 0 or 1 (or TRUE / FALSE).",
      });
    }

    throw new TokenizeError({
      type: "UnsupportedSymbol",
      position: i,
      token: c,
      message: `Unsupported symbol "${c}" at position ${i}.`,
      suggestion: "Allowed operators: ' ! ~ ¬ . * & + | ∨ ^ ⊕ ⊙ ( ) and the words AND OR NOT XOR NAND NOR XNOR.",
    });
  }
  tokens.push({ type: "EOF", value: "", start: source.length, end: source.length });
  return tokens;
}
