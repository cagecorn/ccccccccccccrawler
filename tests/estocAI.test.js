import { EstocAI } from '../src/micro/WeaponAI.js';
import { describe, test, assert } from './helpers.js';

const contextBase = { mapManager: { tileSize: 1, isWallAt: () => false } };

describe('EstocAI', () => {
    test('approach and attack', () => {
        const ai = new EstocAI();
        const wielder = { x: 0, y: 0, attackRange: 10 };
        const enemy = { x: 20, y: 0 };

        let action = ai.decideAction(wielder, {}, { enemies: [enemy], ...contextBase });
        assert.strictEqual(action.type, 'move');
        assert.strictEqual(action.target, enemy);

        wielder.x = 15; // now within range
        action = ai.decideAction(wielder, {}, { enemies: [enemy], ...contextBase });
        assert.strictEqual(action.type, 'attack');
        assert.strictEqual(wielder.aiState, 'retreating');
    });

    test('retreat after attack', () => {
        const ai = new EstocAI();
        const wielder = { x: 15, y: 0, attackRange: 10, aiState: 'retreating', aiStateTimer: 30 };
        const enemy = { x: 20, y: 0 };

        const action = ai.decideAction(wielder, {}, { enemies: [enemy], ...contextBase });
        assert.strictEqual(action.type, 'move');
        assert.ok(action.target.x < wielder.x);
        assert.ok(wielder.aiStateTimer < 30);
    });

    test('re-engage after retreat', () => {
        const ai = new EstocAI();
        const wielder = { x: 15, y: 0, attackRange: 10, aiState: 'retreating', aiStateTimer: 2 };
        const enemy = { x: 20, y: 0 };

        ai.decideAction(wielder, {}, { enemies: [enemy], ...contextBase });
        wielder.x = 12; // move away
        ai.decideAction(wielder, {}, { enemies: [enemy], ...contextBase });
        wielder.x = 9; // out of range
        ai.decideAction(wielder, {}, { enemies: [enemy], ...contextBase });

        assert.strictEqual(wielder.aiState, null);

        const action = ai.decideAction(wielder, {}, { enemies: [enemy], ...contextBase });
        assert.strictEqual(action.type, 'move');
        assert.strictEqual(action.target, enemy);
    });
});
