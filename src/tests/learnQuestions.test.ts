import { describe, expect, it } from "vitest";
import { LEARN_QUESTIONS } from "../logic/learnQuestions";

describe("learning question bank", () => {
  it("provides exactly 30 numbered questions without adder content", () => {
    expect(LEARN_QUESTIONS.map(q => q.id)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
    expect(JSON.stringify(LEARN_QUESTIONS)).not.toMatch(/adder/i);
  });
  it("checks complement calculation answers at the stated bit widths", () => {
    for (const [id, input, width, addOne] of [[19,5,4,0],[20,5,4,1],[23,44,8,0],[24,12,8,1],[25,3,4,1],[26,0,4,1]]) {
      const q = LEARN_QUESTIONS.find(q => q.id === id)!;
      const mask = (1 << width!) - 1;
      const answer = (((input! ^ mask) + addOne!) & mask).toString(2).padStart(width!, "0");
      expect(q.options[q.correctAnswerIndex]?.en).toBe(answer);
    }
  });
  it("has unique questions with valid bilingual answers and explanations", () => {
    expect(new Set(LEARN_QUESTIONS.map(q => q.id)).size).toBe(LEARN_QUESTIONS.length);
    for (const q of LEARN_QUESTIONS) {
      expect(q.options[q.correctAnswerIndex]).toBeDefined();
      for (const lang of ["bn", "en"] as const) {
        expect(q.question[lang].trim().length).toBeGreaterThan(0);
        expect(q.explanation[lang].trim().length).toBeGreaterThan(0);
        expect(new Set(q.options.map(o => o[lang])).size).toBe(q.options.length);
      }
    }
  });
  it("the NAND and NOR constructions implement AND for every input", () => {
    const nand = (a: number, b: number) => Number(!(a && b));
    const nor = (a: number, b: number) => Number(!(a || b));
    for (const a of [0, 1]) for (const b of [0, 1]) {
      const p = nand(a, b);
      expect(nand(p, p)).toBe(a & b);
      expect(nor(nor(a, a), nor(b, b))).toBe(a & b);
    }
    expect(LEARN_QUESTIONS.find(q => q.id === 15)?.correctAnswerIndex).toBe(0);
    expect(LEARN_QUESTIONS.find(q => q.id === 16)?.correctAnswerIndex).toBe(2);
  });
  it("SOP and POS answers match the stated truth tables", () => {
    const inputs = [[0,0],[0,1],[1,0],[1,1]] as const;
    expect(inputs.map(([a,b]) => Number((!a && b) || (a && !b)))).toEqual([0,1,1,0]);
    expect(inputs.map(([a,b]) => Number(a || !b))).toEqual([1,0,1,1]);
    expect(LEARN_QUESTIONS.find(q => q.id === 17)?.correctAnswerIndex).toBe(1);
    expect(LEARN_QUESTIONS.find(q => q.id === 18)?.correctAnswerIndex).toBe(3);
  });
});
