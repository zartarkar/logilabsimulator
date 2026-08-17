# Logic Weaver

Build a Production-Ready Interactive Boolean Logic Circuit Simulator

You are a senior full-stack engineer, digital logic expert, compiler engineer, and UI/UX designer.

Build a complete, polished, production-ready web application that converts Boolean expressions into interactive logic-gate circuit diagrams and simulates them in real time.

The application must work correctly not only for simple expressions, but also for deeply nested, long, and complex Boolean expressions. The generated circuit must always remain logically correct, visually readable, well-spaced, responsive, and easy for students to understand.

Do not build a static mockup. Build a fully functional application.

1. Product Vision

Create an educational Boolean logic visualization platform where a user can:

Enter any valid Boolean expression.

Assign initial binary values to the detected variables.

Generate a complete visual logic-gate circuit automatically.

See actual AND, OR, NOT, XOR, NAND, NOR, XNOR, BUFFER, and constant gates.

Observe signal values passing through every wire and gate.

Change inputs interactively and see the circuit update instantly.

View intermediate calculations and the final output.

Generate a complete truth table.

Simplify the Boolean expression.

Compare the original circuit with the simplified circuit.

See gate count, logic depth, and estimated propagation delay.

Export the circuit as an image or structured project file.

The application should feel like a modern educational version of Logisim or CircuitVerse, but it must be simpler, more visually polished, and optimized for learning.

2. Recommended Technology Stack

Use the following stack unless there is a strong technical reason to change it:

React

TypeScript

Vite

Tailwind CSS

React Flow for the circuit canvas

ELK.js for automatic hierarchical circuit layout

Zustand for application state

Lucide React for interface icons

KaTeX or MathJax for formatted Boolean expressions

Vitest for unit testing

React Testing Library for UI tests

Playwright for end-to-end tests

The application should initially work entirely in the browser without requiring a backend.

Keep the architecture modular so that authentication, cloud storage, classroom management, and user progress tracking can be added later.

3. Core User Workflow

The primary workflow should be:

User enters a Boolean expression.

The application parses and validates the expression.

Variables are automatically detected.

Input controls are generated for every variable.

The user may assign initial values before generating the circuit.

The application builds an Abstract Syntax Tree.

The AST is converted into a normalized circuit graph.

The graph is automatically arranged.

Actual logic-gate shapes are displayed.

The circuit is evaluated.

Every edge and gate displays its current signal.

Changing any input updates the circuit without regenerating the page.

The user may inspect gates, wires, subexpressions, and the truth table.

Example:

Expression:

F = XYZ + XY + X'Y'Z

Initial values:

X = 1

Y = 1

Z = 0

Expected calculation:

XYZ = 0

XY = 1

X'Y'Z = 0

F = 1

The generated visualization must show the NOT, AND, and OR gates, their connections, their current input values, intermediate outputs, and final output.

4. Supported Boolean Syntax

The parser must support multiple common Boolean notations.

Variables

Support:

A

B

X

Y

Z

A1

inputA

Sensor_1

Variable names must begin with a letter or underscore and may contain letters, numbers, and underscores.

Variable names should be case-sensitive.

Constants

Support:

0

1

TRUE

FALSE

NOT operators

Support:

A'

!A

~A

NOT A

¬A

Examples:

A'

(A+B)'

!(A AND B)

¬X

Postfix apostrophe must apply to the immediately preceding variable or grouped expression.

For example:

A' means NOT A

(A+B)' means NOT the entire grouped expression

AND operators

Support:

A.B

A * B

A AND B

A ∧ B

AB as implicit multiplication when unambiguous

A(B+C)

(A+B)(C+D)

Implicit AND must be handled carefully through tokenization. Never split a valid multi-character variable such as inputA into separate letters.

Provide a configurable syntax mode:

Educational Single-Letter Mode

In this mode:

XYZ means X AND Y AND Z.

Named Variable Mode

In this mode:

