# Legacy Version Architecture Overview

This document summarizes the structure of the single-file game code found in `(old)failed-game-data/(old)mechanics.js`. It also outlines a cleaner plan for restructuring the project while avoiding the issues present in that legacy version.

## Observations from the Old File

- **Monolithic Script** – Nearly all game logic, from audio playback to monster creation and UI handling, is contained in one ~9000 line JavaScript file.
- **Implicit Globals** – Variables and helper functions are defined directly in the global scope, which can cause unpredictable behavior and makes unit testing very difficult.
- **Tight Coupling** – Gameplay mechanics, rendering logic, data tables, and DOM manipulation are interwoven. Updating one system risks breaking others.
- **Duplicated Data** – Item and skill definitions appear in the same file alongside gameplay routines instead of being imported from dedicated modules.
- **Complex Conditionals** – Many functions contain large branching blocks that handle very specific scenarios, which reduces readability and introduces bugs.

Despite the clutter, the old file provides valuable hints about desired features:

- An audio system with sound effects and background music.
- A catalog of monsters, mercenaries, items, skills, and status effects.
- Basic dungeon generation and pathfinding utilities.
- UI controls for inventory, crafting, and character details.

## Blueprint for a Modular Rewrite

1. **Separate Concerns by Directory**
   - `src/` already houses modular code (`ai.js`, `map.js`, `managers/`, etc.). Continue expanding this approach.
   - Place data-driven content (item lists, skills, monster stats) under `src/data/` as JSON or ES modules.
   - Keep DOM interactions confined to dedicated UI manager modules.

2. **Entity-Centric Managers**
   - Introduce managers for major systems, e.g. `AudioManager`, `MonsterManager`, `ItemManager`, and `UIManager`.
   - Each manager should expose a minimal API and maintain its own internal state.
   - Leverage the hierarchical AI structure described in `agents.md` when coordinating unit actions.

3. **Event-Driven Workflow**
   - Use a central `EventBus` or simple pub/sub pattern so managers can react to in-game events without tight coupling.
   - Example: when a monster dies, emit a `monster:death` event; the loot system and UI can subscribe to update inventory and play sounds.

4. **Strict Module Boundaries**
   - Avoid global mutable variables. Instead, pass required dependencies into functions or classes.
   - Keep rendering code (canvas or DOM manipulation) inside view modules and call them from the main game loop.

5. **Testing and Data Validation**
   - With smaller modules, create targeted unit tests in the `tests/` folder for pathfinding, AI decisions, and item logic.
   - Validate imported JSON/data structures to catch typos or inconsistent fields early.

6. **Gradual Migration Path**
   - Start by isolating clearly defined datasets from the old file into `src/data`.
   - Replace large procedural blocks (combat resolution, inventory management) with new classes while referencing the old logic only for guidance.
   - Ensure the new code adheres to the project’s AI design docs and configuration summaries.

By following this blueprint, the rewritten codebase will be easier to maintain and extend while preserving useful mechanics from the legacy version.
