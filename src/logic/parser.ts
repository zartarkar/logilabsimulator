import type { AstNode, GateType, ParseError, SyntaxMode, Token } from "./types";
import { tokenize, TokenizeError, splitAssignment } from "./tokenizer";

export class ParseFailure extends Error {
  constructor(public detail: ParseError) {
    super(detail.message);
  }
}

let idCounter = 0;
const nextId = () => `n${++idCounter}`;

const PREC: Record<string, number> = {
  OR: 1,
  NOR: 1,
  XOR: 2,
  XNOR: 2,
  NAND: 2,
  AND: 3,
};

const SYMBOL: Record<GateType, string> = {
  AND: " · ",
  OR: " + ",
  XOR: " ⊕ ",
  XNOR: " ⊙ ",
  NAND: " NAND ",
  NOR: " NOR ",
  NOT: "!",
  BUFFER: "",
};

function wrap(child: AstNode, parentPrec: number): string {
  if (child.kind === "VAR" || child.kind === "CONST" || child.kind === "NOT") return child.expr;
  const p = PREC[child.kind] ?? 4;
  return p < parentPrec ? `(${child.expr})` : child.expr;
}

export function makeOp(kind: GateType, children: AstNode[]): AstNode {
  const prec = PREC[kind] ?? 4;
  let expr: string;
  if (kind === "NOT") expr = `${wrap(children[0]!, 5)}'`;
  else if (kind === "BUFFER") expr = children[0]!.expr;
  else expr = children.map((c) => wrap(c, prec)).join(SYMBOL[kind]);
  return { id: nextId(), kind, children, expr };
}

class Parser {
  private pos = 0;
  constructor(
    private tokens: Token[],
    private offset: number,
  ) {}

  private peek(k = 0): Token {
    return this.tokens[Math.min(this.pos + k, this.tokens.length - 1)]!;
  }
  private next(): Token {
    return this.tokens[this.pos++]!;
  }
  private fail(detail: Omit<ParseError, "position"> & { position?: number }): never {
    throw new ParseFailure({
      position: (detail.position ?? this.peek().start) + this.offset,
      ...detail,
    } as ParseError);
  }

  parse(): AstNode {
    if (this.peek().type === "EOF") {
      this.fail({
        type: "EmptyExpression",
        token: "",
        message: "The expression is empty.",
        suggestion: "Try A + B",
      });
    }
    const node = this.parseBinary(1);
    const t = this.peek();
    if (t.type !== "EOF") {
      if (t.type === "RPAREN") {
        this.fail({
          type: "UnmatchedParenthesis",
          token: ")",
          message: `Unexpected closing parenthesis at position ${t.start + this.offset}.`,
          suggestion: "Remove the extra ')' or add a matching '('.",
        });
      }
      this.fail({
        type: "UnexpectedToken",
        token: t.value,
        message: `Unexpected token "${t.value}" at position ${t.start + this.offset}.`,
      });
    }
    return node;
  }

  private startsOperand(t: Token) {
    return (
      t.type === "VAR" ||
      t.type === "CONST" ||
      t.type === "LPAREN" ||
      t.type === "NOT" ||
      t.type === "NAND" ||
      t.type === "NOR" ||
      t.type === "XNOR"
    );
  }

  private parseBinary(minPrec: number): AstNode {
    let left = this.parseUnary();
    for (;;) {
      const t = this.peek();
      let kind: GateType | null = null;
      let consume = 1;
      if (
        (t.type === "AND" ||
          t.type === "OR" ||
          t.type === "XOR" ||
          t.type === "XNOR" ||
          t.type === "NAND" ||
          t.type === "NOR") &&
        !this.isFunctionCall(t)
      ) {
        kind = t.type as GateType;
      } else if (this.startsOperand(t)) {
        // implicit AND
        kind = "AND";
        consume = 0;
      }
      if (!kind) break;
      const prec = PREC[kind]!;
      if (prec < minPrec) break;
      const opTok = t;
      this.pos += consume;
      if (consume === 1 && !this.startsOperand(this.peek())) {
        this.fail({
          type: "MissingOperand",
          token: opTok.value,
          position: this.peek().start,
          message: `Missing operand after "${opTok.value}" at position ${opTok.start + this.offset}.`,
          suggestion: "Add a variable or a parenthesised expression after the operator.",
        });
      }
      const right = this.parseBinary(prec + 1);
      // flatten associative chains of the same operator
      if (
        (kind === "AND" || kind === "OR" || kind === "XOR") &&
        left.kind === kind &&
        "children" in left
      ) {
        left = makeOp(kind, [...left.children, right]);
      } else {
        left = makeOp(kind, [left, right]);
      }
    }
    return left;
  }

  private isFunctionCall(t: Token) {
    return (
      (t.type === "NAND" || t.type === "NOR" || t.type === "XNOR") &&
      this.peek(1).type === "LPAREN" &&
      this.functionArgs(t)
    );
  }

