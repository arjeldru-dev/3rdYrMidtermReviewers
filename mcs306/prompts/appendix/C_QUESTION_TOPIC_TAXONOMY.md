# Appendix C: Question Topic Taxonomy

The 50 sample questions extracted from the MCS 306 Midterm Examination Reviewer map strictly to the following 7 syllabus categories:

---

## 1. AI Foundations
- **Questions:** 1, 2, 3, 4
- **Core Concepts:** 
  - Definitions of Artificial Intelligence (Thinking vs. Acting, Humanly vs. Rationally)
  - Rational agent view and objective optimization
  - Expected utility maximization in uncertain environments
  - Hybrid AI architectures combining symbolic rules, search, and machine learning

---

## 2. Agents & Environments
- **Questions:** 5, 6, 7, 8, 9, 10
- **Core Concepts:**
  - PEAS framework (Performance measure, Environment, Actuators, Sensors)
  - Percept sequences and perceptual histories
  - Task environment dimensions (Observable, Deterministic, Episodic, Static, Discrete, Single/Multiagent)
  - Agent architectures: Simple reflex, Model-based reflex, Goal-based, Utility-based, and Learning agents

---

## 3. Search Algorithms
- **Questions:** 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21
- **Core Concepts:**
  - Search problem formulation (State space, initial state, actions, transition model, goal test, path cost)
  - Search trees vs. Search graphs, node expansion, redundant paths
  - Uninformed search strategies: Breadth-First Search (FIFO queue), Depth-First Search (LIFO stack), Uniform-Cost Search (priority queue by path cost $g(n)$)
  - Completeness, time complexity, space complexity, and optimality

---

## 4. Informed Search & Heuristics
- **Questions:** 22, 23, 24, 25, 26, 27, 28
- **Core Concepts:**
  - Heuristic evaluation functions $h(n)$
  - Greedy Best-First Search ($f(n) = h(n)$)
  - $A^*$ Search ($f(n) = g(n) + h(n)$)
  - Admissibility condition ($h(n) \le h^*(n)$) for tree search optimality
  - Consistency / Monotonicity condition ($h(n) \le c(n, a, n') + h(n')$) for graph search optimality
  - Local search: Hill climbing, local maxima, plateaus, random restart

---

## 5. Constraint Satisfaction Problems (CSP)
- **Questions:** 29, 30, 31, 32, 33, 34, 35, 36, 37
- **Core Concepts:**
  - CSP components: Variables, Domains, Constraints
  - Constraint propagation and Arc Consistency (AC-3)
  - Forward checking
  - Variable and value ordering heuristics: Minimum Remaining Values (MRV / most constrained variable), Degree heuristic, Least Constraining Value (LCV)
  - Backtracking search for CSPs

---

## 6. Logic & Knowledge Representation
- **Questions:** 38, 39, 40, 41, 42, 43, 44, 45, 46, 47
- **Core Concepts:**
  - Propositional Logic syntax, semantics, and truth tables
  - Logical entailment ($\alpha \models \beta$), validity, satisfiability
  - First-Order Logic (FOL): Objects, relations, functions, universal ($\forall$) and existential ($\exists$) quantifiers
  - Knowledge engineering and formal ontology representation
  - Conjunctive Normal Form (CNF) conversion

---

## 7. Inference Methods
- **Questions:** 48, 49, 50
- **Core Concepts:**
  - Unification of FOL expressions and Most General Unifier (MGU)
  - Forward chaining (data-driven inference)
  - Backward chaining (goal-directed query evaluation)
  - Resolution refutation (proof by contradiction using resolution principle)
