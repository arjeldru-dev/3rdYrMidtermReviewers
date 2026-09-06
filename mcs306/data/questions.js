/**
 * MCS 306 - Introduction to Artificial Intelligence
 * Midterm Examination Reviewer - 50 Question Bank
 * 
 * Auto-generated and verified question dataset.
 * Supports direct browser script loading (window.QUESTIONS) and CommonJS/Node environments.
 */

const QUESTIONS = [
  {
    "id": 1,
    "question": "Which AI approach is primarily concerned with constructing computational models whose internal processes resemble the way humans actually think?",
    "choices": {
      "a": "Acting rationally",
      "b": "Acting humanly",
      "c": "Thinking humanly",
      "d": "Thinking rationally"
    },
    "answer": "c",
    "topic": "AI Foundations"
  },
  {
    "id": 2,
    "question": "Why can a system be considered intelligent under the rational-agent view even if its behavior does not imitate a person?",
    "choices": {
      "a": "Human behavior is irrelevant because rational agents never use perception.",
      "b": "The criterion is whether the system chooses actions that best achieve its objectives given its information, not whether it behaves exactly like a human.",
      "c": "A rational agent is intelligent only when it can pass a Total Turing Test.",
      "d": "The rational-agent view requires only that the system memorize human responses."
    },
    "answer": "b",
    "topic": "AI Foundations"
  },
  {
    "id": 3,
    "question": "An autonomous greenhouse controller must choose between two actions. Venting now gives a certain utility of 48. Keeping the vents closed gives utility 70 with probability 0.6 and utility 20 with probability 0.4. Under expected-utility maximization, what should the controller do?",
    "choices": {
      "a": "Vent now because a certain outcome is always preferred.",
      "b": "Keep the vents closed because 0.6 > 0.5, without considering utilities.",
      "c": "Keep the vents closed because its expected utility is 0.6(70) + 0.4(20) = 50, which exceeds 48.",
      "d": "Vent now because the expected utility of waiting is 0.6(70) = 42."
    },
    "answer": "c",
    "topic": "AI Foundations"
  },
  {
    "id": 4,
    "question": "A warehouse system uses A* to plan routes, a neural network to recognize damaged packages, and symbolic rules to prohibit unsafe robot motions. What is the best characterization of the system?",
    "choices": {
      "a": "It is a hybrid AI system because different AI paradigms are used for different subtasks.",
      "b": "It is purely symbolic because A* always requires logical inference.",
      "c": "It is purely machine learning because image recognition is present.",
      "d": "It is not an AI system because its components use different representations."
    },
    "answer": "a",
    "topic": "AI Foundations"
  },
  {
    "id": 5,
    "question": "A rescue robot operates in a damaged building where sensor readings are noisy, some actions have uncertain outcomes, safety rules must never be violated, and the robot should improve from experience. Which design is most defensible?",
    "choices": {
      "a": "Use only a simple reflex agent because fast reactions eliminate uncertainty.",
      "b": "Use only a fixed rule table because learning may change behavior.",
      "c": "Use only a deep neural network and allow it to learn all safety constraints from trial and error.",
      "d": "Combine probabilistic state estimation, planning or search, explicit safety constraints, and a learning component under human-defined oversight."
    },
    "answer": "d",
    "topic": "Agents & Environments"
  },
  {
    "id": 6,
    "question": "What is a percept sequence?",
    "choices": {
      "a": "The complete history of percepts received by an agent up to the current time",
      "b": "The list of all actions that are legal in the environment",
      "c": "The performance score accumulated by an agent",
      "d": "A model containing only the agent's most recent action"
    },
    "answer": "a",
    "topic": "Agents & Environments"
  },
  {
    "id": 7,
    "question": "Which statement best explains why a rational action may differ for two agents that receive the same current percept?",
    "choices": {
      "a": "Rationality depends only on the current percept, so their actions cannot differ.",
      "b": "Their percept histories, prior knowledge, available actions, or performance measures may differ.",
      "c": "A rational agent always chooses a random action when two agents disagree.",
      "d": "Rationality is determined only by the physical design of the sensors."
    },
    "answer": "b",
    "topic": "Agents & Environments"
  },
  {
    "id": 8,
    "question": "A chess-playing agent receives the complete board position, chooses legal moves, and plays against an opponent. Under the standard task-environment dimensions, which description is most appropriate?",
    "choices": {
      "a": "Partially observable, episodic, continuous, single-agent",
      "b": "Fully observable, episodic, stochastic, single-agent",
      "c": "Fully observable, sequential, discrete, multiagent",
      "d": "Partially observable, sequential, continuous, multiagent"
    },
    "answer": "c",
    "topic": "Agents & Environments"
  },
  {
    "id": 9,
    "question": "A cleaning robot senses only whether its current square is dirty. It must clean a multiroom floor in which it cannot directly observe dirt in other rooms. Why is a model-based reflex agent more suitable than a simple reflex agent?",
    "choices": {
      "a": "A model-based reflex agent does not require sensors.",
      "b": "It can maintain an internal state representing aspects of the world that are not present in the current percept.",
      "c": "It guarantees an optimal cleaning route without any performance measure.",
      "d": "It converts a partially observable environment into a fully observable physical environment."
    },
    "answer": "b",
    "topic": "Agents & Environments"
  },
  {
    "id": 10,
    "question": "An online shopping agent must choose among products that trade off price, delivery time, reliability, and user preferences. Merely reaching the goal \"buy an item\" is not enough. Which agent architecture is most appropriate?",
    "choices": {
      "a": "Table-driven agent",
      "b": "Simple reflex agent",
      "c": "Goal-based agent that treats every purchase as equally good",
      "d": "Utility-based agent"
    },
    "answer": "d",
    "topic": "Agents & Environments"
  },
  {
    "id": 11,
    "question": "In a search problem, what does the goal test determine?",
    "choices": {
      "a": "The number of successors of a state",
      "b": "The cheapest action leaving a state",
      "c": "Whether a given state satisfies the problem's goal condition",
      "d": "Whether a heuristic is admissible"
    },
    "answer": "c",
    "topic": "Search Algorithms"
  },
  {
    "id": 12,
    "question": "Why can a search tree contain several nodes that correspond to the same underlying state?",
    "choices": {
      "a": "Each state is required to have several different names.",
      "b": "The same state can be reached by different paths, and each tree node records a particular path history.",
      "c": "Search trees ignore actions and store only costs.",
      "d": "A search node and a state are mathematically required to be different values."
    },
    "answer": "b",
    "topic": "Search Algorithms"
  },
  {
    "id": 13,
    "question": "A path contains the transitions S -(3)→ A -(2)→ C -(6)→ G. What is the path cost if path cost is the sum of step costs?",
    "choices": {
      "a": "11",
      "b": "9",
      "c": "8",
      "d": "6"
    },
    "answer": "a",
    "topic": "Search Algorithms"
  },
  {
    "id": 14,
    "question": "A robot-navigation state is represented only by the robot's location. Some doors can be opened only after the robot has picked up a key. What problem does this state representation create?",
    "choices": {
      "a": "The representation is too detailed because location should not be included.",
      "b": "The problem becomes continuous even if all locations are discrete.",
      "c": "The goal test can no longer be defined.",
      "d": "The representation omits whether the key has been acquired, even though that information affects future legal actions."
    },
    "answer": "d",
    "topic": "Search Algorithms"
  },
  {
    "id": 15,
    "question": "Which formulation best represents a robot-delivery task in which the robot must bring a parcel from a depot to Room 5 while respecting battery limitations?",
    "choices": {
      "a": "State: robot location, parcel status, and relevant battery level; actions: feasible moves, pickup, recharge, and drop-off; goal: parcel delivered to Room 5; cost: accumulated travel or energy cost",
      "b": "State: Room 5 only; action: \"deliver\"; goal: any room; cost: zero",
      "c": "State: all possible paths at once; action: choose a heuristic; goal: minimum branching factor; cost: number of states",
      "d": "State: battery level only; action: decrease battery; goal: empty battery; cost: number of rooms"
    },
    "answer": "a",
    "topic": "Search Algorithms"
  },
  {
    "id": 16,
    "question": "Which frontier discipline is used by breadth-first search?",
    "choices": {
      "a": "Last-in, first-out stack order",
      "b": "First-in, first-out queue order",
      "c": "Increasing heuristic value only",
      "d": "Decreasing path-cost order"
    },
    "answer": "b",
    "topic": "Search Algorithms"
  },
  {
    "id": 17,
    "question": "Why can ordinary depth-first search fail to be complete in an infinite-depth state space?",
    "choices": {
      "a": "It cannot expand a node with more than one child.",
      "b": "It always stores every generated node in memory.",
      "c": "It may follow an infinite branch and never return to explore another branch containing a solution.",
      "d": "It requires all step costs to be different."
    },
    "answer": "c",
    "topic": "Search Algorithms"
  },
  {
    "id": 18,
    "question": "Uniform-cost search is applied to a graph with the following directed edges: S -(1)→ A, S -(4)→ B, A -(5)→ G, A -(1)→ C, C -(2)→ G, B -(1)→ G. What least-cost solution should be returned?",
    "choices": {
      "a": "S → A → G with cost 6",
      "b": "S → A → C → G with cost 4",
      "c": "S → B → G with cost 5",
      "d": "S → G with cost 1"
    },
    "answer": "b",
    "topic": "Search Algorithms"
  },
  {
    "id": 19,
    "question": "In graph search, why is it useful to detect states that have already been reached by an equal- or lower-cost path?",
    "choices": {
      "a": "It can prevent redundant exploration and, when handled correctly, avoid keeping a more expensive duplicate path to the same state.",
      "b": "It changes a deterministic problem into a stochastic problem.",
      "c": "It guarantees that depth-first search becomes breadth-first search.",
      "d": "It eliminates the need for a goal test."
    },
    "answer": "a",
    "topic": "Search Algorithms"
  },
  {
    "id": 20,
    "question": "A tree has branching factor 8 and a shallow goal at depth 4. All step costs are equal. Compared with depth-first search, breadth-first search is more likely to find the shallow solution quickly, but what is its principal disadvantage?",
    "choices": {
      "a": "It is not complete.",
      "b": "It cannot operate without a heuristic.",
      "c": "It cannot find goals at depth greater than 1.",
      "d": "Its memory requirement can grow exponentially with the depth of the shallowest solution."
    },
    "answer": "d",
    "topic": "Search Algorithms"
  },
  {
    "id": 21,
    "question": "A puzzle has unit step costs, a finite branching factor, a solution is known to be relatively shallow, and sufficient memory is available. Which uninformed search is the most appropriate if a shortest solution in number of steps is required?",
    "choices": {
      "a": "Depth-first search",
      "b": "Depth-limited search with limit 1",
      "c": "Breadth-first search",
      "d": "Greedy best-first search"
    },
    "answer": "c",
    "topic": "Search Algorithms"
  },
  {
    "id": 22,
    "question": "What evaluation function does A* search use?",
    "choices": {
      "a": "f(n) = g(n) + h(n)",
      "b": "f(n) = h(n) − g(n)",
      "c": "f(n) = g(n)h(n)",
      "d": "f(n) = h(n) only"
    },
    "answer": "a",
    "topic": "Informed Search & Heuristics"
  },
  {
    "id": 23,
    "question": "Which statement correctly relates admissibility and consistency for heuristics used in standard shortest-path search?",
    "choices": {
      "a": "Every admissible heuristic must be perfect.",
      "b": "Every inconsistent heuristic necessarily overestimates at every node.",
      "c": "Consistency and admissibility mean exactly the same inequality.",
      "d": "With h(goal) = 0, consistency is a stronger condition that implies admissibility."
    },
    "answer": "d",
    "topic": "Informed Search & Heuristics"
  },
  {
    "id": 24,
    "question": "The A* frontier contains P: (g, h) = (5, 4), Q: (7, 1), R: (3, 6), T: (6, 4). Which node has the smallest f = g + h value and should be selected next?",
    "choices": {
      "a": "Q",
      "b": "P",
      "c": "R",
      "d": "T"
    },
    "answer": "a",
    "topic": "Informed Search & Heuristics"
  },
  {
    "id": 25,
    "question": "For a particular state n, the true cheapest remaining cost is h*(n) = 9. Which heuristic value at n immediately proves that the heuristic is not admissible?",
    "choices": {
      "a": "h(n) = 0",
      "b": "h(n) = 11",
      "c": "h(n) = 8",
      "d": "h(n) = 9"
    },
    "answer": "b",
    "topic": "Informed Search & Heuristics"
  },
  {
    "id": 26,
    "question": "Greedy best-first search and A* use the same heuristic, but greedy search chooses a very expensive route to a state that appears close to the goal. What property of greedy best-first search most directly explains this behavior?",
    "choices": {
      "a": "It uses only path cost g(n) and ignores the heuristic.",
      "b": "It expands nodes in FIFO order.",
      "c": "It is required to use an admissible heuristic.",
      "d": "It ranks nodes using h(n) without accounting for the cost already paid to reach them."
    },
    "answer": "d",
    "topic": "Informed Search & Heuristics"
  },
  {
    "id": 27,
    "question": "You need an admissible heuristic for a difficult scheduling problem. Which construction principle is most appropriate?",
    "choices": {
      "a": "Add arbitrary positive penalties until the heuristic becomes large.",
      "b": "Estimate the cost of a harder version of the original problem.",
      "c": "Solve or estimate a relaxed version of the problem in which some constraints are removed, and use that relaxed optimum as a lower bound.",
      "d": "Use the cost of the most expensive solution found so far as the heuristic."
    },
    "answer": "c",
    "topic": "Informed Search & Heuristics"
  },
  {
    "id": 28,
    "question": "A hill-climbing solver for the N-queens problem frequently reaches plateaus and local minima. Which modification best increases the chance of finding a solution while keeping memory usage small?",
    "choices": {
      "a": "Replace the evaluation function with breadth-first depth.",
      "b": "Allow limited sideways moves and use random restarts from new initial states.",
      "c": "Store the complete search tree before making the first move.",
      "d": "Reject every move that does not immediately reach a goal."
    },
    "answer": "b",
    "topic": "Informed Search & Heuristics"
  },
  {
    "id": 29,
    "question": "A continuous optimization problem has many local optima. The designer wants a memory-efficient local-search method that sometimes accepts worse states early but becomes less willing to do so over time. Which method best matches this requirement?",
    "choices": {
      "a": "Simulated annealing",
      "b": "Breadth-first search",
      "c": "Uniform-cost search",
      "d": "Strict steepest-ascent hill climbing with no worsening moves"
    },
    "answer": "a",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 30,
    "question": "In the constraint graph of a binary CSP, what does an edge between two variable nodes indicate?",
    "choices": {
      "a": "The variables must have equal domains.",
      "b": "One variable was assigned before the other.",
      "c": "A binary constraint directly relates the two variables.",
      "d": "The variables must take identical values."
    },
    "answer": "c",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 31,
    "question": "What is the purpose of the least-constraining-value heuristic?",
    "choices": {
      "a": "Choose the value that eliminates the most options from neighboring variables.",
      "b": "Prefer the value that leaves the greatest flexibility for the remaining unassigned variables.",
      "c": "Choose the numerically smallest value in every domain.",
      "d": "Select a value only after all other variables have been assigned."
    },
    "answer": "b",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 32,
    "question": "In a map-coloring CSP, D_A = D_B = D_C = {R, G, B}, and A is adjacent to both B and C. After assigning A = R, what does forward checking do to B and C?",
    "choices": {
      "a": "It assigns B = G and C = B immediately.",
      "b": "It removes G and B from both neighboring domains.",
      "c": "It makes no domain changes until every variable is assigned.",
      "d": "It removes R from both D_B and D_C."
    },
    "answer": "d",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 33,
    "question": "For the constraint X ≠ Y, let D_X = {1, 2, 3}, D_Y = {2}. After applying REVISE(X, Y), what is the new domain of X?",
    "choices": {
      "a": "{2}",
      "b": "{1, 2}",
      "c": "{2, 3}",
      "d": "{1, 3}"
    },
    "answer": "d",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 34,
    "question": "During backtracking, two unassigned variables are tied under MRV because each has two remaining values. One variable is connected by constraints to five unassigned neighbors, while the other is connected to only two. Which tie-breaker is normally preferred and why?",
    "choices": {
      "a": "Choose the variable with two neighbors because it is less constrained.",
      "b": "Choose randomly because graph degree has no relation to search.",
      "c": "Choose the variable with five neighbors using the degree heuristic, because it constrains more of the remaining problem.",
      "d": "Choose neither; MRV forbids all tie-breaking rules."
    },
    "answer": "c",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 35,
    "question": "Which CSP formulation is most appropriate for a standard 9×9 Sudoku puzzle?",
    "choices": {
      "a": "One variable for each row, with domain equal to all possible completed grids",
      "b": "One variable for each digit 1–9, with no constraints",
      "c": "One variable for each 3×3 block only, with domain {1, ..., 9}",
      "d": "One variable for each cell, domain {1, ..., 9} restricted by clues, with all-different constraints on every row, column, and 3×3 block"
    },
    "answer": "d",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 36,
    "question": "A hospital must assign nurses to shifts. Each shift requires adequate staffing, no nurse may work two overlapping shifts, and some assignments are discouraged but not forbidden. Which model best captures the problem?",
    "choices": {
      "a": "Use variables for required shift assignments, domains of qualified nurses, hard constraints for coverage and overlap, and a cost or soft-constraint mechanism for preferences.",
      "b": "Use one variable for the entire hospital with domain {0, 1}.",
      "c": "Use pathfinding states containing only the current time and ignore nurse identity.",
      "d": "Use a CSP with no constraints and evaluate the schedule only after all assignments are made."
    },
    "answer": "a",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 37,
    "question": "A dense CSP has many interacting binary constraints, and plain backtracking repeatedly discovers contradictions only after making several additional assignments. If extra inference per node is affordable, which improvement is most appropriate?",
    "choices": {
      "a": "Disable propagation to avoid changing domains.",
      "b": "Maintain arc consistency after assignments so unsupported values are removed earlier.",
      "c": "Always choose the variable with the largest domain.",
      "d": "Convert every constraint into a heuristic for greedy best-first search."
    },
    "answer": "b",
    "topic": "Constraint Satisfaction"
  },
  {
    "id": 38,
    "question": "A propositional sentence is valid when",
    "choices": {
      "a": "it is false in every interpretation.",
      "b": "it appears explicitly in a knowledge base.",
      "c": "it is true in every model or interpretation.",
      "d": "it contains at least one implication symbol."
    },
    "answer": "c",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 39,
    "question": "What is the key difference between semantic entailment KB ⊨ α and syntactic derivability KB ⊢ α?",
    "choices": {
      "a": "Entailment is defined in terms of truth in models, while derivability is defined by applying formal inference rules.",
      "b": "Entailment applies only to first-order logic, while derivability applies only to propositional logic.",
      "c": "Derivability is a property of models, while entailment is a property of algorithms.",
      "d": "There is no conceptual difference; the symbols are interchangeable by definition."
    },
    "answer": "a",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 40,
    "question": "Let P = False, Q = True, and R = False. What is the truth value of (P ∨ Q) ∧ (¬R)?",
    "choices": {
      "a": "False, because P is false.",
      "b": "True",
      "c": "False, because R is false.",
      "d": "Undefined"
    },
    "answer": "b",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 41,
    "question": "Let KB = {P ∨ Q, P → R, Q → R}. Which conclusion is semantically entailed by KB?",
    "choices": {
      "a": "P",
      "b": "Q",
      "c": "¬R",
      "d": "R"
    },
    "answer": "d",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 42,
    "question": "Assume the domain contains people and books. Let Prof(x) mean \"x is a professor\" and Rec(x, b) mean \"x recommends b.\" Which formula best represents \"Every professor recommends at least one book\"?",
    "choices": {
      "a": "∃x (Prof(x) ∧ ∀b Rec(x, b))",
      "b": "∀x (Prof(x) → ∃b (Book(b) ∧ Rec(x, b)))",
      "c": "∀x ∀b ((Prof(x) ∧ Book(b)) → Rec(x, b))",
      "d": "∃b (Book(b) ∧ ∀x (Prof(x) → Rec(x, b)))"
    },
    "answer": "b",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 43,
    "question": "A knowledge engineer must represent rules about arbitrary numbers of students, courses, instructors, and relationships such as teaches and enrolled-in. Which representation is generally more suitable than pure propositional logic?",
    "choices": {
      "a": "First-order logic, because variables, predicates, functions, and quantifiers can express general relational statements compactly.",
      "b": "A single propositional symbol representing the entire university.",
      "c": "A breadth-first search tree, because quantification is a search problem.",
      "d": "A utility table, because relations are numerical preferences."
    },
    "answer": "a",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 44,
    "question": "What is a most general unifier (MGU)?",
    "choices": {
      "a": "A substitution that makes two expressions different in as many places as possible",
      "b": "A substitution that replaces every variable by a new constant",
      "c": "A unifying substitution that imposes no unnecessary additional bindings beyond those required for unification",
      "d": "A truth assignment that satisfies every propositional sentence"
    },
    "answer": "c",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 45,
    "question": "Why is forward chaining often described as data-driven inference?",
    "choices": {
      "a": "It begins from known facts and repeatedly applies rules whose premises become satisfied to derive new facts.",
      "b": "It begins from the query and recursively generates only the subgoals needed to prove it.",
      "c": "It ignores facts until a contradiction is found.",
      "d": "It always searches backward through a proof tree."
    },
    "answer": "a",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 46,
    "question": "Find an MGU for the two atoms Knows(x, Parent(x)), Knows(Ana, Parent(Ana)).",
    "choices": {
      "a": "{x/Parent(Ana)}",
      "b": "{Ana/x, Parent/x}",
      "c": "Unification fails because the expressions contain a function symbol.",
      "d": "{x/Ana}"
    },
    "answer": "d",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 47,
    "question": "Consider the clauses ¬Student(x) ∨ Studies(x), Student(Mia). What resolvent is obtained using the appropriate substitution?",
    "choices": {
      "a": "¬Studies(Mia)",
      "b": "Student(x) ∨ Studies(x)",
      "c": "Studies(Mia)",
      "d": "The empty clause immediately"
    },
    "answer": "c",
    "topic": "Logic & Knowledge Representation"
  },
  {
    "id": 48,
    "question": "A rule base contains Registered(x) ∧ Paid(x) → Cleared(x), Cleared(x) ∧ Prereq(x) → MayEnroll(x). It also contains the facts Registered(Lia), Paid(Lia), and Prereq(Lia). Which forward-chaining sequence correctly derives the target?",
    "choices": {
      "a": "Derive Cleared(Lia) first, then use it with Prereq(Lia) to derive MayEnroll(Lia).",
      "b": "Derive MayEnroll(Lia) directly without using any rule premise.",
      "c": "Negate Registered(Lia) and resolve it with Paid(Lia).",
      "d": "Replace Lia by a new Skolem function before applying the rules."
    },
    "answer": "a",
    "topic": "Inference Methods"
  },
  {
    "id": 49,
    "question": "Suppose a backward-chaining system is asked to prove Eligible(Kai) and has the rules Completed(x) ∧ Good(x) → Eligible(x), PassedCore(x) → Completed(x). Which subgoals should the system pursue first after matching the first rule with the query?",
    "choices": {
      "a": "Eligible(x) and PassedCore(x)",
      "b": "Completed(Kai) and Good(Kai)",
      "c": "¬Completed(Kai) and ¬Good(Kai)",
      "d": "PassedCore(x) only, without instantiating x"
    },
    "answer": "b",
    "topic": "Inference Methods"
  },
  {
    "id": 50,
    "question": "A first-order knowledge base contains many general clauses that are not restricted to definite Horn form, and the objective is to establish whether a proposed conclusion follows by contradiction. Which inference method is most appropriate among the following?",
    "choices": {
      "a": "Simple reflex execution",
      "b": "Hill climbing",
      "c": "Forward chaining restricted to definite clauses only",
      "d": "First-order resolution with unification after adding the negation of the goal"
    },
    "answer": "d",
    "topic": "Inference Methods"
  }
];

// Browser global support
if (typeof window !== 'undefined') {
  window.QUESTIONS = QUESTIONS;
}

// Node.js CommonJS support
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QUESTIONS;
}