  /** Lookahead: does NAND( ... , ... ) look like a function call with a comma at depth 1? */
  private functionArgs(t: Token): boolean {
    let depth = 0;
    for (let k = 1; ; k++) {
      const tk = this.tokens[this.pos + k];
      if (!tk || tk.type === "EOF") return false;
      if (tk.type === "LPAREN") depth++;
      else if (tk.type === "RPAREN") {
        depth--;
        if (depth === 0) return false;
      } else if (tk.type === "COMMA" && depth === 1) return true;
    }
  }

  private parseUnary(): AstNode {
    const t = this.peek();
    if (t.type === "NOT") {
      this.next();
      if (!this.startsOperand(this.peek())) {
        this.fail({
          type: "MissingOperand",
          token: t.value,
          message: `NOT operator at position ${t.start + this.offset} has no operand.`,
          suggestion: "Write NOT A or !A",
        });
      }
      return makeOp("NOT", [this.parseUnary()]);
    }
    return this.parsePostfix();
  }

  private parsePostfix(): AstNode {
    let node = this.parsePrimary();
    while (this.peek().type === "POSTFIX_NOT") {
      this.next();
      node = makeOp("NOT", [node]);
    }
    return node;
  }

  private parsePrimary(): AstNode {
    const t = this.peek();
    if (this.isFunctionCall(t)) {
      this.next(); // op
      this.next(); // (
      const args: AstNode[] = [this.parseBinary(1)];
      while (this.peek().type === "COMMA") {
        this.next();
        args.push(this.parseBinary(1));
      }
      this.expectRParen(t);
      let node = makeOp(t.type as GateType, args.slice(0, 2));
      for (let k = 2; k < args.length; k++) node = makeOp(t.type as GateType, [node, args[k]!]);
      return node;
    }
    if (t.type === "VAR") {
      this.next();
      return { id: nextId(), kind: "VAR", name: t.value, expr: t.value };
    }
    if (t.type === "CONST") {
      this.next();
      const v = t.value === "1" ? 1 : 0;
      return { id: nextId(), kind: "CONST", value: v as 0 | 1, expr: String(v) };
    }
    if (t.type === "LPAREN") {
      this.next();
      if (this.peek().type === "RPAREN") {
        this.fail({
          type: "EmptyGroup",
          token: "()",
          message: `Empty parentheses at position ${t.start + this.offset}.`,
          suggestion: "Put an expression inside the parentheses.",
        });
      }
      const inner = this.parseBinary(1);
      this.expectRParen(t);
      return inner;
    }
    if (
      t.type === "AND" ||
      t.type === "OR" ||
      t.type === "XOR" ||
      t.type === "XNOR" ||
      t.type === "NAND" ||
      t.type === "NOR"
    ) {
      this.fail({
        type: "MissingOperand",
        token: t.value,
        message: `Unexpected ${t.type} operator at position ${t.start + this.offset}. An operand is required before it.`,
        suggestion: "Insert a variable before the operator.",
      });
    }
    if (t.type === "POSTFIX_NOT") {
      this.fail({
        type: "InvalidPostfixNot",
        token: "'",
        message: `The apostrophe at position ${t.start + this.offset} has nothing to invert.`,
        suggestion: "Postfix NOT must follow a variable or a group, e.g. A' or (A+B)'.",
      });
    }
    this.fail({
      type: "UnexpectedEnd",
      token: t.value,
      message: `Unexpected end of expression at position ${t.start + this.offset}.`,
      suggestion: "Complete the expression.",
    });
  }

  private expectRParen(open: Token) {
    if (this.peek().type !== "RPAREN") {
      this.fail({
        type: "UnmatchedParenthesis",
        token: "(",
        message: `Missing closing parenthesis for the '(' opened at position ${open.start + this.offset}.`,
        suggestion: "Add a ')' at the end of the group.",
      });
    }
    this.next();
  }
}

export interface ParseResult {
  name: string;
  ast: AstNode;
  variables: string[];
  normalized: string;
}

export function parseExpression(input: string, mode: SyntaxMode): ParseResult {
  const { name, body, offset } = splitAssignment(input);
  let tokens: Token[];
  try {
    tokens = tokenize(body, mode);
  } catch (e) {
    if (e instanceof TokenizeError) {
      throw new ParseFailure({ ...e.detail, position: e.detail.position + offset });
    }
    throw e;
  }
  const ast = new Parser(tokens, offset).parse();
  return { name: name ?? "F", ast, variables: collectVariables(ast), normalized: ast.expr };
}

export function collectVariables(ast: AstNode): string[] {
  const out = new Set<string>();
  const walk = (n: AstNode) => {
    if (n.kind === "VAR") out.add(n.name);
    else if ("children" in n) n.children.forEach(walk);
  };
  walk(ast);
  return [...out].sort();
}
