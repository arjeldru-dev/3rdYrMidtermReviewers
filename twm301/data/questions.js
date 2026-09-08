/**
 * TWM 301 Question Bank
 * Course: Technical Writing in Mathematics Using LaTeX
 * Academic References:
 * - Leslie Lamport, "LaTeX: A Document Preparation System" (Addison-Wesley)
 * - George Grätzer, "More Math Into LaTeX" (Springer)
 * - Nicholas J. Higham, "Handbook of Writing for the Mathematical Sciences" (SIAM)
 * 
 * Total Items: 112 questions across 7 core syllabus modules.
 */

const QUESTIONS = [
  {
    "id": 1,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Easy",
    "question": "What is the primary distinction between mathematical technical writing and creative writing?",
    "choices": {
      "a": "Technical writing relies heavily on figurative expressions, narrative tension, and emotional voice.",
      "b": "Technical writing focuses on clarity, precision, and usability to help readers verify, reproduce, or apply specialized mathematical ideas.",
      "c": "Creative writing requires strict adherence to formal axiomatic definitions and symbolic notation.",
      "d": "Technical writing eliminates all natural language in favor of pure, uninterrupted symbolic derivations."
    },
    "answer": "b",
    "explanation": "As established in Chapter 1, technical writing communicates specialized information to a defined audience for practical or intellectual purposes (usability, verification, decision-making). Creative writing focuses on personal expression, imagination, and narrative voice."
  },
  {
    "id": 2,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Easy",
    "question": "Which trio constitutes the three fundamental pillars of mathematical technical style?",
    "choices": {
      "a": "Brevity, Complexity, and Abstraction",
      "b": "Clarity, Precision, and Consistency",
      "c": "Persuasion, Eloquence, and Elegance",
      "d": "Formalism, Brevity, and Generalization"
    },
    "answer": "b",
    "explanation": "The core foundational pillars of mathematical technical writing are Clarity (readers can follow reasoning without undue effort), Precision (statements have exact, unambiguous meanings), and Consistency (terminology, notation, and formatting remain uniform throughout)."
  },
  {
    "id": 3,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Easy",
    "question": "In mathematical prose, what is the primary role of audience awareness?",
    "choices": {
      "a": "Ensuring the document contains maximum technical jargon to impress senior scholars.",
      "b": "Adapting notation, background depth, explanatory detail, and examples to the background and needs of the intended reader.",
      "c": "Eliminating all proofs so that any layperson can read the document without mathematical training.",
      "d": "Guaranteeing that the identical text can serve elementary students, applied engineers, and pure algebraists simultaneously without alteration."
    },
    "answer": "b",
    "explanation": "Audience awareness means identifying who will read the document and tailoring the notation, prerequisites, level of detail, and explanations accordingly. A paper written for an abstract algebra seminar requires very different scaffolding than a report written for applied industry clients."
  },
  {
    "id": 4,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Easy",
    "question": "Consider the statements $\\forall x \\in \\mathbb{R},\\, \\exists y \\in \\mathbb{R} \\text{ such that } y > x$ and $\\exists y \\in \\mathbb{R} \\text{ such that } \\forall x \\in \\mathbb{R},\\, y > x$. What does this comparison illustrate regarding quantifier precision?",
    "choices": {
      "a": "Quantifiers commute freely without altering the logical truth value of mathematical statements.",
      "b": "The first statement is true (no maximum real number), whereas the second statement is false (asserts the existence of a real number strictly greater than all real numbers).",
      "c": "Both statements are logically false in the real field $\\mathbb{R}$.",
      "d": "The two statements are logically equivalent by the duality principle."
    },
    "answer": "b",
    "explanation": "Quantifier order is critical for precision. $\\forall x \\, \\exists y (y > x)$ states that for every real number there is a strictly larger one (true). In contrast, $\\exists y \\, \\forall x (y > x)$ asserts a single real number strictly greater than all real numbers, which is false in $\\mathbb{R}$."
  },
  {
    "id": 5,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Easy",
    "question": "How should punctuation be handled when a mathematical sentence terminates with a displayed equation?",
    "choices": {
      "a": "Punctuation should be completely omitted around displayed equations to prevent confusing mathematical notation with syntax.",
      "b": "The displayed equation must be treated as an integral grammatical part of the sentence, ending with a period or comma as appropriate.",
      "c": "A semicolon must precede every display equation, and a period must appear on the next text line.",
      "d": "Punctuation should only be placed if the equation contains an inequality."
    },
    "answer": "b",
    "explanation": "Displayed formulas are grammatically integrated into the enclosing prose. If the sentence concludes with the displayed formula, a period must terminate the display. If the sentence continues with explanatory clauses (such as 'where $a \\neq 0$'), a comma is placed at the end of the formula."
  },
  {
    "id": 6,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Easy",
    "question": "What is the standard ethical principle regarding claims of computational or algorithmic efficiency in technical mathematics?",
    "choices": {
      "a": "Authors may claim an algorithm is globally optimal as long as it works on at least three test cases.",
      "b": "Authors must state conclusions honestly, distinguishing empirical benchmarks ($n \\le 1000$) from rigorous theoretical guarantees across all inputs.",
      "c": "Theoretical guarantees should always be withheld to protect commercial intellectual property.",
      "d": "Empirical simulation results are legally equivalent to formal mathematical proofs."
    },
    "answer": "b",
    "explanation": "Ethical accuracy and transparency demand that writers never overstate conclusions. If an algorithm was tested on inputs up to $n = 1000$, one must state that efficiency was observed empirically for $n \\le 1000$, rather than asserting global asymptotic efficiency without proof."
  },
  {
    "id": 7,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Medium",
    "question": "Why should phrases like 'clearly', 'obviously', and 'it is easy to see' be used with extreme caution in mathematical writing?",
    "choices": {
      "a": "They are banned outright by all international mathematical publishing houses.",
      "b": "They frequently conceal unverified deductive leaps, condescend to struggling readers, and substitute rhetorical confidence for proof.",
      "c": "They automatically trigger compilation syntax errors in modern LaTeX engines.",
      "d": "They force the compiler to skip theorem verification checks."
    },
    "answer": "b",
    "explanation": "As emphasized in Chapter 1 of the lecture notes, 'clearly' and 'obviously' often mask missing steps or unsubstantiated leaps in logic. If a deduction is genuinely immediate, the brief reason (e.g., 'by the triangle inequality') takes fewer words and provides actual assistance."
  },
  {
    "id": 8,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Medium",
    "question": "Evaluate the student draft: 'The function $f(x) = \\frac{1}{x}$ is continuous.' What precision defect exists here?",
    "choices": {
      "a": "The statement uses fractional notation instead of negative powers.",
      "b": "The domain of $f$ is unspecified; $f(x) = 1/x$ cannot be defined on $\\mathbb{R}$ because division by zero is undefined, and continuity requires an explicit domain such as $(0, \\infty)$ or $\\mathbb{R} \\setminus \\{0\\}$.",
      "c": "Continuous functions cannot have rational polynomial fractions.",
      "d": "The variable $x$ must be capitalized when functioning as an independent argument."
    },
    "answer": "b",
    "explanation": "A frequent source of mathematical imprecision is omitted domains. Stating '$f(x) = 1/x$ is continuous' without specifying the domain is incomplete and ambiguous, because $f$ is undefined at $x = 0$. A precise statement must specify $f : (0, \\infty) \\to \\mathbb{R}$ or $f : \\mathbb{R} \\setminus \\{0\\} \\to \\mathbb{R}$."
  },
  {
    "id": 9,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Medium",
    "question": "What is the standard convention regarding the authorial pronoun 'we' in mathematical technical writing?",
    "choices": {
      "a": "It is strictly forbidden; all mathematical proofs must be written exclusively in the passive voice.",
      "b": "It represents authorial modesty and invites the reader to join the writer in a shared journey of logical exploration (e.g., 'We now compute...').",
      "c": "It indicates that at least two human authors must have co-authored the manuscript.",
      "d": "It refers exclusively to the academic department hosting the research."
    },
    "answer": "b",
    "explanation": "In mathematics, the first-person plural 'we' is the standard pedagogical and technical convention. It does not imply multiple authors; rather, it invites the reader to walk through the definitions and deductions alongside the author."
  },
  {
    "id": 10,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Medium",
    "question": "Why is a bare calculation such as '$2x + 3 = 11 \\implies 2x = 8 \\implies x = 4$' considered an incomplete technical solution write-up?",
    "choices": {
      "a": "Implication signs cannot be chained together under Peano arithmetic.",
      "b": "It lacks reader guidance, does not declare hypotheses, fails to explain the justification of operations, and omits verification or context.",
      "c": "Linear equations must always be solved using matrix inversion in LaTeX.",
      "d": "The solution lacks an author attribution citation."
    },
    "answer": "b",
    "explanation": "As shown in Example 1.2 and Section 5.2 of the course text, a mere string of algebraic operations is not a technical write-up. A proper technical document explains the goal, describes the operations performed on both sides, and confirms the solution by back-substitution."
  },
  {
    "id": 11,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Medium",
    "question": "Which of the following demonstrates proper mathematical precision regarding equality and approximation symbols?",
    "choices": {
      "a": "$\\pi = 3.14159 = \\frac{22}{7}$",
      "b": "$\\pi \\approx 3.14159$, whereas $\\pi \\neq \\frac{22}{7}$ as $\\frac{22}{7}$ is merely a rational approximation",
      "c": "$\\pi \\equiv 3.14159 \\iff \\pi = \\frac{22}{7}$",
      "d": "$\\pi \\approx 3.14159 = \\mathbb{R}$"
    },
    "answer": "b",
    "explanation": "Casual substitution of '=' for '$\\approx$' is a major source of imprecision. $\\pi$ is irrational; writing $\\pi = 3.14$ or $\\pi = 22/7$ is mathematically false. Writing $\\pi \\approx 3.14159$ correctly communicates numerical approximation."
  },
  {
    "id": 12,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Medium",
    "question": "When writing a mathematical report for an applied interdisciplinary team (e.g., biological modelers or urban planners), which element is essential?",
    "choices": {
      "a": "Omitting all variable definitions to keep the paper concise.",
      "b": "Defining all variables, specifying dimensional physical units (e.g., days, persons, mg/L), stating modeling assumptions, and interpreting results in real-world terms.",
      "c": "Translating every equation into abstract category-theoretic commutative diagrams.",
      "d": "Using single-letter Greek notation without any verbal glossary or narrative text."
    },
    "answer": "b",
    "explanation": "In applied contexts, mathematical equations represent concrete phenomena. The writer must explicitly specify what each variable represents, provide units of measurement, detail parameter bounds, and translate numerical conclusions into actionable real-world insights."
  },
  {
    "id": 13,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Medium",
    "question": "Which of the following is a key requirement of a well-formed mathematical definition?",
    "choices": {
      "a": "It must use circular references to show self-consistency.",
      "b": "It must identify the genus (the mathematical category to which the object belongs) and the specific difference (the exact conditions separating it from others).",
      "c": "It must always contain a formal inductive proof of its existence.",
      "d": "It should avoid formal mathematical notation in favor of metaphorical descriptions."
    },
    "answer": "b",
    "explanation": "A rigorous mathematical definition establishes the broader category (e.g., 'A sequence $(a_n)$ of real numbers...') followed by the necessary and sufficient conditions that uniquely characterize the concept (e.g., '...is bounded if there exists $M > 0$ such that $|a_n| \\le M$ for all $n$')."
  },
  {
    "id": 14,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Hard",
    "question": "Identify the critical flaw in the proof transition: 'Assume $n$ is an integer. Then $n^2$ is an even integer, so $n = 2k$, which proves the claim.'",
    "choices": {
      "a": "The author assumes the conclusion ($n^2$ even) and deduces the hypothesis ($n = 2k$), committing the logical fallacy of affirming the consequent or begging the question.",
      "b": "The variable $k$ is not specified as a complex number.",
      "c": "The letter $n$ cannot represent both odd and even integers simultaneously.",
      "d": "LaTeX cannot compile the equality $n = 2k$ without the `amsmath` package."
    },
    "answer": "a",
    "explanation": "The claim being proven is typically 'If $n$ is even, then $n^2$ is even'. In this flawed snippet, the writer assumes $n^2$ is even and immediately writes $n = 2k$ (which is the definition of $n$ being even), circularizing the argument and reversing the logical implication."
  },
  {
    "id": 15,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Hard",
    "question": "In proving that the sum of two odd integers $m$ and $n$ is even, a student writes: '$m+n = (2a+1) + (2b+1) = 2(a+b+1)$. Since $a+b+1 \\in \\mathbb{Z}$, $m+n$ is even.' Why is stating '$a+b+1 \\in \\mathbb{Z}$' a necessary step in rigorous technical style?",
    "choices": {
      "a": "Because LaTeX requires explicit typecasting before evaluating integer addition.",
      "b": "Because the formal definition of an even integer requires expressing the number as $2k$ for some integer $k$; without verifying that $a+b+1$ is an integer (via ring closure of $\\mathbb{Z}$), the definition is unsatisfied.",
      "c": "Because $a$ and $b$ could otherwise default to imaginary unit vectors.",
      "d": "Because the commutative property does not hold for integers."
    },
    "answer": "b",
    "explanation": "By definition, an integer $x$ is even if and only if $x = 2k$ for some $k \\in \\mathbb{Z}$. Factoring a 2 out of an algebraic expression does not prove evenness unless the remaining factor is explicitly verified to be an integer (by the closure of $\\mathbb{Z}$ under addition)."
  },
  {
    "id": 16,
    "topic": "Foundational Technical Writing Style & Ethics",
    "difficulty": "Hard",
    "question": "A student paper claims: 'The experimental algorithm converged in under 0.05 seconds for all 50 randomly generated 100-node graphs, proving that the algorithm has polynomial-time worst-case complexity.' What ethical and logical error was committed?",
    "choices": {
      "a": "Plagiarism of the graph generator algorithm.",
      "b": "Confusing empirical benchmark performance on a finite random sample with an analytical worst-case asymptotic upper bound ($O(n^k)$).",
      "c": "Using seconds instead of milliseconds as the SI unit of computation.",
      "d": "Failing to submit the LaTeX `.aux` file with the research manuscript."
    },
    "answer": "b",
    "explanation": "Empirical execution times on specific sample inputs cannot establish worst-case theoretical complexity. Conflating experimental observation with mathematical proof violates the ethical standard of accuracy and overstates what the evidence actually proves."
  },
  {
    "id": 17,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Easy",
    "question": "Who created TeX, and who created LaTeX as a macro package built on top of TeX?",
    "choices": {
      "a": "Donald Knuth created TeX; Leslie Lamport created LaTeX.",
      "b": "Leslie Lamport created TeX; Donald Knuth created LaTeX.",
      "c": "Linus Torvalds created TeX; Richard Stallman created LaTeX.",
      "d": "Dennis Ritchie created TeX; Bjarne Stroustrup created LaTeX."
    },
    "answer": "a",
    "explanation": "Donald Knuth designed the low-level typesetting engine TeX in 1978. In the early 1980s, Leslie Lamport developed LaTeX, providing high-level macro abstractions for document structuring, cross-referencing, and styling."
  },
  {
    "id": 18,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Easy",
    "question": "Which of the following represents a comprehensive, multi-platform TeX distribution maintained by the TeX Users Group (TUG)?",
    "choices": {
      "a": "TeX Live",
      "b": "TeXstudio",
      "c": "Overleaf",
      "d": "Ghostscript"
    },
    "answer": "a",
    "explanation": "TeX Live is the comprehensive, cross-platform TeX distribution maintained by TUG for Linux, Unix, Windows, and macOS (where it is packaged as MacTeX). TeXstudio is an editor (IDE), and Overleaf is a cloud service."
  },
  {
    "id": 19,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Easy",
    "question": "What is the primary output file generated when compiling a `.tex` document with modern `pdflatex`?",
    "choices": {
      "a": "`.dvi`",
      "b": "`.pdf`",
      "c": "`.docx`",
      "d": "`.html`"
    },
    "answer": "b",
    "explanation": "Unlike original legacy TeX (which produced device-independent `.dvi` files), the modern `pdflatex` engine directly compiles `.tex` source files into Portable Document Format (`.pdf`) files."
  },
  {
    "id": 20,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Easy",
    "question": "What is the primary function of the `.log` file generated during LaTeX compilation?",
    "choices": {
      "a": "Storing user login credentials for Overleaf.",
      "b": "Recording a detailed chronological transcript of the compilation run, including package loading, font selections, warnings, and error messages.",
      "c": "Storing the compiled vector graphics and math fonts.",
      "d": "Keeping an immutable version-control history of document edits."
    },
    "answer": "b",
    "explanation": "The `.log` file is the diagnostic transcript created by the compiler. It records exactly which files and packages were read, line numbers where errors occurred, overfull/underfull box warnings, and font allocations."
  },
  {
    "id": 21,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Easy",
    "question": "What is the role of the auxiliary file (`.aux`) created during a LaTeX build cycle?",
    "choices": {
      "a": "It stores cached audio transcriptions of lecture notes.",
      "b": "It holds metadata regarding section numbers, equation labels, citations, and page references across compilation passes.",
      "c": "It acts as an uncompressed backup copy of the author's `.tex` source.",
      "d": "It contains executable shell scripts for the operating system."
    },
    "answer": "b",
    "explanation": "LaTeX relies on the `.aux` file to pass information between compilation passes. When a `\\label` is encountered on pass 1, its number and page are written to `.aux`. On pass 2, `\\ref` reads from `.aux` to display the resolved number."
  },
  {
    "id": 22,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Easy",
    "question": "Which LaTeX compiler engine natively supports modern OpenType/TrueType system fonts and direct UTF-8 Unicode encoding without extra font packages?",
    "choices": {
      "a": "Original TeX82",
      "b": "XeLaTeX",
      "c": "DVItoPS",
      "d": "BibTeX"
    },
    "answer": "b",
    "explanation": "Both XeLaTeX and LuaLaTeX natively support system fonts (OpenType and TrueType) via the `fontspec` package and use UTF-8 Unicode encoding by default, unlike traditional `pdflatex` which requires 8-bit font encodings."
  },
  {
    "id": 23,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Medium",
    "question": "Why does a LaTeX document containing newly added `\\label` and `\\ref` commands often display '??' in the compiled PDF after the first build?",
    "choices": {
      "a": "The LaTeX distribution lacks the mathematical font symbols for questions marks.",
      "b": "LaTeX resolves cross-references through a two-pass mechanism: the first pass records labels into the `.aux` file, and a second pass reads the `.aux` file to populate references.",
      "c": "The author forgot to load the `amsmath` package in the preamble.",
      "d": "The PDF viewer cannot render hyperlinks without an active internet connection."
    },
    "answer": "b",
    "explanation": "LaTeX works as a single-pass stream processor per compile run. During Pass 1, when LaTeX encounters `\\ref{sec:methods}`, the label has not yet been processed or written to `.aux`. It outputs '??' and writes the definition into `.aux` when reaching the `\\label`. A second run resolves the reference."
  },
  {
    "id": 24,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Medium",
    "question": "What causes the classic LaTeX error message `! Missing \\$ inserted`?",
    "choices": {
      "a": "A paid commercial license fee for TeX Live has expired.",
      "b": "A command or character that is only permitted inside math mode (such as `_`, `^`, or `\\frac`) was used in standard text mode without math delimiters.",
      "c": "A paragraph contains more than 1000 words without a section header.",
      "d": "An unescaped dollar sign character was used in a currency table."
    },
    "answer": "b",
    "explanation": "`! Missing \\$ inserted` is raised when the compiler encounters a command or symbol valid only in math mode (such as an underscore `_` for subscripts, `^` for exponents, or `\\alpha`) while still in text mode. TeX attempts to recover by virtually inserting a `\\$`."
  },
  {
    "id": 25,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Medium",
    "question": "What is the most probable cause of the error `! Undefined control sequence` followed by `\\infinte`?",
    "choices": {
      "a": "The operating system does not have sufficient RAM to allocate the infinity symbol.",
      "b": "The user misspelled the LaTeX macro command (typing `\\infinte` instead of `\\infty`).",
      "c": "The document class was set to `article` instead of `book`.",
      "d": "The user forgot to close an enumerated list."
    },
    "answer": "b",
    "explanation": "`! Undefined control sequence` indicates that LaTeX does not recognize the backslash command. Here, `\\infinte` is a typo for `\\infty`. LaTeX does not guess spelling; any unrecognized command name triggers this error."
  },
  {
    "id": 26,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Medium",
    "question": "How should an author fix the error: `! LaTeX Error: \\begin{enumerate} on input line 42 ended by \\end{itemize}`?",
    "choices": {
      "a": "Delete both line 42 and the corresponding `.log` file.",
      "b": "Ensure the environment closing command matches the opening command, either changing `\\end{itemize}` to `\\end{enumerate}` or changing `\\begin{enumerate}` to `\\begin{itemize}`.",
      "c": "Insert `\\usepackage{enumerate}` in the document body.",
      "d": "Place a dollar sign before and after `\\end{itemize}`."
    },
    "answer": "b",
    "explanation": "Every environment opened by `\\begin{envname}` must be closed by the identical name in `\\end{envname}`. A mismatch between `\\begin{enumerate}` (ordered list) and `\\end{itemize}` (unordered bullet list) causes an environment nesting error."
  },
  {
    "id": 27,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Medium",
    "question": "What is the fundamental difference between a LaTeX warning and a LaTeX error?",
    "choices": {
      "a": "Errors are generated by packages, while warnings are generated exclusively by the TeX engine kernel.",
      "b": "An error stops or disrupts document compilation because syntax cannot be parsed, whereas a warning alerts the author to typographical or layout issues (such as overfull boxes or unresolved references) while still producing a PDF.",
      "c": "Warnings delete the `.tex` source file, while errors preserve it.",
      "d": "Errors occur only when compiling on Windows; warnings occur on Linux."
    },
    "answer": "b",
    "explanation": "An error is a syntax or command violation that halts or severely interrupts compilation. A warning (such as `Overfull \\hbox (15.2pt too wide)` or `Reference 'eq:1' undefined`) informs the user of visual flaws or pending updates without stopping the compilation process."
  },
  {
    "id": 28,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Medium",
    "question": "What happens when you type a raw `%` character in LaTeX source text without a preceding backslash?",
    "choices": {
      "a": "It typesets a bold percent sign.",
      "b": "It treats the rest of that line as a comment, discarding it during compilation.",
      "c": "It triggers a fatal buffer overflow error in `pdflatex`.",
      "d": "It computes the mathematical modulo of the preceding two numbers."
    },
    "answer": "b",
    "explanation": "In LaTeX, `%` is the comment character. Everything from the `%` symbol to the end of the line is ignored by the compiler. To print a literal percent sign in the output PDF, one must escape it as `\\%`."
  },
  {
    "id": 29,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Medium",
    "question": "Which of the following is an effective professional file-management practice for a complex LaTeX project?",
    "choices": {
      "a": "Keeping all project graphics, chapters, data, and output files in the root Desktop folder with names like `final_final2.tex`.",
      "b": "Using a dedicated project folder, naming the entry point `main.tex`, placing images in a `figures/` subfolder, and using Git for version control.",
      "c": "Editing the `.aux` file manually with a text editor between compilation runs.",
      "d": "Deleting the `.tex` source file once the `.pdf` file has been generated."
    },
    "answer": "b",
    "explanation": "Professional workflow habits (as stressed in Chapter 2, Part VII) include maintaining a dedicated project folder, naming the root file `main.tex`, isolating graphics into `figures/`, using informative file names, and committing plain-text source files to version control."
  },
  {
    "id": 30,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Hard",
    "question": "Consider the source line: `\\textbf{Theorem 1.1: Let $G$ be a connected graph.` When compiled, it reports `! File ended while scanning use of \\textbf`. What is the root cause?",
    "choices": {
      "a": "The word 'Theorem' is a reserved keyword in LaTeX.",
      "b": "An opening curly brace `{` was not closed before the end of the file or paragraph, leaving the argument of `\\textbf` open.",
      "c": "The variable $G$ must be declared in the document preamble.",
      "d": "The `\\textbf` macro cannot accept math mode formulas."
    },
    "answer": "b",
    "explanation": "Every mandatory argument opened with `{` must be closed with a matching `}`. If the closing brace is missing, LaTeX continues reading until the end of the file or paragraph, throwing the error `! File ended while scanning use of \\textbf`."
  },
  {
    "id": 31,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Hard",
    "question": "A student on Linux uses `\\includegraphics{Figures/Plot.PNG}`, but compilation halts with `! LaTeX Error: File 'Figures/Plot.PNG' not found`, even though the file exists on Windows. What is the root cause?",
    "choices": {
      "a": "Linux cannot render PNG images in LaTeX.",
      "b": "File paths and file extensions are case-sensitive on Linux/Unix operating systems, so `Figures/Plot.PNG` does not match `figures/plot.png`.",
      "c": "The graphicx package only supports Encapsulated PostScript (`.eps`) files.",
      "d": "The `geometry` package blocks file inclusions."
    },
    "answer": "b",
    "explanation": "Linux and macOS file systems are case-sensitive, whereas Windows is generally case-insensitive. A file named `figures/plot.png` will fail to resolve if referenced as `Figures/Plot.PNG`. Standard practice is to use all-lowercase file names and paths."
  },
  {
    "id": 32,
    "topic": "LaTeX Ecosystem, Distributions & Tooling",
    "difficulty": "Hard",
    "question": "Why will compiling a document with `\\usepackage{fontspec}` and `\\setmainfont{Times New Roman}` fail when compiled under standard `pdflatex`?",
    "choices": {
      "a": "Times New Roman is banned by the Free Software Foundation.",
      "b": "`fontspec` relies on low-level font-loading primitives that only exist in Unicode TeX engines like XeTeX and LuaTeX, not in traditional 8-bit `pdflatex`.",
      "c": "`pdflatex` cannot read font files larger than 64 kilobytes.",
      "d": "The font name must always be specified in hexadecimal notation."
    },
    "answer": "b",
    "explanation": "`fontspec` interfaces directly with system font managers (TrueType/OpenType) via specialized engine primitives provided only by XeLaTeX and LuaLaTeX. `pdflatex` is an 8-bit engine that relies on TFM (TeX Font Metric) virtual fonts and cannot parse modern font system tables."
  },
  {
    "id": 33,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Easy",
    "question": "What are the two mandatory, distinct sections of every standard LaTeX document?",
    "choices": {
      "a": "The Abstract and the Index",
      "b": "The Preamble (before `\\begin{document}`) and the Document Body (between `\\begin{document}` and `\\end{document}`)",
      "c": "The Header and the Footer",
      "d": "The Macros block and the Postamble"
    },
    "answer": "b",
    "explanation": "Every LaTeX file consists of the Preamble (the region between `\\documentclass` and `\\begin{document}`, containing packages, settings, and macro definitions) and the Document Body (the region enclosed by `\\begin{document}` and `\\end{document}`, containing printable content)."
  },
  {
    "id": 34,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Easy",
    "question": "What must be the very first non-comment command in any standard LaTeX source document?",
    "choices": {
      "a": "`\\begin{document}`",
      "b": "`\\documentclass`",
      "c": "`\\usepackage{amsmath}`",
      "d": "`\\maketitle`"
    },
    "answer": "b",
    "explanation": "`\\documentclass[options]{class}` must be the initial command in any LaTeX document. It establishes the document structure rules, base font size, layout geometry, and allowable sectioning commands."
  },
  {
    "id": 35,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Easy",
    "question": "Which standard LaTeX document class is typically chosen for short academic papers, problem sets, and journal article submissions?",
    "choices": {
      "a": "`book`",
      "b": "`article`",
      "c": "`report`",
      "d": "`letter`"
    },
    "answer": "b",
    "explanation": "The `article` class is tailored for short documents, research papers, homework solutions, and notes. Unlike `report` and `book`, the `article` class does not provide or support `\\chapter` commands."
  },
  {
    "id": 36,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Easy",
    "question": "In the command `\\documentclass[12pt, a4paper]{article}`, what is the purpose of the square brackets `[...]`?",
    "choices": {
      "a": "They mark mandatory system paths for the compiler.",
      "b": "They enclose optional parameters or options passed to the document class.",
      "c": "They define math-mode matrix environments.",
      "d": "They indicate that the document must be rendered in grayscale."
    },
    "answer": "b",
    "explanation": "In LaTeX syntax, square brackets `[...]` denote optional parameters, while curly braces `{...}` denote mandatory arguments. Here, `12pt` and `a4paper` modify default font size and paper dimensions."
  },
  {
    "id": 37,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Easy",
    "question": "Which popular package provides an intuitive, high-level interface for adjusting page margins and layout dimensions in the preamble?",
    "choices": {
      "a": "`amsmath`",
      "b": "`geometry`",
      "c": "`graphicx`",
      "d": "`amssymb`"
    },
    "answer": "b",
    "explanation": "The `geometry` package allows clean configuration of margins, headers, footers, and page orientations (e.g., `\\usepackage[margin=1in]{geometry}`)."
  },
  {
    "id": 38,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Easy",
    "question": "Which command inside the document body renders the metadata specified by `\\title{...}`, `\\author{...}`, and `\\date{...}`?",
    "choices": {
      "a": "`\\printtitle`",
      "b": "`\\maketitle`",
      "c": "`\\begin{title}`",
      "d": "`\\header`"
    },
    "answer": "b",
    "explanation": "`\\maketitle` generates the title block at the specified location in the body using the metadata defined in the preamble or top of the document."
  },
  {
    "id": 39,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Medium",
    "question": "What is the correct hierarchical order of standard sectioning commands in the `article` document class, from highest to lowest?",
    "choices": {
      "a": "`\\chapter` $\\to$ `\\section` $\\to$ `\\subsection` $\\to$ `\\subsubsection`",
      "b": "`\\section` $\\to$ `\\subsection` $\\to$ `\\subsubsection` $\\to$ `\\paragraph` $\\to$ `\\subparagraph`",
      "c": "`\\part` $\\to$ `\\chapter` $\\to$ `\\paragraph` $\\to$ `\\section`",
      "d": "`\\subsection` $\\to$ `\\section` $\\to$ `\\chapter` $\\to$ `\\subparagraph`"
    },
    "answer": "b",
    "explanation": "In the `article` class (which lacks `\\chapter`), the hierarchy runs: `\\section` (level 1), `\\subsection` (level 2), `\\subsubsection` (level 3), `\\paragraph` (level 4), and `\\subparagraph` (level 5)."
  },
  {
    "id": 40,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Medium",
    "question": "Why will inserting `\\chapter{Introduction}` into a document using `\\documentclass{article}` throw an `Undefined control sequence` error?",
    "choices": {
      "a": "Because `\\chapter` is only recognized when loaded with the `amsmath` package.",
      "b": "Because the `article` class does not define `\\chapter`; chapters exist only in higher-level classes such as `report` and `book`.",
      "c": "Because `\\chapter` can only be placed inside the preamble.",
      "d": "Because chapters must always be titled with Roman numerals."
    },
    "answer": "b",
    "explanation": "The `article` class is designed for shorter articles where the top-level structural unit is a `\\section`. The `\\chapter` command is deliberately not defined in `article.cls`. To use chapters, one must switch to `report` or `book`."
  },
  {
    "id": 41,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Medium",
    "question": "How can an author create a section heading that does not get assigned a sequential number and is excluded from the default Table of Contents?",
    "choices": {
      "a": "`\\section[no-number]{Heading}`",
      "b": "`\\section*{Heading}`",
      "c": "`\\nosection{Heading}`",
      "d": "`\\section{Heading}\\nonumber`"
    },
    "answer": "b",
    "explanation": "In LaTeX, appending an asterisk `*` to sectioning and math environments (e.g., `\\section*`, `\\subsection*`, `\\begin{equation*}`) creates an unnumbered variant that is omitted from automatic counters and standard tables of contents."
  },
  {
    "id": 42,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Medium",
    "question": "Which of the following characters must be escaped with a backslash to be printed as literal text in normal LaTeX prose?",
    "choices": {
      "a": "A, B, C, +, -",
      "b": "%, &, _, #, \\$, {, }",
      "c": "., ,, :, ;, !",
      "d": "(, ), [, ], /"
    },
    "answer": "b",
    "explanation": "The characters `%`, `&`, `_`, `#`, `\\$`, `{`, and `}` are reserved syntactical characters in TeX. To typeset them literally in text, they must be preceded by a backslash: `\\%`, `\\&`, `\\_`, `\\#`, `\\$`, `\\{`, `\\}`."
  },
  {
    "id": 43,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Medium",
    "question": "What is the key difference between the `itemize`, `enumerate`, and `description` environments?",
    "choices": {
      "a": "`itemize` creates numbered lists; `enumerate` creates bulleted lists; `description` creates tables.",
      "b": "`itemize` produces bulleted unordered lists; `enumerate` produces sequentially numbered ordered lists; `description` produces term-definition labeled lists.",
      "c": "`itemize` is only used in math mode; `enumerate` is only used in tables.",
      "d": "All three environments produce identical numbered lists."
    },
    "answer": "b",
    "explanation": "`itemize` creates bulleted bullet-point lists, `enumerate` generates numbered or lettered sequences ($1, 2, 3...$), and `description` takes an optional label `\\item[Term]` to format bold terms followed by descriptions."
  },
  {
    "id": 44,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Medium",
    "question": "How do you produce a literal backslash character `\\` in regular text mode?",
    "choices": {
      "a": "`\\\\`",
      "b": "`\\textbackslash`",
      "c": "`\\slash`",
      "d": "`\\backslash`"
    },
    "answer": "b",
    "explanation": "In LaTeX text mode, `\\\\` represents a line break, and `\\backslash` is a math-mode delimiter. To produce a literal backslash glyph in body text, one must use `\\textbackslash`."
  },
  {
    "id": 45,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Medium",
    "question": "What is the primary benefit of loading `\\usepackage{hyperref}` in the preamble, and what is the standard recommended guideline for its loading order?",
    "choices": {
      "a": "It enables spell checking and should be loaded as the very first package.",
      "b": "It transforms cross-references, URLs, and citations into clickable hyperlinks; it should generally be loaded last in the package list to avoid macro overriding conflicts.",
      "c": "It speeds up compilation by converting LaTeX directly into C++ bytecode.",
      "d": "It forces all pages into landscape orientation."
    },
    "answer": "b",
    "explanation": "`hyperref` redefines numerous internal LaTeX commands to insert hyperlinking anchors into the PDF. Because it hooks into many core macros, it should almost always be loaded last in the preamble, with very few documented exceptions (like `cleveref`)."
  },
  {
    "id": 46,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Hard",
    "question": "What error occurs if a user attempts to call `\\usepackage{amsmath}` inside the document body (after `\\begin{document}`)?",
    "choices": {
      "a": "`! Undefined control sequence \\amsmath`",
      "b": "`! LaTeX Error: \\usepackage before \\begin{document} required` (or 'Can be used only in preamble')",
      "c": "The document automatically recompiles in compatibility mode without warnings.",
      "d": "The font changes permanently to Comic Sans."
    },
    "answer": "b",
    "explanation": "Packages modify low-level engine parameters, load fonts, and declare environments before the document canvas is initialized. Calling `\\usepackage` after `\\begin{document}` generates the error `! LaTeX Error: Can be used only in preamble`."
  },
  {
    "id": 47,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Hard",
    "question": "Why is using `\\usepackage[margin=1in]{geometry}` preferred over manually setting low-level TeX primitives like `\\topmargin = 0pt` and `\\oddsidemargin = 0pt`?",
    "choices": {
      "a": "TeX primitives are disabled by default in 64-bit operating systems.",
      "b": "The `geometry` package recalculates interdependent layout parameters (such as `\\textwidth`, `\\textheight`, `\\headheight`, and margin ratios) dynamically, preventing header clipping and irregular margins.",
      "c": "The `geometry` package is required to compile formulas with exponents.",
      "d": "Setting primitives directly causes an immediate Overfull \\vbox fatal crash."
    },
    "answer": "b",
    "explanation": "TeX's page dimensions involve dozens of interdependent length variables (`\\voffset`, `\\topmargin`, `\\headheight`, `\\headsep`, `\\textheight`, etc.). Manually tweaking one often clips headers or leaves asymmetric margins. The `geometry` package handles this math coherently."
  },
  {
    "id": 48,
    "topic": "Document Architecture & Preamble Configuration",
    "difficulty": "Hard",
    "question": "A student wishes to configure `hyperref` so that links are indicated by colored text rather than conspicuous boxes around words. Which preamble setup accomplishes this?",
    "choices": {
      "a": "`\\usepackage[noboxes]{hyperref}`",
      "b": "`\\usepackage[colorlinks=true, linkcolor=blue, citecolor=green, urlcolor=magenta]{hyperref}`",
      "c": "`\\hypersetup{hideall=true}`",
      "d": "`\\usepackage{nohyperref}`"
    },
    "answer": "b",
    "explanation": "By passing `colorlinks=true` (or setting it via `\\hypersetup`), `hyperref` removes the default rectangular bounding boxes around links and instead styles the clickable text itself with custom colors (e.g., `linkcolor`, `citecolor`, `urlcolor`)."
  },
  {
    "id": 49,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Easy",
    "question": "What is the syntactical difference between inline mathematics and displayed mathematics in standard LaTeX?",
    "choices": {
      "a": "Inline math is delimited by `$ ... $`, while display math is set on its own centered line using `\\[ ... \\]` or `\\begin{equation} ... \\end{equation}`.",
      "b": "Inline math requires `\\begin{align}`, while display math uses `% ... %`.",
      "c": "Display math is printed in smaller italic font within a running paragraph.",
      "d": "Inline math only supports Greek letters, whereas display math supports Arabic numerals."
    },
    "answer": "a",
    "explanation": "Inline math (`$...$` or `\\(...\\)`) embeds formulas directly within the flow of a paragraph. Display math (`\\[...\\]` or the `equation` environment) centers the equation on a standalone line with dedicated vertical spacing."
  },
  {
    "id": 50,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Easy",
    "question": "Which package developed by the American Mathematical Society is essential for advanced multi-line mathematical environments such as `align`, `gather`, and `multline`?",
    "choices": {
      "a": "`amssymb`",
      "b": "`amsmath`",
      "c": "`amsfonts`",
      "d": "`amsthm`"
    },
    "answer": "b",
    "explanation": "`amsmath` is the quintessential AMS-LaTeX package providing structured environments (`align`, `gather`, `multline`, `split`, `cases`) and advanced math typography tools."
  },
  {
    "id": 51,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Easy",
    "question": "How should a subscript with multiple characters (such as $x_{12}$) be typeset in LaTeX?",
    "choices": {
      "a": "`$x_12$`",
      "b": "`$x_{12}$`",
      "c": "`$x^(12)$`",
      "d": "`$x-[12]$`"
    },
    "answer": "b",
    "explanation": "In LaTeX, scripts apply only to the immediately following single token. Typing `$x_12$` produces $x_12$ (subscript 1 followed by an inline 2). Braces `{}` must group multi-character indices: `$x_{12}$`."
  },
  {
    "id": 52,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Easy",
    "question": "Which LaTeX command correctly typesets the Greek letter theta ($\\theta$) and capital gamma ($\\Gamma$)?",
    "choices": {
      "a": "`\\theta` and `\\Gamma`",
      "b": "`\\Theta` and `\\gamma`",
      "c": "`\\greek{th}` and `\\greek{GA}`",
      "d": "`$th$` and `$GA$`"
    },
    "answer": "a",
    "explanation": "Standard Greek letters are invoked by their spelled-out English names preceded by a backslash. Lowercase names (`\\theta`, `\\gamma`, `\\alpha`) yield lowercase letters; capitalized names (`\\Theta`, `\\Gamma`, `\\Delta`) yield uppercase Greek letters."
  },
  {
    "id": 53,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Easy",
    "question": "What is the command to typeset a fraction $\\frac{a+b}{c-d}$ in math mode?",
    "choices": {
      "a": "`\\fraction{a+b}{c-d}`",
      "b": "`\\frac{a+b}{c-d}`",
      "c": "`{a+b} \\overbar {c-d}`",
      "d": "`\\div{a+b}{c-d}`"
    },
    "answer": "b",
    "explanation": "The standard LaTeX fraction command is `\\frac{numerator}{denominator}`. TeX's legacy `{a+b} \\over {c-d}` is deprecated in modern AMS-LaTeX."
  },
  {
    "id": 54,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Easy",
    "question": "What is the standard LaTeX command to typeset a definite integral from $0$ to $\\infty$ of $e^{-x}$?",
    "choices": {
      "a": "`\\integral_0^\\infty e^{-x} dx`",
      "b": "`\\int_{0}^{\\infty} e^{-x}\\,dx`",
      "c": "`\\sum_{0}^{\\infty} e^{-x} dx`",
      "d": "`\\lim_{0 \\to \\infty} e^{-x}`"
    },
    "answer": "b",
    "explanation": "The integral symbol is `\\int`, with lower limit specified by `_` and upper limit by `^`: `\\int_{0}^{\\infty} e^{-x}\\,dx`. Inserting `\\,` provides a thin space before the differential $dx$."
  },
  {
    "id": 55,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Medium",
    "question": "What is the primary difference between the `equation` environment and the `equation*` environment in `amsmath`?",
    "choices": {
      "a": "`equation` formats inline text, while `equation*` formats matrices.",
      "b": "`equation` automatically assigns a sequential equation number, while `equation*` suppresses the equation number.",
      "c": "`equation*` compiles faster by disabling KaTeX fonts.",
      "d": "`equation` aligns multiple lines on `&`, whereas `equation*` does not."
    },
    "answer": "b",
    "explanation": "`equation` prints a centered display equation with an automatic sequential number on the margin. `equation*` (from `amsmath`) suppresses the number."
  },
  {
    "id": 56,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Medium",
    "question": "In the `align` environment from `amsmath`, what are the specific functions of the ampersand `&` and the double backslash `\\\\`?",
    "choices": {
      "a": "`&` marks the horizontal alignment point (typically before an equals or relation sign), and `\\\\` breaks to the next line.",
      "b": "`&` indicates a logical AND operator, and `\\\\` indicates integer division.",
      "c": "`&` terminates the math environment, and `\\\\` introduces a footnote.",
      "d": "`&` adds a space, and `\\\\` centers the text."
    },
    "answer": "a",
    "explanation": "In `align` and other tabular math environments, `&` designates the vertical alignment anchor (often placed just before `=`), while `\\\\` commands the engine to begin a new equation line."
  },
  {
    "id": 57,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Medium",
    "question": "When should an author choose the `gather` environment instead of `align`?",
    "choices": {
      "a": "When displaying a system of linear equations where every column must align on plus signs.",
      "b": "When displaying a group of multiple related equations that each need to be centered independently without horizontal alignment on a specific relation symbol.",
      "c": "When the equation must appear in the running header.",
      "d": "When creating a bulleted list of mathematical definitions."
    },
    "answer": "b",
    "explanation": "`gather` centers each equation line independently without requiring or honoring alignment points (`&`). `align` is chosen when lines must share a common horizontal alignment column."
  },
  {
    "id": 58,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Medium",
    "question": "Which `amsmath` environment is specifically designed for a single long equation that does not fit on one line, placing the first part left-aligned and the second part right-aligned?",
    "choices": {
      "a": "`split`",
      "b": "`multline`",
      "c": "`gathered`",
      "d": "`matrix`"
    },
    "answer": "b",
    "explanation": "The `multline` environment is tailored for a single equation that exceeds the page width. It left-aligns the first line, right-aligns the final line, and centers any intermediate lines, assigning a single equation number."
  },
  {
    "id": 59,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Medium",
    "question": "Why is typing `$\\sin(x)$` correct, whereas typing `$sin(x)$` is a typographical error in mathematical documents?",
    "choices": {
      "a": "`$sin(x)$` fails to compile and halts LaTeX execution.",
      "b": "`$sin(x)$` treats 's', 'i', and 'n' as three separate multiplied italic mathematical variables ($s \\cdot i \\cdot n$), whereas `\\sin` prints the operator in upright roman type with correct spacing.",
      "c": "`$\\sin(x)$` renders in bold blackboard font.",
      "d": "`$sin(x)$` is only allowed in engineering reports."
    },
    "answer": "b",
    "explanation": "In math mode, adjacent letters without backslashes are interpreted as products of independent italic variables ($s \\times i \\times n$). Named operators (`\\sin`, `\\cos`, `\\log`, `\\lim`, `\\det`) must use operator macros to render in upright font with proper kerning."
  },
  {
    "id": 60,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Medium",
    "question": "How can an author declare a new mathematical operator `\\proj` in the preamble using `amsmath` so it formats identically to standard operators?",
    "choices": {
      "a": "`\\newcommand{\\proj}{\\text{proj}}`",
      "b": "`\\DeclareMathOperator{\\proj}{proj}`",
      "c": "`\\newoperator{\\proj}{proj}`",
      "d": "`\\def\\proj{\\mathbf{proj}}`"
    },
    "answer": "b",
    "explanation": "`\\DeclareMathOperator{\\cmd}{name}` from `amsmath` properly registers a new math operator. It ensures upright font, proper surrounding whitespace, and correct superscripts/subscripts. The starred variant `\\DeclareMathOperator*` places limits above and below in display mode."
  },
  {
    "id": 61,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Medium",
    "question": "Which `amsmath` matrix environment typesets elements enclosed in parentheses $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$?",
    "choices": {
      "a": "`bmatrix`",
      "b": "`pmatrix`",
      "c": "`vmatrix`",
      "d": "`Bmatrix`"
    },
    "answer": "b",
    "explanation": "`pmatrix` encloses entries in parentheses $( )$, `bmatrix` uses square brackets $[ ]$, `Bmatrix` uses curly braces $\\{ \\}$, `vmatrix` uses single vertical pipes $| |$ (for determinants), and `Vmatrix` uses double vertical bars $\\| \\|$ (for norms)."
  },
  {
    "id": 62,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Hard",
    "question": "Consider a multi-line calculation that should be aligned at the equal sign, but must be assigned a single overall equation number for the entire block. How is this achieved?",
    "choices": {
      "a": "Use `\\begin{align}` and place `\\nonumber` on every line except the last.",
      "b": "Nest a `split` environment inside a standard `equation` environment: `\\begin{equation} \\begin{split} ... \\end{split} \\end{equation}`.",
      "c": "Use the `multline` environment with ampersands on every line.",
      "d": "Use an unnumbered `align*` environment and manually type `(1)` at the end."
    },
    "answer": "b",
    "explanation": "The `split` environment is specifically designed to be nested inside an enclosing display environment like `equation`. It allows alignment via `&` across multiple lines while treating the entire construct as a single numbered entity with one vertically centered tag."
  },
  {
    "id": 63,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Hard",
    "question": "How is a piecewise function such as $|x| = \\begin{cases} x, & \\text{if } x \\ge 0 \\\\ -x, & \\text{if } x < 0 \\end{cases}$ correctly typeset?",
    "choices": {
      "a": "Using an `array` with manual `\\left\\{` and `\\right.` delimiters.",
      "b": "Using the `cases` environment provided by `amsmath`.",
      "c": "Using the `piecewise` package.",
      "d": "Both a and b are valid, but `cases` is the standard semantic AMS-LaTeX construct."
    },
    "answer": "d",
    "explanation": "While a manual `array` can theoretically mimic the layout, the `cases` environment provided by `amsmath` is the clean, semantic, and standard modern LaTeX environment for typesetting piecewise definitions and conditionals."
  },
  {
    "id": 64,
    "topic": "Mathematical Typesetting & AMS-LaTeX",
    "difficulty": "Hard",
    "question": "What are the relative horizontal spacing widths produced in math mode by `\\,`, `\\:`, `\\;`, `\\quad`, and `\\!`?",
    "choices": {
      "a": "`\\,` is thin space ($3/18$ em), `\\:` is medium space ($4/18$ em), `\\;` is thick space ($5/18$ em), `\\quad` is $1$ em, and `\\!` is negative thin space ($-3/18$ em).",
      "b": "`\\!` is a full line break, while `\\quad` is a tab stop.",
      "c": "`\\,` is negative space, while `\\!` is double space.",
      "d": "They all produce identical 1-character spaces."
    },
    "answer": "a",
    "explanation": "TeX provides precise micro-spacing commands in math mode: `\\,` (thin space, $3/18$ em), `\\:` (medium space, $4/18$ em), `\\;` (thick space, $5/18$ em), `\\quad` ($1$ em), `\\qquad` ($2$ em), and `\\!` (negative thin space, $-3/18$ em, used to tighten spacing)."
  },
  {
    "id": 65,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Easy",
    "question": "What is the primary role of the `\\left` and `\\right` commands when placed before mathematical delimiters such as parentheses or brackets?",
    "choices": {
      "a": "They shift the equation to the left or right margin.",
      "b": "They automatically scale the vertical height of the delimiters to match the height of the enclosed expression.",
      "c": "They convert parentheses into curly brackets.",
      "d": "They restrict delimiter rendering to left-to-right languages."
    },
    "answer": "b",
    "explanation": "`\\left` and `\\right` dynamically resize opening and closing delimiters (such as `( )`, `[ ]`, `\\{ \\}`) to match the vertical dimensions of whatever content is nested between them (e.g., tall fractions or matrices)."
  },
  {
    "id": 66,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Easy",
    "question": "If an author opens a scalable delimiter with `\\left\\{`, but does not want a visible closing delimiter on the right side of the expression, what command must be used?",
    "choices": {
      "a": "Leave the expression open without any matching command.",
      "b": "`\\right.` (a period immediately following `\\right`)",
      "c": "`\\right\\empty`",
      "d": "`\\endleft`"
    },
    "answer": "b",
    "explanation": "Every `\\left` must have an accompanying `\\right` in the same math grouping. To create a one-sided open delimiter (such as for a piecewise bracket or evaluation bar), use `\\right.` as an invisible dummy delimiter."
  },
  {
    "id": 67,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Easy",
    "question": "When `\\left(` and `\\right)` create excessively large or unbalanced delimiters, which manual delimiter sizing commands can be used?",
    "choices": {
      "a": "`\\small(`, `\\medium(`, `\\large(`",
      "b": "`\\bigl(`, `\\Bigl(`, `\\biggl(`, and `\\Biggl(` (along with their corresponding right variants)",
      "c": "`\\size1(`, `\\size2(`, `\\size3(`",
      "d": "`\\delimit[1](`, `\\delimit[2](`"
    },
    "answer": "b",
    "explanation": "Manual delimiter sizing provides finer typographic control: `\\bigl`/`\\bigr` (level 1), `\\Bigl`/`\\Bigr` (level 2), `\\biggl`/`\\biggr` (level 3), and `\\Biggl`/`\\Biggr` (level 4). They prevent the disproportionate stretching that `\\left`/`\\right` occasionally causes."
  },
  {
    "id": 68,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Easy",
    "question": "What is the standard syntax for defining a parameterless custom macro in LaTeX?",
    "choices": {
      "a": "`\\defmacro{name}{definition}`",
      "b": "`\\newcommand{\\name}{definition}`",
      "c": "`\\makemacro{\\name} = {definition}`",
      "d": "`\\createcommand[name]{definition}`"
    },
    "answer": "b",
    "explanation": "The LaTeX standard for defining new commands is `\\newcommand{\\cmdname}{expansion}`. If the command name is already in use, `\\newcommand` safely halts with an error, preventing accidental overwriting."
  },
  {
    "id": 69,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Easy",
    "question": "Which AMS package provides high-level theorem declaration tools and the `proof` environment?",
    "choices": {
      "a": "`amsmath`",
      "b": "`amsthm`",
      "c": "`amssymb`",
      "d": "`amstex`"
    },
    "answer": "b",
    "explanation": "`amsthm` is dedicated to theorem management. It provides `\\newtheorem`, `\\theoremstyle`, and the standard `proof` environment terminating with an automatic QED symbol."
  },
  {
    "id": 70,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Easy",
    "question": "What are the three predefined theorem styles available in the `amsthm` package?",
    "choices": {
      "a": "`bold`, `italic`, and `underline`",
      "b": "`plain`, `definition`, and `remark`",
      "c": "`easy`, `medium`, and `hard`",
      "d": "`axiom`, `lemma`, and `corollary`"
    },
    "answer": "b",
    "explanation": "The three standard styles in `amsthm` are `plain` (bold heading, italic text for theorems/lemmas), `definition` (bold heading, upright roman text for definitions/examples), and `remark` (italic heading, upright roman text for remarks/notes)."
  },
  {
    "id": 71,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Medium",
    "question": "Which math font command produces the standard blackboard bold real numbers $\\mathbb{R}$ and integers $\\mathbb{Z}$?",
    "choices": {
      "a": "`\\mathbf{R}`",
      "b": "`\\mathbb{R}` (from `amssymb` / `amsfonts`)",
      "c": "`\\mathcal{R}`",
      "d": "`\\mathfrak{R}`"
    },
    "answer": "b",
    "explanation": "`\\mathbb{R}` produces the double-struck blackboard bold letter $\\mathbb{R}$ commonly used for number systems (requiring `amssymb` or `amsfonts`). `\\mathbf` produces upright bold, `\\mathcal` produces script/calligraphic, and `\\mathfrak` produces Fraktur."
  },
  {
    "id": 72,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Medium",
    "question": "Which math font command should be used to typeset a script or calligraphic collection of sets, such as $\\mathcal{F}$ or $\\mathcal{B}$?",
    "choices": {
      "a": "`\\mathit{F}`",
      "b": "`\\mathcal{F}`",
      "c": "`\\mathrm{F}`",
      "d": "`\\mathsf{F}`"
    },
    "answer": "b",
    "explanation": "`\\mathcal{...}` produces calligraphic uppercase letters (e.g., $\\mathcal{F}$ for a sigma-algebra or family of subsets). `\\mathrm` produces upright roman, `\\mathit` produces math italic, and `\\mathsf` produces sans-serif."
  },
  {
    "id": 73,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Medium",
    "question": "How do you define a custom macro `\\norm` that accepts exactly one argument $x$ and prints $\\left\\| x \\right\\|$?",
    "choices": {
      "a": "`\\newcommand{\\norm}{\\left\\| #1 \\right\\|}`",
      "b": "`\\newcommand{\\norm}[1]{\\left\\| #1 \\right\\|}`",
      "c": "`\\newcommand{\\norm}(1){\\left\\| (1) \\right\\|}`",
      "d": "`\\def\\norm#{\\left\\| # \\right\\|}`"
    },
    "answer": "b",
    "explanation": "To define a macro taking arguments in LaTeX, specify the number of parameters in square brackets immediately after the command name: `\\newcommand{\\norm}[1]{\\left\\| #1 \\right\\|}`. Inside the expansion, `#1` is replaced by the provided input argument."
  },
  {
    "id": 74,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Medium",
    "question": "What is the key functional difference between `\\newcommand` and `\\renewcommand`?",
    "choices": {
      "a": "`\\newcommand` works in the preamble, while `\\renewcommand` only works in the body.",
      "b": "`\\newcommand` throws an error if the macro name already exists, whereas `\\renewcommand` overwrites an existing command and throws an error if it does NOT already exist.",
      "c": "`\\renewcommand` can only define commands that take no arguments.",
      "d": "`\\newcommand` converts LaTeX into TeX primitive tokens."
    },
    "answer": "b",
    "explanation": "`\\newcommand` safely introduces a new control sequence, halting with an error if that name is already defined by the engine or any loaded package. `\\renewcommand` is intentionally used to reassign or modify an existing command."
  },
  {
    "id": 75,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Medium",
    "question": "Consider the preamble declarations: `\\newtheorem{theorem}{Theorem}[section]` and `\\newtheorem{lemma}[theorem]{Lemma}`. How will lemmas be numbered in Section 3?",
    "choices": {
      "a": "Lemmas will have their own independent numbering: Lemma 1, Lemma 2.",
      "b": "Lemmas will share the same counter sequence as theorems: e.g., Theorem 3.1, Lemma 3.2, Theorem 3.3.",
      "c": "Lemmas will be numbered alphabetically: Lemma A, Lemma B.",
      "d": "Lemmas will be unnumbered."
    },
    "answer": "b",
    "explanation": "The optional argument `[theorem]` in `\\newtheorem{lemma}[theorem]{Lemma}` instructs LaTeX to share the existing `theorem` counter rather than creating an independent counter. In Section 3, theorems and lemmas advance a single unified counter: Theorem 3.1, Lemma 3.2."
  },
  {
    "id": 76,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Medium",
    "question": "Why do definitions and examples typically use `\\theoremstyle{definition}` rather than `\\theoremstyle{plain}` in academic math texts?",
    "choices": {
      "a": "`plain` causes a syntax error if math symbols appear inside.",
      "b": "`plain` formats the entire body text in italics, which makes multi-sentence definitions and computations harder to read; `definition` keeps the body text in upright roman type while retaining a bold title.",
      "c": "`definition` suppresses theorem numbers completely.",
      "d": "`definition` forces text to appear in a shaded box."
    },
    "answer": "b",
    "explanation": "Under `\\theoremstyle{plain}`, all body text is italicized, which is standard for theorem and lemma claims. However, reading long definitions or worked examples in italics causes visual fatigue; `\\theoremstyle{definition}` uses clean, upright roman body text."
  },
  {
    "id": 77,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Medium",
    "question": "What is the standard behavior of the `proof` environment from `amsthm` regarding the QED symbol?",
    "choices": {
      "a": "It writes 'Q.E.D.' in bold capital letters at the start of the proof.",
      "b": "It automatically places an open tombstone symbol ($\\square$) right-aligned at the end of the proof.",
      "c": "It prints a solid black circle on the left margin.",
      "d": "It does not insert any visual marker."
    },
    "answer": "b",
    "explanation": "The `amsthm` `proof` environment begins by printing an italic heading '*Proof.*' and automatically appends a right-aligned open square tombstone (`\\qedsymbol` or $\\square$) at the end of the final line."
  },
  {
    "id": 78,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Hard",
    "question": "A proof ends with a displayed equation inside `\\[ ... \\]`. By default, the QED tombstone drops down onto its own empty line. How can an author pull the QED symbol directly into the displayed formula line?",
    "choices": {
      "a": "Type `\\qed` inside the formula.",
      "b": "Place `\\qedhere` at the end of the formula inside the display environment.",
      "c": "Remove the `\\[ ... \\]` delimiters.",
      "d": "Set `\\qedsymbol=0pt`."
    },
    "answer": "b",
    "explanation": "When the final element of a proof is a displayed math formula or alignment environment, LaTeX defaults to placing the QED square on a new, otherwise blank line. Placing `\\qedhere` inside the display (e.g., just before `\\end{equation}`) positions the symbol on the same line as the equation."
  },
  {
    "id": 79,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Hard",
    "question": "An author compiles a document containing `\\newcommand{\\vec}[1]{\\mathbf{#1}}`, but compilation halts with `! LaTeX Error: Command \\vec already defined`. What is the correct remedy?",
    "choices": {
      "a": "Replace `\\newcommand` with `\\renewcommand{\\vec}[1]{\\mathbf{#1}}`.",
      "b": "Delete the `amsmath` package from the preamble.",
      "c": "Use `\\let\\vec=0`.",
      "d": "Rename the command to a non-alphabetical character."
    },
    "answer": "a",
    "explanation": "LaTeX already defines `\\vec` as the vector arrow accent command (e.g., $\\vec{v}$). Because `\\newcommand` guards against overwriting established commands, redefining it requires `\\renewcommand`."
  },
  {
    "id": 80,
    "topic": "Customization, Delimiters & Macro Engineering",
    "difficulty": "Hard",
    "question": "After defining `\\newcommand{\\R}{\\mathbb{R}}`, a student writes: `Let \\R be the real field.` In the output PDF, it renders as 'Let $\\mathbb{R}$be the real field' without a space. Why did this occur, and how is it corrected?",
    "choices": {
      "a": "TeX eats following whitespace after control words; correct by typing `\\R\\ ` or `\\R{}` or placing math in delimiters `$\\mathbb{R}$`.",
      "b": "The font metric table for `\\mathbb` has negative width.",
      "c": "The `geometry` package margin space is too narrow.",
      "d": "`\\newcommand` cannot be used with uppercase letters."
    },
    "answer": "a",
    "explanation": "TeX's lexical analyzer consumes all spaces following a control word (a macro ending in a letter) to distinguish the command name from text. To preserve following whitespace in prose, append an empty group `\\R{}` or an explicit control space `\\R\\ ` (or use the macro inside proper math mode `$\\R$`)."
  },
  {
    "id": 81,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Easy",
    "question": "What is a 'float' in LaTeX, and why are `figure` and `table` environments designated as floats?",
    "choices": {
      "a": "A float is a variable with decimal values in LaTeX's internal arithmetic calculator.",
      "b": "A float is a container for content that cannot be broken across page breaks, which LaTeX automatically migrates to an optimal page position to prevent large gaps of white space.",
      "c": "A float is a document class designed for digital slide presentations.",
      "d": "A float is an unnumbered appendix chapter."
    },
    "answer": "b",
    "explanation": "Floats are typographic containers for self-contained objects (tables and figures) that cannot be broken across pages. To prevent large awkward white gaps at the bottoms of pages, LaTeX lets them 'float' to the top, bottom, or next page according to placement rules."
  },
  {
    "id": 82,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Easy",
    "question": "What do the float placement specifiers `h`, `t`, `b`, and `p` signify in `\\begin{figure}[htbp]`?",
    "choices": {
      "a": "`h` = here, `t` = top of page, `b` = bottom of page, `p` = dedicated float page",
      "b": "`h` = horizontal, `t` = title, `b` = bold, `p` = paragraph",
      "c": "`h` = high quality, `t` = text mode, `b` = bordered, `p` = portrait",
      "d": "`h` = header, `t` = tabulated, `b` = baseline, `p` = printed"
    },
    "answer": "a",
    "explanation": "Float position specifiers give LaTeX permission where to place the float: `h` (here, roughly at current insertion point), `t` (top of a text page), `b` (bottom of a text page), and `p` (on a dedicated page containing only floats)."
  },
  {
    "id": 83,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Easy",
    "question": "In a `tabular` environment, what do the column alignment specifiers `l`, `c`, and `r` mean?",
    "choices": {
      "a": "`l` = large font, `c` = centered font, `r` = roman font",
      "b": "`l` = left-aligned, `c` = centered, `r` = right-aligned",
      "c": "`l` = line, `c` = column, `r` = row",
      "d": "`l` = low-resolution, `c` = compressed, `r` = raw"
    },
    "answer": "b",
    "explanation": "In `\\begin{tabular}{lcr}`, each letter describes the horizontal alignment of a column: `l` produces left-aligned text, `c` centers text, and `r` produces right-aligned text (commonly used for numbers)."
  },
  {
    "id": 84,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Easy",
    "question": "Which `tabular` column specifier defines a fixed-width column with automatic multiline text wrapping?",
    "choices": {
      "a": "`w{width}`",
      "b": "`p{width}`",
      "c": "`m{width}`",
      "d": "`wrap{width}`"
    },
    "answer": "b",
    "explanation": "The column specifier `p{width}` (paragraph column, e.g. `p{5cm}`) creates a cell of specified width that automatically wraps text into multiple lines like an ordinary paragraph."
  },
  {
    "id": 85,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Easy",
    "question": "Which characters are used inside a `tabular` environment to separate adjacent column cells and terminate rows?",
    "choices": {
      "a": "`,` separates columns and `;` terminates rows",
      "b": "`&` separates columns and `\\\\` terminates rows",
      "c": "`|` separates columns and `\\newline` terminates rows",
      "d": "`TAB` separates columns and `ENTER` terminates rows"
    },
    "answer": "b",
    "explanation": "In tabular formatting, the ampersand `&` is the column separator, and the double backslash `\\\\` indicates the end of a row."
  },
  {
    "id": 86,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Easy",
    "question": "Why does modern professional academic typography (and the `booktabs` package) strongly discourage vertical rules (`|`) in tables?",
    "choices": {
      "a": "Vertical rules cause severe memory leaks in the TeX engine.",
      "b": "Vertical lines clutter the table visually, obstruct horizontal scanning, and look amateurish; clear alignment and varied horizontal spacing structure data better.",
      "c": "Vertical rules are incompatible with PDF printers.",
      "d": "Vertical rules convert tables into matrices."
    },
    "answer": "b",
    "explanation": "As emphasized in Chapter 6 of the lecture notes and the classic `booktabs` documentation, vertical rules interrupt eye motion across rows. Clean, professional tables use horizontal alignment, whitespace, and selective horizontal rules (`\\toprule`, `\\midrule`, `\\bottomrule`)."
  },
  {
    "id": 87,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Medium",
    "question": "What are the three primary horizontal rule commands provided by the `booktabs` package to replace standard `\\hline`?",
    "choices": {
      "a": "`\\firstline`, `\\middleline`, `\\lastline`",
      "b": "`\\toprule`, `\\midrule`, and `\\bottomrule`",
      "c": "`\\thickline`, `\\thinline`, `\\doubleline`",
      "d": "`\\headrule`, `\\bodyrule`, `\\footrule`"
    },
    "answer": "b",
    "explanation": "`booktabs` defines `\\toprule` (heavy rule at the top of the table), `\\midrule` (lighter rule separating column headers from data rows), and `\\bottomrule` (heavy rule closing the table)."
  },
  {
    "id": 88,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Medium",
    "question": "Which `booktabs` command draws a partial horizontal rule spanning only columns 2 through 4?",
    "choices": {
      "a": "`\\hline{2-4}`",
      "b": "`\\cmidrule{2-4}`",
      "c": "`\\partialrule[2-4]`",
      "d": "`\\midrule(2-4)`"
    },
    "answer": "b",
    "explanation": "`\\cmidrule{col1-col2}` from `booktabs` draws a horizontal rule over the specified column range, commonly used beneath multi-column subheaders."
  },
  {
    "id": 89,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Medium",
    "question": "Which command from the `graphicx` package scales an included image so that its width matches exactly 80% of the current text line width?",
    "choices": {
      "a": "`\\includeimage[scale=80]{plot.png}`",
      "b": "`\\includegraphics[width=0.8\\textwidth]{plot.png}`",
      "c": "`\\insertfig[0.8]{plot.png}`",
      "d": "`\\graphic[width=80%]{plot.png}`"
    },
    "answer": "b",
    "explanation": "`\\includegraphics[width=0.8\\textwidth]{filename}` dynamically scales the image to 80% of the printable text block width (`\\textwidth`), maintaining aspect ratio automatically."
  },
  {
    "id": 90,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Medium",
    "question": "In a floating `table` or `figure` environment, why MUST the `\\label{...}` command always be placed AFTER (or inside) the `\\caption{...}` command?",
    "choices": {
      "a": "Placing `\\label` before `\\caption` triggers an immediate fatal syntax crash.",
      "b": "`\\caption` is what steps the float counter and sets the internal reference target; placing `\\label` before `\\caption` binds the label to the preceding section counter instead of the float number.",
      "c": "`\\label` will convert the caption text into uppercase.",
      "d": "LaTeX reads floating environments backwards."
    },
    "answer": "b",
    "explanation": "This is a notorious LaTeX pitfall (covered in Chapter 6 and 7). The reference counter is incremented and registered by `\\caption`. If `\\label` precedes `\\caption`, `\\ref` grabs the last active counter (such as the chapter or section number) instead of the figure/table number."
  },
  {
    "id": 91,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Medium",
    "question": "What is the standard academic convention regarding caption placement for tables versus figures?",
    "choices": {
      "a": "Table captions and figure captions must both be placed at the bottom.",
      "b": "Table captions are typically placed ABOVE the table, whereas figure captions are placed BELOW the figure.",
      "c": "Table captions are placed on the left, and figure captions on the right.",
      "d": "Captions must only be printed in an appendix."
    },
    "answer": "b",
    "explanation": "Standard academic publishing style dictates that table captions precede the data (placed above the table) to establish what is being tabulated, whereas figure captions appear beneath the image or diagram."
  },
  {
    "id": 92,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Medium",
    "question": "Inside a floating `figure` environment, why is the declaration `\\centering` preferred over the environment `\\begin{center} ... \\end{center}`?",
    "choices": {
      "a": "`\\begin{center}` does not center images.",
      "b": "`\\begin{center}` adds extra unwanted vertical whitespace above and below the content, whereas `\\centering` centers without adding extraneous vertical padding.",
      "c": "`\\centering` makes the image vector-based.",
      "d": "`\\begin{center}` is deprecated in modern LaTeX."
    },
    "answer": "b",
    "explanation": "The `center` environment is designed for body paragraphs and introduces additional top and bottom paragraph margins. Inside a float, `\\centering` aligns the contents horizontally without introducing unwanted extra vertical space."
  },
  {
    "id": 93,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Medium",
    "question": "What is the function of the exclamation mark `!` in a float placement parameter like `\\begin{figure}[!ht]`?",
    "choices": {
      "a": "It forces compilation in draft mode.",
      "b": "It instructs LaTeX to relax internal typographic aesthetic constraints (such as maximum float area or minimum text fraction on a page) to place the float more aggressively.",
      "c": "It suppresses all warnings for that figure.",
      "d": "It forces the image to invert colors."
    },
    "answer": "b",
    "explanation": "LaTeX maintains internal guidelines (e.g., maximum fraction of page occupied by floats). The `!` specifier overrides these strict aesthetic limits, instructing the algorithm to attempt placement even if standard float thresholds are exceeded."
  },
  {
    "id": 94,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Hard",
    "question": "A student writes: `\\begin{figure}[h] \\label{fig:mesh} \\includegraphics{mesh.png} \\caption{The finite element mesh.} \\end{figure}`. In the text, `Figure~\\ref{fig:mesh}` renders as 'Figure 3' instead of 'Figure 1', where 3 is the section number. What caused this defect?",
    "choices": {
      "a": "The compiler is out of date.",
      "b": "The `\\label` command was placed before the `\\caption`, causing LaTeX to capture the current section counter rather than the figure counter.",
      "c": "The image file format `.png` resets counters.",
      "d": "The `[h]` placement specifier forced an automatic increment."
    },
    "answer": "b",
    "explanation": "Because `\\caption` generates and steps the figure counter (`\\refstepcounter{figure}`), placing `\\label{fig:mesh}` before `\\caption` binds the label to whatever counter was active before entering the figure (namely, Section 3). Moving `\\label` below `\\caption` fixes the bug."
  },
  {
    "id": 95,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Hard",
    "question": "When long floating figures or tables migrate past the end of their relevant section into subsequent unrelated chapters, what command can force all pending floats to flush immediately?",
    "choices": {
      "a": "`\\newpage`",
      "b": "`\\clearpage` (or `\\FloatBarrier` from the `placeins` package)",
      "c": "`\\flush`",
      "d": "`\\endfloat`"
    },
    "answer": "b",
    "explanation": "`\\clearpage` flushes all pending floats in the queue, printing them before starting a fresh page. In addition, the `placeins` package provides `\\FloatBarrier` to prevent floats from drifting past a specified boundary."
  },
  {
    "id": 96,
    "topic": "Floats, Tables & Figures",
    "difficulty": "Hard",
    "question": "What is the purpose of providing an optional bracketed argument to `\\caption`, as in: `\\caption[Short title for List of Figures]{Very long comprehensive caption describing experimental methods in detail...}`?",
    "choices": {
      "a": "The bracketed text is printed only when compiled on mobile devices.",
      "b": "The optional argument provides a concise title for the Table of Figures (`\\listoffigures`), preventing the multiline detailed caption from cluttering the front matter.",
      "c": "It specifies alternate alt-text for screen readers.",
      "d": "It creates a tooltip over the image."
    },
    "answer": "b",
    "explanation": "If a figure has an extensive, two-paragraph caption, that entire text would otherwise appear in the List of Figures. Passing `\\caption[Short title]{Long caption}` puts the short version into the List of Figures while printing the full caption under the float."
  },
  {
    "id": 97,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Easy",
    "question": "Which single command in the document body generates the automatic Table of Contents in LaTeX?",
    "choices": {
      "a": "`\\makecontents`",
      "b": "`\\tableofcontents`",
      "c": "`\\printtoc`",
      "d": "`\\begin{toc}`"
    },
    "answer": "b",
    "explanation": "`\\tableofcontents` parses the `.toc` auxiliary file generated during the previous compilation pass and typesets the document's structured table of contents."
  },
  {
    "id": 98,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Easy",
    "question": "Which commands generate the automated List of Figures and List of Tables in a LaTeX report or book?",
    "choices": {
      "a": "`\\figureslist` and `\\tableslist`",
      "b": "`\\listoffigures` and `\\listoftables`",
      "c": "`\\printfigures` and `\\printtables`",
      "d": "`\\makelist{figures}` and `\\makelist{tables}`"
    },
    "answer": "b",
    "explanation": "`\\listoffigures` reads the `.lof` file to print the list of figures, and `\\listoftables` reads the `.lot` file to print the list of tables."
  },
  {
    "id": 99,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Easy",
    "question": "What is the basic syntax pair used to define an anchor point and subsequently reference its generated number in LaTeX?",
    "choices": {
      "a": "`\\anchor{key}` and `\\target{key}`",
      "b": "`\\label{key}` and `\\ref{key}`",
      "c": "`\\set{key}` and `\\get{key}`",
      "d": "`\\tag{key}` and `\\cite{key}`"
    },
    "answer": "b",
    "explanation": "Cross-referencing in LaTeX is built on the `\\label{key}` (which marks the target element) and `\\ref{key}` (which displays the generated number of that labeled element) paradigm."
  },
  {
    "id": 100,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Easy",
    "question": "When referencing a numbered equation using the `amsmath` package, why is `\\eqref{eq:quadratic}` preferred over `\\ref{eq:quadratic}`?",
    "choices": {
      "a": "`\\eqref` converts the reference into an interactive 3D plot.",
      "b": "`\\eqref` automatically wraps the equation number in upright parentheses (e.g., '(2.4)') even in italic theorem environments, whereas `\\ref` prints the bare number '2.4'.",
      "c": "`\\ref` only works for sections, never equations.",
      "d": "`\\eqref` recalculates the numerical solution of the equation."
    },
    "answer": "b",
    "explanation": "`amsmath`'s `\\eqref{key}` formats the equation number with parentheses (e.g., `(1)`) in upright roman text, matching academic mathematical convention. With plain `\\ref{key}`, the author would have to manually type `(\\ref{key})`."
  },
  {
    "id": 101,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Easy",
    "question": "Which command produces the printed page number on which a labeled object appears?",
    "choices": {
      "a": "`\\refpage{key}`",
      "b": "`\\pageref{key}`",
      "c": "`\\page{key}`",
      "d": "`\\getpage{key}`"
    },
    "answer": "b",
    "explanation": "While `\\ref{key}` returns the item number (e.g., 'Theorem 4.2'), `\\pageref{key}` returns the physical page number on which the labeled item is printed (e.g., 'page 17')."
  },
  {
    "id": 102,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Easy",
    "question": "Which set of semantic prefix conventions is widely recommended for label keys to maintain clarity in large LaTeX documents?",
    "choices": {
      "a": "`sec:` for sections, `eq:` for equations, `thm:` for theorems, `fig:` for figures, `tab:` for tables",
      "b": "`1:` for sections, `2:` for equations, `3:` for theorems",
      "c": "`a:` for sections, `b:` for equations, `c:` for theorems",
      "d": "`title:`, `body:`, `end:`"
    },
    "answer": "a",
    "explanation": "Using standard semantic prefixes such as `sec:intro`, `eq:euler`, `thm:cauchy`, `fig:residual-plot`, and `tab:parameters` prevents duplicate label collision and makes the source code intuitive to read and edit."
  },
  {
    "id": 103,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Medium",
    "question": "Why does typing `Equation~\\eqref{eq:bayes}` with a tilde `~` represent good technical typesetting practice?",
    "choices": {
      "a": "The tilde italicizes the equation number.",
      "b": "The tilde inserts a non-breaking space (tie), preventing an awkward line wrap between the word 'Equation' and the number '(1)'.",
      "c": "The tilde is required by `pdflatex` to parse macro arguments.",
      "d": "The tilde makes the equation number bold."
    },
    "answer": "b",
    "explanation": "In LaTeX, `~` inserts an unbreakable horizontal space. Placing it between a noun and its cross-reference (e.g., `Section~\\ref{sec:1}`, `Table~\\ref{tab:results}`) prevents the noun from staying on one line while the number wraps to the beginning of the next line."
  },
  {
    "id": 104,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Medium",
    "question": "How can an author limit the depth of sections displayed in the Table of Contents to only `\\section` and `\\subsection` (excluding `\\subsubsection`)?",
    "choices": {
      "a": "`\\setdepth{2}`",
      "b": "`\\setcounter{tocdepth}{2}`",
      "c": "`\\toclevel{subsection}`",
      "d": "`\\exclude{subsubsection}`"
    },
    "answer": "b",
    "explanation": "The counter `tocdepth` determines which structural levels are included in the Table of Contents. Setting `\\setcounter{tocdepth}{2}` includes down to `\\subsection` (level 2) while excluding `\\subsubsection` (level 3)."
  },
  {
    "id": 105,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Medium",
    "question": "In the manual bibliography environment `\\begin{thebibliography}{99} ... \\end{thebibliography}`, what does the argument `{99}` represent?",
    "choices": {
      "a": "The maximum allowable number of references in the document.",
      "b": "A template string whose printed width establishes the indentation allocated for reference label numbers in the margin.",
      "c": "The publication year of the primary reference.",
      "d": "The font point size for citations."
    },
    "answer": "b",
    "explanation": "The argument to `thebibliography` is not a counter; it is a width template. `{9}` reserves enough horizontal margin indent for single-digit citation numbers ($1-9$), while `{99}` reserves space for two-digit numbers ($1-99$)."
  },
  {
    "id": 106,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Medium",
    "question": "Which command inserts a citation key into the text (e.g., producing '[12]'), and where is that key defined in a manual bibliography?",
    "choices": {
      "a": "`\\ref{key}` defined by `\\item{key}`",
      "b": "`\\cite{key}` defined by `\\bibitem{key}`",
      "c": "`\\bibcite{key}` defined by `\\entry{key}`",
      "d": "`\\quote{key}` defined by `\\source{key}`"
    },
    "answer": "b",
    "explanation": "Citations are invoked in text using `\\cite{citekey}`. In a manual `thebibliography` environment, each bibliographic entry is marked with `\\bibitem{citekey}`."
  },
  {
    "id": 107,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Medium",
    "question": "What is the standard four-step command sequence required to fully compile a LaTeX document using an external BibTeX database (`references.bib`)?",
    "choices": {
      "a": "`pdflatex -> bibtex -> pdflatex -> pdflatex`",
      "b": "`bibtex -> pdflatex -> bibtex -> pdflatex`",
      "c": "`pdflatex -> pdflatex`",
      "d": "`bibtex -> compile`"
    },
    "answer": "a",
    "explanation": "Step 1: `pdflatex` records citation keys into the `.aux` file. Step 2: `bibtex` parses `.aux` and reads `.bib` to generate formatted bibliography file `.bbl`. Step 3: `pdflatex` reads `.bbl` and links entries. Step 4: `pdflatex` resolves all cross-references."
  },
  {
    "id": 108,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Medium",
    "question": "Which command specifies the formatting style (such as `plain`, `abbrv`, or `alpha`) for BibTeX bibliographies in the document?",
    "choices": {
      "a": "`\\setbib{plain}`",
      "b": "`\\bibliographystyle{plain}`",
      "c": "`\\style{bibtex}{plain}`",
      "d": "`\\bibliographyformat{plain}`"
    },
    "answer": "b",
    "explanation": "`\\bibliographystyle{stylename}` (e.g. `plain`, `unsrt`, `alpha`, `siam`) instructs BibTeX which `.bst` style file to apply when formatting bibliographic citations."
  },
  {
    "id": 109,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Medium",
    "question": "How do you suppress an equation line from receiving a number in an otherwise numbered `align` environment?",
    "choices": {
      "a": "`\\skipnumber`",
      "b": "`\\notag` (or `\\nonumber`)",
      "c": "`\\hidenumber`",
      "d": "`\\nonum`"
    },
    "answer": "b",
    "explanation": "In `amsmath` multi-line environments like `align`, appending `\\notag` or `\\nonumber` before the row ending `\\\\` suppresses the number for that specific line while numbering the others."
  },
  {
    "id": 110,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Hard",
    "question": "Which of the following represents a syntactically valid BibTeX entry for an academic journal article?",
    "choices": {
      "a": "@article{knuth1984,\n  author  = {Donald E. Knuth},\n  title   = {Literate Programming},\n  journal = {The Computer Journal},\n  year    = {1984},\n  volume  = {27},\n  number  = {2},\n  pages   = {97--111}\n}",
      "b": "\\begin{article}{knuth1984}\n  author: Donald E. Knuth\n  title: Literate Programming\n\\end{article}",
      "c": "@paper[knuth1984]: \"Literate Programming\" by Donald E. Knuth in Comp. J. (1984)",
      "d": "bibitem{knuth1984}{Donald E. Knuth, Literate Programming, 1984}"
    },
    "answer": "a",
    "explanation": "Standard BibTeX syntax uses `@entrytype{citationkey, field = {value}, ...}` where fields like `author`, `title`, `journal`, and `year` are enclosed in quotes or curly braces."
  },
  {
    "id": 111,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Hard",
    "question": "Why do title fields in BibTeX entries often wrap proper nouns in curly braces, such as `title = {An introduction to {Gaussian} elimination}`?",
    "choices": {
      "a": "To make the word bold.",
      "b": "Many bibliography styles automatically convert article titles to sentence lowercase; enclosing proper nouns or acronyms in braces protects their uppercase capitalization.",
      "c": "To create a hyperlink to Wikipedia.",
      "d": "Because BibTeX cannot parse vowels unless grouped."
    },
    "answer": "b",
    "explanation": "Styles like `plain` downcase titles to conform to title capitalization rules (e.g. 'An introduction to gaussian elimination'). To preserve capitalization for proper names, acronyms, or formulas (e.g. `{Gaussian}`, `{Markov}`, `{DNA}`), authors enclose them in curly braces."
  },
  {
    "id": 112,
    "topic": "Content Lists, Cross-Referencing & Bibliographies",
    "difficulty": "Hard",
    "question": "What is the primary operational difference between `\\ref{sec:methods}` and `\\autoref{sec:methods}` (from the `hyperref` package) or `\\cref{sec:methods}` (from the `cleveref` package)?",
    "choices": {
      "a": "`\\autoref` and `\\cref` automatically infer the type of object being referenced and insert the contextual noun (e.g. 'Section 2', 'Figure 4', 'Theorem 1.1') automatically before the number.",
      "b": "`\\autoref` only references equations.",
      "c": "`\\cref` deletes the label after one compilation.",
      "d": "`\\ref` requires internet access, whereas `\\autoref` operates offline."
    },
    "answer": "a",
    "explanation": "`\\autoref` (from `hyperref`) and `\\cref` (from `cleveref`) look up the internal type of the labeled counter and automatically generate the descriptive name (e.g., 'Section', 'Figure', 'Theorem', 'Lemma'), reducing repetitive typing and preventing noun-number mismatches."
  }
];

if (typeof window !== 'undefined') {
  window.QUESTIONS = QUESTIONS;
}

if (typeof module !== 'undefined') {
  module.exports = QUESTIONS;
}
