import { describe, expect, it } from "vitest";
import {
  INTRO_LESSONS,
  QUESTIONS_PER_LESSON,
  checkIntroAnswer,
  makeIntroQuestion,
  suggestFamiliarity,
} from "../logic/introLearning";
import { BOOLEAN_LAWS, gateValue, inputRows, universalNetwork } from "../logic/lessonCurriculum";

describe("guided curriculum", () => {
  it("scores the four-topic assessment at the boundaries", () => {
    expect(INTRO_LESSONS).toHaveLength(4);
    expect([0, 7, 8, 13, 14, 16].map((score) => suggestFamiliarity(score, 16))).toEqual([
      "new",
      "new",
      "some",
      "some",
      "confident",
      "confident",
    ]);
  });
  it("generates valid bilingual questions for every taught step", () => {
    for (let lesson = 0; lesson < 4; lesson++)
      for (let step = 0; step < QUESTIONS_PER_LESSON; step++)
        for (const challenge of [false, true])
          for (let seed = 0; seed < 30; seed++) {
            const q = makeIntroQuestion(lesson, challenge, () => seed / 30, step);
            expect(q.options.filter((o) => o === q.answer)).toHaveLength(1);
            expect(new Set(q.options).size).toBe(q.options.length);
            expect(q.options.length).toBeGreaterThanOrEqual(2);
            for (const lang of ["en", "bn"] as const) {
              expect(q.prompt[lang]).toBeTruthy();
              expect(q.explanation[lang]).toBeTruthy();
            }
            expect(checkIntroAnswer(q, q.answer)).toBe(true);
            expect(checkIntroAnswer(q, " ")).toBe(false);
          }
  });
  it("accepts Bengali digits", () => {
    expect(
      checkIntroAnswer(
        makeIntroQuestion(1, false, () => 0, 0),
        " ৪ ",
      ),
    ).toBe(true);
  });
  it("enumerates every 2/3-variable combination exactly once", () => {
    for (const n of [2, 3]) {
      const rows = inputRows(n);
      expect(rows).toHaveLength(2 ** n);
      expect(new Set(rows.map((r) => r.join(""))).size).toBe(2 ** n);
      expect(rows[0]).toEqual(Array(n).fill(0));
      expect(rows.at(-1)).toEqual(Array(n).fill(1));
    }
  });
  it("proves both De Morgan identities for every input", () => {
    for (const [a, b] of inputRows(2)) {
      expect(Number(!(a! | b!))).toBe((1 - a!) & (1 - b!));
      expect(Number(!(a! & b!))).toBe((1 - a!) | (1 - b!));
    }
  });
  it("verifies every worked simplification for all input combinations", () => {
    for (const [a, b] of inputRows(2)) {
      expect((a! & b!) | (a! & (1 - b!))).toBe(a);
      expect(a! | ((1 - a!) & b!)).toBe(a! | b!);
      expect((a! | b!) & (a! | (1 - b!))).toBe(a);
      expect(Number(!(a! | b!)) | ((1 - a!) & b!)).toBe(1 - a!);
    }
  });
  it("builds XOR and XNOR from only NAND or only NOR, with topologically valid wires", () => {
    for (const family of ["NAND", "NOR"] as const)
      for (const target of ["XOR", "XNOR"] as const)
        for (const [a, b] of inputRows(2)) {
          const steps = universalNetwork(family, target, a!, b!);
          const values: Record<string, number> = { A: a!, B: b! };
          for (const step of steps) {
            expect(step.inputs.every((input) => values[input] !== undefined)).toBe(true);
            expect(step.value).toBe(
              gateValue(family, values[step.inputs[0]!]!, values[step.inputs[1]!]!),
            );
            values[step.name] = step.value;
          }
          expect(steps.at(-1)!.value).toBe(gateValue(target, a!, b!));
          expect(steps).toHaveLength(
            (family === "NAND" && target === "XOR") || (family === "NOR" && target === "XNOR")
              ? 4
              : 5,
          );
        }
  });
  it("includes every requested Boolean law with worked examples", () => {
    expect(BOOLEAN_LAWS.map((l) => l.name)).toEqual([
      "Identity",
      "Complement",
      "Idempotent",
      "Annulment",
      "Commutative",
      "Associative",
      "Distributive",
      "Absorption",
      "De Morgan I",
      "De Morgan II",
    ]);
    for (const law of BOOLEAN_LAWS) expect(law.example).toBeTruthy();
  });
});
