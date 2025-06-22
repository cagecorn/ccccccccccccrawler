import { BowAI, SpearAI, SwordAI, WhipAI, DaggerAI } from '../src/micro/WeaponAI.js';
import { describe, test, assert } from './helpers.js';

const mapStub = { tileSize: 1, isWallAt: () => false };

describe('WeaponAI', () => {
  test('BowAI uses charge shot at mid range', () => {
    const ai = new BowAI();
    const wielder = { x: 0, y: 0, attackRange: 20, effects: [] };
    const weapon = { weaponStats: { canUseSkill: () => true } };
    const enemy = { x: 15, y: 0 };
    const action = ai.decideAction(wielder, weapon, { enemies: [enemy], mapManager: mapStub });
    assert.strictEqual(action.type, 'weapon_skill');
    assert.strictEqual(action.skillId, 'charge_shot');
  });

  test('SpearAI charges when enemy out of range', () => {
    const ai = new SpearAI();
    const wielder = { x: 0, y: 0, attackRange: 10 };
    const weapon = { weaponStats: { canUseSkill: () => true } };
    const enemy = { x: 25, y: 0 };
    const action = ai.decideAction(wielder, weapon, { enemies: [enemy], mapManager: mapStub });
    assert.strictEqual(action.type, 'weapon_skill');
    assert.strictEqual(action.skillId, 'charge');
  });

  test('SwordAI uses parry stance when recovering attack cooldown', () => {
    const ai = new SwordAI();
    const wielder = { x: 0, y: 0, attackRange: 10, attackCooldown: 5 };
    const weapon = { weaponStats: { canUseSkill: (id) => id === 'parry_stance' } };
    const enemy = { x: 8, y: 0 };
    const action = ai.decideAction(wielder, weapon, { enemies: [enemy], mapManager: mapStub });
    assert.strictEqual(action.type, 'weapon_skill');
    assert.strictEqual(action.skillId, 'parry_stance');
  });

  test('WhipAI uses pull when target within skill range', () => {
    const ai = new WhipAI();
    const wielder = { x: 0, y: 0, attackRange: 10, properties: { mbti: 'INTP' } };
    const weapon = { weaponStats: { canUseSkill: () => true } };
    const enemy = { x: 30, y: 0, hp: 5 };
    const action = ai.decideAction(wielder, weapon, { enemies: [enemy], mapManager: mapStub });
    assert.strictEqual(action.type, 'weapon_skill');
    assert.strictEqual(action.skillId, 'pull');
  });

  test('WhipAI with T-type personality targets weakest enemy', () => {
    const ai = new WhipAI();
    const wielder = { x: 0, y: 0, attackRange: 10, properties: { mbti: 'INTJ' } };
    const weapon = { weaponStats: { canUseSkill: () => true } };
    const weak = { x: 25, y: 0, hp: 3 };
    const strong = { x: 24, y: 0, hp: 8 };
    const action = ai.decideAction(wielder, weapon, { enemies: [weak, strong], mapManager: mapStub });
    assert.strictEqual(action.type, 'weapon_skill');
    assert.strictEqual(action.skillId, 'pull');
    assert.strictEqual(action.target, weak);
  });

  test('DaggerAI moves directly to enemy when facing data missing', () => {
    const ai = new DaggerAI();
    const wielder = { x: 0, y: 0, attackRange: 5 };
    const enemy = { x: 12, y: 0 }; // no facing property
    const action = ai.decideAction(wielder, {}, { enemies: [enemy], mapManager: mapStub });
    assert.strictEqual(action.type, 'move');
    assert.deepStrictEqual(action.target, { x: enemy.x, y: enemy.y });
  });
});
