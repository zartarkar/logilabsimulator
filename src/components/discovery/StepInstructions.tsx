export function StepInstructions({ step, bn }: { step: number; bn: boolean }) {
  const instructions = step === 0
    ? bn
      ? ["চাইলে সিমুলেশনের পাওয়ার সুইচে চাপ দিয়ে ON/OFF অবস্থায় আলো কেমন হয় দেখো।", "এই লেখার নিচে দুটি ON/OFF জোড়া আছে। যে জোড়ায় মান সঠিক মনে হয়, সেটিতে চাপ দিয়ে উত্তর দাও।"]
      : ["You can tap the power switch in the simulation to see the light turn ON and OFF.", "Below these instructions are two ON/OFF pairs. Tap the pair you think assigns the correct values."]
    : step === 1
      ? bn
        ? ["সিমুলেশনে AND, OR, NOT লেখা বাটন আছে। প্রথমে যেকোনো একটি নামের বাটনে চাপো।", "নামটি বেছে নেওয়ার পর, তার নিচে যে ছবিটি ওই গেটের বলে মনে হয়, সেটিতে চাপো।", "বাকি নামগুলোর জন্যও একই কাজ করো। তিনটি মেলানো হলে ব্যাখ্যা দেখাবে।"]
        : ["In the simulation, first tap one of the buttons labelled AND, OR or NOT.", "Then tap the symbol below that you think belongs to your selected name.", "Repeat for the remaining names. After all three placements, you’ll see the explanation."]
      : bn
        ? ["সার্কিটের বাম দিকের input সংখ্যা ও মাঝখানের গেটের নাম দেখো।", "এই লেখার নিচে ‘0 OFF’ অথবা ‘1 ON’ বাটনে চাপ দিয়ে output বেছে নাও।", "উত্তর দেওয়ার পর তার দিয়ে সিগন্যালের চলা ও সঠিক output দেখো, তারপর ব্যাখ্যা পড়ো।"]
        : ["Read the input values on the left of the circuit and the gate name in the middle.", "Tap ‘0 OFF’ or ‘1 ON’ below these instructions to choose the output.", "After answering, watch the signal travel to the correct output and read the explanation."];
  return <ol className="ll-task-steps" aria-label={bn ? "যেভাবে উত্তর দেবে" : "How to answer"}>
    {instructions.map((instruction, index) => <li key={instruction}><span aria-hidden="true">{index + 1}</span><p>{instruction}</p></li>)}
  </ol>;
}