SensorA means one variable, not S AND e AND n AND s AND o AND r AND A.

The default can be Educational Single-Letter Mode for HSC ICT students, but the interface must clearly show which mode is active.

OR operators

Support:

A+B

A OR B

A ∨ B

A | B

XOR operators

Support:

A XOR B

A ⊕ B

A ^ B

Do not confuse XOR with exponentiation.

NAND operators

Support:

A NAND B

NAND(A,B)

NOR operators

Support:

A NOR B

NOR(A,B)

XNOR operators

Support:

A XNOR B

A ⊙ B

XNOR(A,B)

Operator precedence

Use the following precedence:

Parentheses

Postfix NOT

Prefix NOT

AND

XOR and XNOR

OR, NAND, and NOR according to explicitly documented grammar rules

Prefer requiring parentheses when mixed NAND or NOR expressions could be ambiguous.

Display a helpful ambiguity warning rather than silently interpreting uncertain input.

5. Parser Architecture

Do not evaluate the expression using JavaScript eval or unsafe string replacement.

Implement a proper parsing pipeline:

Input normalization

Tokenization

Syntax validation

Implicit AND insertion

Parsing

AST construction

AST validation

AST optimization

Circuit graph generation

Circuit evaluation

Use either:

A Pratt parser

A recursive descent parser

A shunting-yard algorithm followed by AST construction

The parser must provide precise error information.

Each syntax error should include:

Error type

Character position

Incorrect token

Human-readable explanation

Suggested correction

Example:

Input:

