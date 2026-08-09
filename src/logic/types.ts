// Core type definitions for the Boolean logic simulator.

export type SyntaxMode = "single-letter" | "named";

export type TokenType =
  | "VAR"
  | "CONST"
  | "AND"
  | "OR"
  | "XOR"
  | "XNOR"
  | "NAND"
  | "NOR"
  | "NOT"
  | "POSTFIX_NOT"
  | "LPAREN"
  | "RPAREN"
  | "COMMA"
  | "EOF";

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
}

export interface ParseError {
  type: string;
  position: number;
  token: string;
  message: string;
  suggestion?: string;
}

export type GateType =
  | "AND"
  | "OR"
  | "NOT"
  | "XOR"
  | "XNOR"
  | "NAND"
  | "NOR"
  | "BUFFER";

export type AstNode =
  | { id: string; kind: "VAR"; name: string; expr: string }
  | { id: string; kind: "CONST"; value: 0 | 1; expr: string }
  | { id: string; kind: GateType; children: AstNode[]; expr: string };

export type CircuitNodeType =
  | "INPUT"
  | "OUTPUT"
  | "CONST0"
  | "CONST1"
  | GateType;

export interface CircuitNode {
  id: string;
  type: CircuitNodeType;
  label: string;
  expr: string;
  inputs: string[]; // source node ids, in port order
  level: number;
  delay: number;
  x: number;
  y: number;
  value: 0 | 1;
}

export interface CircuitEdge {
  id: string;
  source: string;
  target: string;
  targetPort: number;
  value: 0 | 1;
}

export interface CircuitGraph {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  variables: string[];
  outputId: string;
}

export interface BuildOptions {
  twoInputMode: boolean;
  shareSubexpressions: boolean;
}

export const GATE_DELAYS: Record<string, number> = {
  NOT: 1,
  BUFFER: 1,
  AND: 2,
  OR: 2,
  NAND: 2,
  NOR: 2,
  XOR: 3,
  XNOR: 3,
  INPUT: 0,
  OUTPUT: 0,
  CONST0: 0,
  CONST1: 0,
};
