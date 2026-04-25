# Meeting roleplay requirements

Meeting roleplays are the primary way this app tests applied architectural judgement. They must be genuinely difficult. They exist to expose gaps in thinking, not to confirm what the user already knows.

---

## Purpose

Roleplays test whether the user can behave like an architect **in the room**: under time pressure, with incomplete information, surrounded by stakeholders pushing plausible but wrong ideas. The user is not just recalling facts — they are making live decisions about framing, scope, and communication.

The skills tested must match the skills developed by the other areas of the app:

- Using the problem-framing pattern: name the domain, present a simple / platform / heavyweight spectrum, anchor on criteria
- Resisting scope creep and the "while we're at it" move
- Translating business slogans into requirements
- Applying the 5 decision criteria: volatility, ownership, audit, latency, reuse
- Handling architecture overreach: event sourcing, canonical models, one workflow engine, premature standardisation, future-proofing
- Separating authentication from business authorization
- Separating operational reporting from cross-domain analytics
- Naming the simpler option and forcing the room to justify the heavier one
- Summarising and closing meetings correctly

---

## Scenario design

### Context framing

Each scenario must open with a realistic meeting context: who is in the room, what the business driver is, and what pressure is in play. The context should feel like a real meeting, not a textbook case study.

The meeting must involve credible stakeholders — VPs, CTOs, PMs, engineering managers, senior developers — with distinct and sometimes conflicting interests. The pressure they apply should reflect real organisational dynamics (board deadlines, cost mandates, competitive anxiety, platform politics).

### Question design

Each scenario should contain 5–6 questions. Questions should escalate in difficulty as the scenario progresses — early questions establish framing; later questions test pressure-handling and closing.

Each question must represent a genuine decision point the architect faces in the room. Questions should test **live judgement**, not knowledge retrieval.

**Question types that work well:**

- A stakeholder pushes a heavyweight option disguised as a reasonable proposal. The architect must recognise the pattern and reframe it.
- A simpler option has been identified but a credible voice argues against it. The architect must defend or update their position based on actual criteria, not social pressure.
- A new concern is introduced mid-discussion that could derail the agreed direction. The architect must handle scope creep without looking obstructive.
- The room reaches a decision and looks to the architect for closure. The architect must summarise correctly without deferring or gold-plating.
- A slogan is deployed ("we need AI for this", "make it real-time", "put it in the shared platform"). The architect must translate it into a requirement before responding to it.

---

## Answer design

### Correct answers

The correct answer must demonstrate the architect's framing pattern clearly. It should:

- Name or separate the actual problem before proposing a solution
- Present or reference the spectrum of options
- Apply at least one of the 5 criteria (volatility, ownership, audit, latency, reuse)
- Hold a defensible position without being obstructive or aggressive

The correct answer must not be the longest option. It should feel like something a confident, prepared person would say in a meeting — not a written design document read aloud.

### Wrong answers

Wrong answers must be genuinely plausible. There must be exactly one wrong answer per archetypal failure mode, chosen from this list:

**Failure mode A — over-agreement:** The answer accepts the proposal uncritically, starts planning the implementation, or defers to authority without testing assumptions. This sounds competent and cooperative but skips the critical framing step.

**Failure mode B — correct instinct, wrong execution:** The answer identifies the right concern but states it poorly — too blunt, too abstract, or without offering a framework. This makes the architect look obstructive or unprepared rather than rigorous.

**Failure mode C — unnecessary deferral:** The answer proposes taking an action, gathering data, or scheduling a follow-up when the architect already has enough information to frame the decision in the room. This loses control of the meeting at the moment it matters most.

**Failure mode D — scope explosion:** The answer agrees to couple two unrelated concerns, accept a "while we're at it" addition, or commit to a heavier approach because it feels more thorough. This looks ambitious but creates delivery risk and architectural debt.

**Each question must use two of these failure modes as its wrong answers.** Do not repeat the same pair of failure modes across consecutive questions in the same scenario.

### Answer length balance

Wrong answers must not be consistently longer or shorter than the correct answer. The correct answer is often shorter than a wrong answer demonstrating over-agreement (which tends to be verbose), and often longer than a wrong answer demonstrating unnecessary deferral (which punts early). Vary the lengths deliberately so that length is never a signal for correctness.

### Language balance

Wrong answers must not be identifiable by tone alone. They should not use uniformly weak, passive, or hedging language. A wrong answer that demonstrates over-agreement should sound confident and professional. A wrong answer that demonstrates correct-instinct/wrong-execution should sound technically strong. The user must be forced to evaluate the **substance** of each option, not its register.

Do not include words like "actually", "just", "simply", or "obviously" in any option — they signal the intended answer.

Do not end any option with an appeal for validation (e.g., "Does that make sense?", "Happy to discuss further.") — these are tells.

---

## Explanation design

Every explanation must:

- State clearly why the correct answer is right, with reference to the specific playbook skill it demonstrates
- State clearly why each wrong answer is wrong, naming the specific failure mode and why it matters in practice
- Avoid generic praise ("Great answer!") — the explanation should read like a brief coaching note

The explanation for a wrong answer must acknowledge what is reasonable about it before naming the flaw. The user should finish reading and think "yes, I can see why that seemed right — and why it wasn't."

---

## Difficulty requirements

A scenario fails the difficulty test if any of these are true:

- The correct answer is the only one that addresses the question at all
- The correct answer uses significantly more technical vocabulary than the wrong answers
- The wrong answers contain obvious errors or strawman thinking that no real professional would say
- The correct answer is the longest option in more than two questions per scenario
- The correct answer is the shortest option in more than two questions per scenario
- All three options for any question have roughly the same length
- The user can identify the correct answer by elimination (both wrong answers have obvious tells)

The difficulty bar to aim for: a user who has read and understood the playbook material should get roughly 60–70% of questions right on first attempt. A user who has not read the material should not score significantly above chance.

---

## Scope and domain alignment

Scenarios must stay within the domain covered by the rest of the app: Azure-based HR, payroll, talent, and absence platforms. The meeting problems must be realistic for this context — architecture decisions an architect at a mid-to-large organisation would genuinely face when working on these systems.

Each new scenario must test a distinct primary skill from the playbook. Before writing a scenario, identify:

1. The primary architectural skill being tested (e.g., separating integration from domain orchestration)
2. The secondary skill tested by at least two questions (e.g., handling overreach, closing correctly)
3. The stakeholder combination and business pressure that makes the scenario feel real

Do not write a scenario that tests the same primary skill as an existing scenario unless it approaches it from a meaningfully different angle (different domain, different stakeholder dynamics, different overreach pattern).

---

## Checklist before publishing a scenario

- [ ] The context reads like a real meeting, not a worked example
- [ ] The question chain escalates in difficulty
- [ ] Every correct answer demonstrates a named playbook skill
- [ ] Every wrong answer maps to a named failure mode
- [ ] No option — correct or wrong — relies on length or language register as a signal
- [ ] The explanation for each wrong answer acknowledges what is reasonable about it
- [ ] The scenario tests a primary skill not already covered by existing scenarios, or covers it from a materially different angle
- [ ] A technically strong person who has not studied the playbook would find at least two questions genuinely difficult