A + (B.C

Error:

Missing closing parenthesis at position 8.

Suggested correction:

A + (B.C)

Another example:

A ++ B

Error:

Unexpected OR operator at position 4. An operand is required between two OR operators.

6. Abstract Syntax Tree

Define strongly typed AST nodes.

Recommended structure:

VariableNode

ConstantNode

NotNode

AndNode

OrNode

XorNode

NandNode

NorNode

XnorNode

BufferNode

Each AST node should contain:

Unique ID

Node type

Child nodes

Original source range

Normalized subexpression

Current evaluated value

Optional display label

Logic depth

Example AST:

OR

├── AND

│ ├── X

│ ├── Y

│ └── Z

├── AND

│ ├── X

│ └── Y

└── AND

├── NOT X

├── NOT Y

└── Z

The AST inspector should be available as an optional developer or advanced-learning panel.

7. Circuit Graph Generation

Convert the AST into a directed acyclic graph.

The graph must contain:

Input nodes

Constant nodes

Gate nodes

Output nodes

Directed signal edges

Each node must have:

Stable unique ID

Gate type

Input ports

Output ports

Current input values

Current output value

Related subexpression

Logic level

Position

Delay value

Each edge must have:

Stable unique ID

Source node

Source port

Target node

Target port

Current signal value

Optional label

Route points

Highlight state

Do not duplicate a variable input node unnecessarily.

For example, if X appears five times, show one primary X input node and fan out its signal to all required gates.

For repeated identical subexpressions, provide two modes:

Expression Tree Mode

Show each occurrence separately so the circuit mirrors the expression structure.

Shared Subexpression Mode

Reuse identical subexpressions to reduce duplicated gates.

Default to Expression Tree Mode for beginner learning and allow Shared Subexpression Mode as an optimization option.

8. Gate Rendering

Use real digital logic-gate shapes, not generic rectangles.

Create custom SVG-based React Flow nodes for:

Input switch

Output LED

AND

OR

NOT

NAND

NOR

XOR

XNOR

BUFFER

Constant 0

Constant 1

Use recognizable ANSI or IEC-style gate shapes.

Every gate should display:

Gate name

Current output value

Optional short subexpression

Input port labels when useful

Active/inactive state

NOT gates must include the inversion bubble.

NAND and NOR gates must include output inversion bubbles.

XNOR gates must visually distinguish themselves from XOR gates.

Input and output ports must connect to the actual gate boundaries.

All gate components must scale cleanly at different zoom levels.

9. Automatic Layout for Complex Expressions

This is one of the most important requirements.

The visualization must remain readable for both simple and complex Boolean expressions.

Use ELK.js or an equivalent hierarchical graph-layout engine.

The default signal direction should be:

Left to right.

Recommended structure:

Input variables on the far left

NOT or preprocessing gates after inputs

Intermediate logic stages in the center

Final combining gate near the right

Output LED on the far right

The layout engine must consider:

Logic depth

Gate dimensions

Number of input ports

Fan-out

Edge crossings

Subexpression groups

Long edges

Parallel branches

Shared variables

Multiple outputs

Implement the following layout strategies:

Hierarchical left-to-right layout

Orthogonal edge routing

Layer-based gate placement

Minimum node separation

Minimum edge separation

Crossing minimization

Fan-out-aware spacing

Parent-child alignment

Subexpression grouping

Automatic fit-to-screen

Never place gates on top of one another.

Never allow wires to pass directly through gate bodies.

Avoid overlapping labels.

Avoid placing too many edges on exactly the same path.

For highly complex circuits, support:

Collapsible subcircuits

Expandable expression groups

Minimap

Zoom

Pan

Fit view

Focus selected branch

Hide inactive branches

Show selected output path

Full-screen canvas

Horizontal and vertical layout options

When the graph is too large, do not shrink everything until it becomes unreadable. Preserve minimum readable gate sizes and allow scrolling, panning, zooming, and group collapsing.

10. Subexpression Grouping

Group major subexpressions visually.

For example:

F = (A+B)(C+D) + E'FG

The circuit should visually distinguish:

Group 1: A+B

Group 2: C+D

Group 3: (A+B)(C+D)

Group 4: E'FG

Final OR stage

Groups may use subtle containers or optional labels.

Clicking a subexpression in the normalized expression should highlight the corresponding gates and wires.

Clicking a circuit branch should highlight the corresponding part of the Boolean expression.

This must work in both directions.

11. Input Value Assignment

After parsing the expression, automatically detect all variables.

Generate one binary input control for every variable.

Each variable control should support:

Toggle switch

Clicking 0 or 1

Keyboard interaction

Randomize inputs

Reset all to 0

Set all to 1

Load a truth-table row

Save an input preset

The user must be able to assign values before circuit generation.

The user must also be able to change values after generation.

Changing any input should update:

Input node

NOT gate output

Intermediate gate outputs

Wire signal values

Final output

Calculation panel

Selected truth-table row

Output LED

Active-path animation

The update should occur immediately without reloading the page.

12. Real-Time Logic Simulation

Build a deterministic digital logic evaluation engine.

Evaluation should occur in topological order.

For every change:

Update the changed input node.

Determine affected downstream nodes.

Recalculate only the affected graph when possible.

Update edge signals.

Update gate outputs.

Update final outputs.

Animate the signal propagation.

Gate behavior:

NOT: invert one input

AND: output 1 only when all inputs are 1

OR: output 1 when at least one input is 1

XOR: output 1 when an odd number of inputs are 1

XNOR: output 1 when an even number of inputs are 1

NAND: inverse of AND

NOR: inverse of OR

BUFFER: same as input

Support gates with more than two inputs.

Provide an optional “two-input physical gate mode” where gates with more than two inputs are decomposed into cascaded two-input gates.

Example:

A.B.C.D

In multi-input mode:

One four-input AND gate.

In two-input mode:

AND(A,B) → T1

AND(T1,C) → T2

AND(T2,D) → Output

Allow the user to choose the implementation style.

13. Signal Visualization

Signals must be visible throughout the circuit.

Use a clear visual distinction:

Logic 1: bright active wire

Logic 0: muted inactive wire

Selected signal: strongly emphasized

Recently changed signal: animated pulse

Error or unresolved signal: warning state

Do not rely only on color. Also display small 0 or 1 labels on wires or near ports for accessibility.

Provide a setting to control:

Always show signal labels

Show labels on hover

Hide signal labels

Animate propagation

Disable animation

When an input changes, animate signal propagation from the changed input through downstream gates toward the output.

The animation should follow logic depth rather than updating every node visually at exactly the same time.

14. Gate Inspection

Clicking a gate should open an inspection panel.

Display:

Gate type

Related subexpression

Input values

Operation

Output value

Logic level

Gate delay

Source gates

Destination gates

Example:

Gate type: AND

Subexpression: X'Y'Z

Inputs: 0, 0, 1

After inversion: 1, 1, 1

Calculation: 1 × 1 × 1

Output: 1

Hovering over a wire should show:

Signal value

Source

Destination

Related subexpression

Signal path

15. Step-by-Step Calculation Panel

Create a clear calculation panel that explains the expression evaluation.

For:

F = XYZ + XY + X'Y'Z

With:

X = 1

Y = 1

Z = 0

Show:

X' = 0

Y' = 0

XYZ = 1 × 1 × 0 = 0

XY = 1 × 1 = 1

X'Y'Z = 0 × 0 × 0 = 0

F = 0 + 1 + 0 = 1

Allow two explanation modes:

Beginner mode

Compact mode

Beginner mode should explain each operation in simple language.

Compact mode should show only the mathematical evaluation.

16. Truth Table Generator

Generate a complete truth table for the detected variables.

For n variables, generate 2^n rows.

Columns should include:

Input variables

Important intermediate subexpressions

Final output

Allow users to:

Sort rows

Filter output 0 or 1

Click any row to load its input values

Highlight the currently active row

Export the truth table as CSV

Copy the table

Hide intermediate columns

Performance requirements:

Generate full tables normally for up to 10 variables.

Warn users before generating very large tables.

For more than 12 variables, use pagination, virtualization, or an explicit confirmation.

Explain that 2^n combinations grow exponentially.

Do not freeze the user interface while generating large tables.

Use a Web Worker when appropriate.

17. Boolean Simplification

Provide an optional simplification engine.

Support:

Boolean algebra rules

Absorption

Idempotent laws

Complement laws

De Morgan’s laws

Consensus theorem where appropriate

Karnaugh-map-based minimization for a limited number of variables

Quine–McCluskey for supported variable counts

Display:

Original expression

Simplified expression

Simplification steps

Original gate count

Simplified gate count

Original logic depth

Simplified logic depth

Estimated delay reduction

Never claim that an expression is simplified unless equivalence has been verified.

Verify equivalence through:

Truth-table comparison for manageable variable counts

Symbolic equivalence checking for larger expressions

Allow the user to view:

Original circuit

Simplified circuit

Side-by-side comparison

Overlay of changed sections

18. Circuit Analysis

Calculate and display:

Number of input variables

Total gate count

Count by gate type

Logic depth

Fan-out

Longest path

Estimated propagation delay

Number of wires

Number of inversions

Shared subexpression savings

Two-input gate equivalent count

Allow configurable delay values.

Example defaults:

NOT: 1 ns

BUFFER: 1 ns

AND: 2 ns

OR: 2 ns

NAND: 2 ns

NOR: 2 ns

XOR: 3 ns

XNOR: 3 ns

Clearly label delay values as educational estimates unless real component data is provided.

Highlight the critical path.

19. Main Interface Layout

Create a clean responsive interface.

Top Header

Include:

Application name

New circuit

Open example

Save project

Export

Settings

Help

Theme switcher

Left Sidebar

Include:

Boolean expression input

Syntax mode

Parse button

Generate circuit button

Simplify button

Example expressions

Validation messages

Main Canvas

Include:

Interactive circuit

Zoom controls

Fit-to-screen

Minimap

Auto-layout

Layout direction

Full-screen mode

Center selected node

Collapse or expand subcircuits

Right Sidebar

Include tabs:

Inputs

Gate inspector

Calculations

Analysis

Settings

Bottom Panel

Include tabs:

Truth table

Normalized expression

Simplification steps

Error messages

AST view

Panels should be resizable and collapsible.

On mobile devices, use drawers or tabs rather than forcing all panels into one screen.

20. Expression Examples

Provide built-in examples arranged by difficulty.

Beginner

A+B

AB

A'

A+B'

AB+C

Intermediate

AB+A'C

(A+B)C

AB+AC+BC

(A+B)(C+D)

A XOR B

Advanced

A'BC+AB'C+ABC'

((A+B')C)+(D(E+F'))

(A XOR B)(C NOR D)+E'

((A+B)(C'+D))+((E XOR F)G')

((A+B')'(C XOR D))+((E NAND F)(G NOR H))

Include at least one long stress-test expression.

21. Complex Expression Handling

The application must be tested with expressions containing:

Deeply nested parentheses

Repeated variables

Repeated subexpressions

More than ten variables

More than fifty AST nodes

Multiple NOT operations

Mixed operator types

Constants

Long fan-out paths

Multiple output functions

Support multiple outputs as an advanced feature.

Example:

F1 = AB + C

F2 = A'B + CD

F3 = F1 XOR F2

Allow outputs to reference previous named outputs only when dependency order is valid and no circular dependency exists.

Detect circular references and display a clear error.

22. Handling Very Large Circuits

When a circuit becomes large:

Preserve correctness.

Preserve minimum readable node size.

Use auto-layout.

Allow zoom and pan.

Use collapsible subcircuits.

Virtualize expensive panels.

Avoid unnecessary React re-renders.

Cache parsed expressions.

Memoize gate components.

Recalculate only affected downstream nodes.

Use Web Workers for large truth tables or simplification tasks.

Display a complexity summary before rendering exceptionally large circuits.

Example:

This expression creates:

42 gates

68 wires

12 logic levels

9 input variables

Offer:

Render full circuit

Render grouped circuit

Render simplified circuit

23. Accessibility

The application must be accessible.

Include:

Full keyboard navigation

ARIA labels

Screen-reader-friendly controls

High-contrast mode

Color-blind-safe signal visualization

Signal value labels in addition to colors

Focus indicators

Adjustable text size

Reduced-motion option

Descriptive gate names

Do not rely exclusively on green and red.

24. Responsive Design

Desktop is the primary environment, but the interface must remain usable on tablets and phones.

For smaller screens:

Use collapsible side drawers

Keep the circuit canvas central

Use touch-friendly controls

Support pinch-to-zoom

Allow horizontal orientation

Keep input toggles easy to access

The circuit must not overflow the viewport without allowing pan or scroll.

25. Visual Design Direction

Use a modern educational laboratory aesthetic.

The application should feel:

Clean

Technical

Calm

Professional

Interactive

Student-friendly

Avoid:

Cartoonish visuals

Excessive gradients

Unnecessary animations

Crowded panels

Tiny text

Generic rectangular gates

Random node placement

Use consistent spacing, typography, shadows, borders, and interaction states.

Support both light mode and dark mode.

Gate shapes, wires, signal labels, input toggles, and output LEDs should remain clear in both themes.

26. Save, Load, and Export

Allow users to save a project locally.

A saved project should include:

Original expression

Normalized expression

Syntax mode

Input values

Layout positions

Simulation settings

Simplification state

User labels

Collapsed groups

Support:

Local storage autosave

Export as JSON

Import from JSON

Export circuit as SVG

Export circuit as PNG

Export truth table as CSV

Print-friendly view

SVG export must preserve gate shapes, wires, labels, and current signal values.

27. Error Handling

Handle errors gracefully.

Examples:

Empty expression

Unsupported symbol

Missing operand

Missing operator

Unmatched parenthesis

Invalid postfix NOT

Conflicting variable syntax

Circular output dependency

Too many truth-table variables

Simplification timeout

Layout failure

Never show a blank screen.

Never silently fail.

Provide a recovery action.

Example:

The layout engine could not arrange the complete circuit.

Actions:

Retry layout

Use compact layout

Use grouped layout

Reset manual positions

28. Testing Requirements

Write comprehensive tests.

Parser Unit Tests

Test:

Every supported operator

Operator precedence

Parentheses

Postfix NOT

Prefix NOT

Implicit AND

Named variables

Single-letter mode

Constants

Invalid syntax

Deep nesting

Whitespace variations

Unicode operators

Logic Evaluation Tests

Test all gate truth tables.

Verify complex expressions against expected outputs.

Graph Generation Tests

Verify:

Correct node count

Correct edge count

Correct gate types

Correct fan-out

Stable IDs

No missing connections

Correct output nodes

Equivalence Tests

Compare:

Original expression evaluation

Generated circuit evaluation

Simplified expression evaluation

All must produce identical results for every tested input combination.

UI Tests

Test:

Input toggles

Circuit updates

Gate inspection

Truth-table row selection

Error display

Theme switching

Layout controls

Export actions

End-to-End Tests

Include complete flows:

Enter expression.

Set initial values.

Generate circuit.

Verify gate outputs.

Change input.

Verify updated output.

Open truth table.

Select row.

Simplify.

Compare circuits.

Export project.

29. Correctness Validation

Circuit correctness is more important than visual decoration.

For every generated circuit:

Evaluate the source AST.

Evaluate the generated graph.

Compare both results.

If simplification is used, evaluate the simplified AST.

Compare outputs for every truth-table row when feasible.

Display an internal validation error if any mismatch occurs.

The application must never knowingly display an incorrect circuit.

Add a development-only validation panel that reports:

AST output

Graph output

Simplified output

Equivalence result

Node count

Edge count

Topological order status

Cycle detection status

30. Suggested Project Architecture

Use a clean modular folder structure.

Example:

src/

├── app/

├── components/

│ ├── circuit/

│ ├── gates/

│ ├── expression/

│ ├── truth-table/

│ ├── inspector/

│ └── layout/

├── parser/

│ ├── tokenizer.ts

│ ├── parser.ts

│ ├── grammar.ts

│ ├── normalizer.ts

│ └── errors.ts

├── ast/

│ ├── types.ts

│ ├── evaluator.ts

│ ├── optimizer.ts

│ └── serializer.ts

├── circuit/

│ ├── graph-builder.ts

│ ├── graph-evaluator.ts

│ ├── topological-sort.ts

│ ├── signal-propagation.ts

│ └── validation.ts

├── layout/

│ ├── elk-layout.ts

│ ├── grouping.ts

│ └── edge-routing.ts

├── simplification/

├── store/

├── hooks/

├── workers/

├── utils/

├── tests/

└── types/

Avoid placing the parser, simulation engine, and UI logic inside one large component.

31. Development Phases

Build the project in controlled phases.

Phase 1: Core Parser and Evaluator

Complete:

Tokenizer

Parser

AST

Input validation

Boolean evaluator

Unit tests

Do not begin advanced visualization until parser tests pass.

Phase 2: Circuit Graph Engine

Complete:

AST-to-graph conversion

Gate nodes

Wires

Topological evaluation

Graph validation

Equivalence tests

Phase 3: Basic Visual Circuit

Complete:

React Flow canvas

Custom gate shapes

Input nodes

Output LEDs

Wire connections

Live input toggles

Phase 4: Advanced Layout

Complete:

ELK.js integration

Hierarchical layers

Orthogonal routing

Crossing reduction

Complex graph handling

Fit-to-screen

Phase 5: Learning Features

Complete:

Gate inspector

Step-by-step calculation

Expression-to-circuit highlighting

Truth table

Example library

Phase 6: Simplification and Analysis

Complete:

Expression simplification

Equivalence verification

Circuit comparison

Gate count

Logic depth

Delay analysis

Phase 7: Export and Polish

Complete:

Save and load

SVG and PNG export

CSV export

Responsive design

Accessibility

Performance optimization

E2E testing

At the end of every phase, run all tests and fix regressions before continuing.

32. Minimum Acceptance Criteria

The project is not complete unless all of the following work:

A user can enter a valid Boolean expression.

Variables are detected automatically.

The user can assign input values before generation.

The generated circuit displays actual logic-gate shapes.

Every gate is connected correctly.

Every wire shows its current signal.

Every gate shows its output.

Input changes update the entire downstream circuit instantly.

Complex expressions are automatically arranged.

Gates and labels do not overlap.

The truth table is correct.

Gate inspection works.

Invalid expressions show useful errors.

Original AST and generated circuit outputs always match.

The application works in light and dark mode.

The application is responsive.

The project includes automated tests.

The application can export the circuit.

No use of unsafe eval.

No major logic is left as placeholder code.

33. Initial Demo Expressions

After implementation, verify the application using all of these:

F = A+B

F = AB

F = A'

F = AB+A'C

F = XYZ+XY+X'Y'Z

F = (A+B)(C+D)

F = (A+B')'+C

F = (A XOR B)+(C NAND D)

F = ((A+B')C)+(D(E+F'))

F = ((A+B)(C'+D))+((E XOR F)G')

F = ((A+B')'(C XOR D))+((E NAND F)(G NOR H))

F = (((A+B)(C+D'))+((E XOR F)(G+H')))' + IJK

For each expression:

Parse it.

Generate the AST.

Generate the circuit.

Auto-layout the circuit.

Test all input combinations when computationally feasible.

Verify AST output equals circuit output.

Confirm no visual overlap.

Confirm interactive input changes work.

34. Deliverables

Provide:

Complete source code

Clear folder structure

README

Installation instructions

Development commands

Production build command

Technical architecture explanation

Supported syntax documentation

Test suite

Example expressions

Known limitations

Future extension plan

The README must explain how to run:

npm install

npm run dev

npm run test

npm run build

35. Important Implementation Rules

Do not use JavaScript eval.

Do not represent gates using plain generic boxes.

Do not hardcode circuits for example expressions.

Do not manually position every gate.

Do not assume all variables are only X, Y, and Z.

Do not limit expressions to three variables.

Do not update only the final output; update every intermediate gate.

Do not generate a visually incorrect circuit even when the final numerical output is correct.

Do not simplify expressions without equivalence verification.

Do not hide parser errors.

Do not sacrifice readability for fitting everything into one screen.

Do not leave placeholder functions for core features.

Do not mix parsing, simulation, and visualization into one monolithic file.

Do not proceed to advanced features before the core evaluator and graph validation tests pass.

Final Instruction

Start by designing the architecture and defining the TypeScript types for tokens, AST nodes, circuit nodes, circuit edges, simulation state, parser errors, and layout settings.

Then implement the application phase by phase.

For each phase:

Explain what is being implemented.

Create the required files.

Provide complete code, not partial snippets.

Run or describe the relevant tests.

Fix identified errors before proceeding.

Preserve all previously working functionality.

Prioritize, in this order:

Logical correctness

Parser reliability

Circuit equivalence

Visual readability

Interactive simulation

Performance

Educational clarity

Visual polish

The final result must be a genuinely working Boolean logic circuit simulator capable of turning complex Boolean expressions into accurate, beautiful, readable, and interactive gate-level visualizations. The user must be able to assign binary values to every detected variable both before and after circuit generation. Input values must be controlled through visible 0/1 toggle switches. Changing any variable must instantly recalculate and visually update every affected gate, wire, intermediate result, and final output without rebuilding or reloading the circuit. in the segment of built your own circuit, while pressing the gates in the side bar, it will pop up in the screen, along with that ,user should be able to cut/remove the gate as well. like it should not restart all over again for wrong gate selection. the app should include all gates.if the circuit/output is 0 is should show off,if 1 then show on

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://logilabsimulator.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/689d4b96-c74b-42e2-827a-35111fb374ef).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
