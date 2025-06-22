import { MetaAIManager } from '../src/managers/ai-managers.js';
import { MeleeAI } from '../src/ai.js';
import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

describe('AI', () => {

test('공격 속도가 빠른 유닛이 먼저 공격', () => {
    const em = new EventManager();
    const aiManager = new MetaAIManager(em);
    const mapManager = { tileSize: 1, isWallAt: () => false };
    const pathfindingManager = { findPath: () => [] };
    const player = { x: 0, y: 0 };

    const groupA = aiManager.createGroup('A');
    const groupB = aiManager.createGroup('B');

    const fast = {
        id: 'fast', x: 0, y: 0, width:1, height:1, tileSize:1, attackCooldown:0,
        ai: new MeleeAI(), hp: 10, attackSpeed: 2,
        visionRange: 5, attackRange: 2,
        stats: { get: (s) => ({ attackRange:2, movementSpeed:1, attackSpeed:2, visionRange:5 }[s] || 0) }
    };
    const slow = {
        id: 'slow', x: 0, y: 0, width:1, height:1, tileSize:1, attackCooldown:0,
        ai: new MeleeAI(), hp: 10, attackSpeed: 1,
        visionRange: 5, attackRange: 2,
        stats: { get: (s) => ({ attackRange:2, movementSpeed:1, attackSpeed:1, visionRange:5 }[s] || 0) }
    };

    groupA.addMember(fast);
    groupB.addMember(slow);

    const order = [];
    em.subscribe('entity_attack', d => order.push(d.attacker.id));

    const context = { player, mapManager, pathfindingManager, eventManager: em, monsterManager:{monsters:[]}, mercenaryManager:{mercenaries:[]} };
    aiManager.update(context);

    assert.strictEqual(order[0], 'fast');
});

});
