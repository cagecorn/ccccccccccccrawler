import { MetaAIManager, STRATEGY } from '../src/managers/ai-managers.js';
import { MeleeAI } from '../src/ai.js';
import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

describe('AI', () => {

test('setGroupStrategy updates strategy', () => {
    const em = new EventManager();
    const aiManager = new MetaAIManager(em);
    const group = aiManager.createGroup('g1', STRATEGY.AGGRESSIVE);
    aiManager.setGroupStrategy('g1', STRATEGY.IDLE);
    assert.strictEqual(group.strategy, STRATEGY.IDLE);
});

test('IDLE strategy prevents movement', () => {
    const em = new EventManager();
    const aiManager = new MetaAIManager(em);
    const mapManager = { tileSize: 1, isWallAt: () => false };
    const pathfindingManager = { findPath: () => [{ x: 1, y: 0 }] };
    const player = { x: 0, y: 0 };
    const group = aiManager.createGroup('g1', STRATEGY.IDLE);
    const enemyGroup = aiManager.createGroup('g2', STRATEGY.AGGRESSIVE);
    const self = { id:'e1', x:0, y:0, width:1, height:1, speed:1, tileSize:1, attackCooldown:0, ai:new MeleeAI(), hp:1 };
    const enemy = { id:'e2', x:1, y:0, width:1, height:1, speed:1, tileSize:1, attackCooldown:0, ai:new MeleeAI(), hp:1 };
    group.addMember(self);
    enemyGroup.addMember(enemy);
    const context = { player, mapManager, pathfindingManager, eventManager: em };
    aiManager.update(context);
    assert.strictEqual(self.x, 0);
    assert.strictEqual(self.y, 0);
});

});
