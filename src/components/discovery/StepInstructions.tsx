export function StepInstructions({ step, bn }: { step: number; bn: boolean }) {
  const instructions =
    step === 0
      ? bn
        ? [
            "সুইচে চাপ দিয়ে ON ও OFF অবস্থা দেখো।",
            "নিচের দুটি অপশন থেকে ON/OFF এর সঠিক মান নির্বাচন করো।",
          ]
        : [
            "Tap the switch to observe ON and OFF.",
            "Select the pair below with the correct ON/OFF values.",
          ]
      : step === 1
        ? bn
          ? [
              "প্রথমে AND, OR বা NOT নাম নির্বাচন করো। এরপর নিচে সংশ্লিষ্ট গেটের প্রতীকে চাপো।",
              "বাকি দুটি নামও একইভাবে মেলাও।",
            ]
          : [
              "Select AND, OR or NOT in the simulation.",
              "Tap the shape that matches the selected name.",
              "Repeat for the two remaining names.",
            ]
        : bn
          ? [
              "সার্কিটের input মান ও গেটের নাম দেখো।",
              "নিচে ‘0 OFF’ অথবা ‘1 ON’ নির্বাচন করে output নির্ধারণ করো।",
            ]
          : [
              "Read the circuit’s input values and gate name.",
              "Select ‘0 OFF’ or ‘1 ON’ below to set the output.",
            ];
  return <p className="ll-task-instructions">{instructions.join(" ")}</p>;
}
