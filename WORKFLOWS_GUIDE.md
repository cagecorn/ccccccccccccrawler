# Workflows Guide

The `src/workflows.js` module defines reusable game flow helpers. These small
functions coordinate multiple managers via the `EventManager` so that complex
behavior stays readable and testable. As the project grows, place any sequence
of actions that touches more than one manager in this file.

## Purpose
- **Centralize cross-system steps.** Keeping related logic in one workflow
  prevents scattered code and helps the game remain lightweight.
- **Emit events instead of hard dependencies.** Each workflow should publish
  events for other systems to react to. Direct calls are allowed, but events
  make unit tests easier.
- **Example:** `monsterDeathWorkflow(context)` broadcasts `entity_death`,
  applies experience immediately, triggers a loot drop, and finally removes the
  monster. Tests import this workflow to simulate a kill without running the
  entire game loop.

## When to Add a Workflow
1. A feature triggers multiple managers or requires several side effects.
2. The same sequence is repeated in different places.
3. You need a simple way to reproduce a scenario in tests (e.g. hiring,
   leveling up, or quest completion).

Create a new function in `src/workflows.js` and give it a clear name like
`hireMercenaryWorkflow` or `levelUpWorkflow`. Each function should accept a
single `context` object that contains only the data it needs.

## Coding Tips
- Keep workflow functions small. They should orchestrate actions but delegate
  heavy lifting to existing managers.
- Include comments that describe each step. Future contributors should know what
  events or state changes are expected.
- Update or create tests under `tests/` whenever you add a new workflow so that
  other systems can rely on consistent behavior.

By documenting these patterns and growing the workflows file gradually, we can
avoid bloated managers and maintain predictable game loops.
