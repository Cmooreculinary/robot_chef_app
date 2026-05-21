# CLAUDE.md — BCA Coding Guidelines

Karpathy-inspired principles, customized for the Blue Collar Apps (BCA) ecosystem.

---

## The Four Principles

### 1. Think Before Coding

Before writing a single line:
- Ask clarifying questions when the brief is ambiguous
- Surface assumptions explicitly — don't silently pick an interpretation
- Define the success criteria upfront (what does "done" look like?)
- Identify tradeoffs and surface them to the operator before committing to an approach

**Example:**
> Brief: "Build the Permit Pilot agent"
> Response: "Before I build — should the agent auto-calculate renewal deadlines or surface raw expiry dates? What's the jurisdiction data source? How do we handle missing jurisdiction data — fallback or escalate?"

### 2. Simplicity First

- Write the minimum code that solves the problem
- No speculative features, no premature abstractions
- If it can be 50 lines instead of 200, rewrite it
- Optimize for clarity and maintainability over cleverness
- No half-finished implementations — ship complete or don't ship

### 3. Surgical Changes

- Touch only what was asked for
- Do not "improve" adjacent code unless explicitly requested
- Match the existing style and patterns in the codebase
- One concern per commit — don't bundle unrelated changes
- Leave the code cleaner than you found it, but only within the blast radius of the task

### 4. Goal-Driven Execution

- Define verifiable success criteria before implementing
- Loop until criteria are met — don't declare done prematurely
- When blocked or confused, stop and ask — never guess silently
- Strong goals enable independent iteration; vague goals require check-ins

---

## BCA Tech Stack Context

Projects in the BCA ecosystem use:

- **Runtime / Hosting:** Emergent, Vercel, Render
- **Backend:** FastAPI (Python), Node.js
- **Frontend:** React, Next.js
- **Database:** MongoDB, PostgreSQL, Supabase
- **Payments:** Stripe (webhooks must validate signature before processing)
- **AI / Agents:** MCP (Model Context Protocol), Claude API
- **Design:** Trench Design philosophy — functional, operator-first, no decoration for its own sake

### Operator Data Graph

- Always handle missing ODG fields gracefully — don't assume data is present
- Use fallback defaults where safe; escalate to operator where business logic is critical
- Never expose raw ODG errors to end users

### Agent Architecture

- Prefer standalone agents with clear input/output contracts over embedded logic
- Each agent should do one thing well
- Surface partial results rather than failing silently
- Rate-limit and retry on external API calls

### Smart Inbox + Stripe Integration

- Stripe webhooks: always verify `stripe-signature` header before processing
- Smart Inbox events: deduplicate before acting, log raw payloads for auditability
- Financial operations: use idempotency keys on all Stripe API calls

---

## Hospitality Tech Focus

BCA builds for real operators — restaurants, food trucks, venues, hospitality businesses. Code decisions should reflect:

- **Operator time is scarce** — UIs must be obvious, flows must be fast
- **Errors are costly** — handle edge cases explicitly, fail loudly in dev, fail gracefully in prod
- **Compliance matters** — permit deadlines, food safety regulations, and licensing are not optional
- **Agents should augment operators**, not replace judgment on high-stakes decisions

### Domain Examples (Calibrate Your Judgment)

| Agent | Core Job | Watch For |
|-------|----------|-----------|
| Permit Pilot | Route to correct jurisdiction, surface renewal alerts | Missing jurisdiction → escalate, not guess |
| Cost Sentinel | Flag food cost anomalies, alert on margin breach | False positives erode trust — tune thresholds carefully |
| CapKids | Culinary education flows for kids | Age-appropriate content gates, parental consent flows |
| Smart Inbox | Triage operator notifications by urgency | Deduplication, ordering, read/unread state |

---

## Code Quality Checklist

Before marking any task complete:

- [ ] Clarifying questions were asked (or brief was unambiguous)
- [ ] Success criteria were defined upfront
- [ ] Only the requested code was changed
- [ ] No hardcoded secrets or credentials
- [ ] All user inputs validated at system boundaries
- [ ] Error messages don't leak internal state to end users
- [ ] Stripe webhooks validate signature
- [ ] ODG fields handled with null-safety
- [ ] Tests exist for new behavior (80% coverage minimum)
- [ ] No console.log / debug statements left in

---

## What This Changes

**Before:** "Build the permit renewal feature"
→ Assumptions made silently, speculative extensibility added, adjacent code touched

**After:** "Build the permit renewal feature"
1. Clarifying questions asked (data source? fallback? alert threshold?)
2. Success criteria defined (test against 10 real permit scenarios)
3. Minimal implementation built (only what was scoped)
4. Verified against criteria before declaring done

---

## Source

Principles adapted from Andrej Karpathy's coding guidelines.
Customized for BCA Trench Design + hospitality tech stack.
