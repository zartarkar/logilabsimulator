import { describe, expect, it } from "vitest";
import {
  assess,
  initialKnowledge,
  GATES,
  gateCopy,
  type Knowledge,
} from "../components/discovery/model";
describe("landing discovery assessment", () => {
  const clear: Knowledge = {
    binaryUnderstanding: true,
    recognizeAND: true,
    recognizeOR: true,
    recognizeNOT: true,
    behaviorAND: true,
    behaviorOR: true,
    behaviorNOT: true,
  };
  it("uses all seven signals and keeps unassessed values distinct", () => {
    expect(assess(initialKnowledge)).toMatchObject({
      complete: false,
      score: 0,
      destination: "concepts",
    });
    expect(assess(clear)).toMatchObject({
      complete: true,
      score: 7,
      familiarity: "confident",
      destination: "simulator",
    });
  });
  it("keeps binary gaps in concepts even with otherwise correct answers", () => {
    expect(assess({ ...clear, binaryUnderstanding: false }).destination).toBe("concepts");
  });
  it("allows an isolated behavior gap after its visual recap", () => {
    for (const gate of GATES)
      expect(assess({ ...clear, [`behavior${gate}`]: false })).toMatchObject({
        score: 6,
        destination: "simulator",
      });
  });
  it("requires concepts for multiple gaps and never recommends builder first", () => {
    const keys = Object.keys(clear) as (keyof Knowledge)[];
    for (let mask = 0; mask < 128; mask++) {
      const signals = Object.fromEntries(
        keys.map((key, i) => [key, Boolean(mask & (1 << i))]),
      ) as Knowledge;
      const result = assess(signals);
      expect(result.complete).toBe(true);
      expect(result.destination).not.toBe("builder");
      if (result.destination === "simulator") {
        expect(signals.binaryUnderstanding).toBe(true);
        expect(result.score).toBeGreaterThanOrEqual(6);
      }
    }
  });
  it("explains the tested circuit with a matching truth-table row", () => {
    for (const gate of GATES) {
      const info = gateCopy[gate];
      const row = info.rows.find((values) => values.slice(0, -1).join() === info.inputs.join());
      expect(row?.at(-1)).toBe(info.output);
    }
  });
});
