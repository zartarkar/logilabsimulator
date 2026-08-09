export interface ExampleGroup {
  label: string;
  items: { expr: string; note?: string }[];
}

export const EXAMPLES: ExampleGroup[] = [
  {
    label: "Beginner",
    items: [
      { expr: "F = A+B" },
      { expr: "F = AB" },
      { expr: "F = A'" },
      { expr: "F = A+B'" },
      { expr: "F = AB+C" },
    ],
  },
  {
    label: "Intermediate",
    items: [
      { expr: "F = AB+A'C" },
      { expr: "F = XYZ+XY+X'Y'Z" },
      { expr: "F = (A+B)C" },
      { expr: "F = AB+AC+BC" },
      { expr: "F = (A+B)(C+D)" },
      { expr: "F = A XOR B" },
    ],
  },
  {
    label: "Advanced",
    items: [
      { expr: "F = A'BC+AB'C+ABC'" },
      { expr: "F = (A+B')'+C" },
      { expr: "F = (A XOR B)+(C NAND D)" },
      { expr: "F = ((A+B')C)+(D(E+F'))" },
      { expr: "F = ((A+B)(C'+D))+((E XOR F)G')" },
      { expr: "F = ((A+B')'(C XOR D))+((E NAND F)(G NOR H))" },
      {
        expr: "F = (((A+B)(C+D'))+((E XOR F)(G+H')))' + IJK",
        note: "Stress test",
      },
    ],
  },
];
