import { CombatCalculator } from '../src/combat.js';
import { EventManager } from '../src/managers/eventManager.js';
import { TagManager } from '../src/managers/tagManager.js';
import { describe, test, assert } from './helpers.js';

describe('Combat', () => {

test('피해량 계산 이벤트', () => {
    const eventManager = new EventManager();
    const tagManager = new TagManager();
    const calculator = new CombatCalculator(eventManager, tagManager);
    let eventData = null;
    eventManager.subscribe('damage_calculated', data => { eventData = data; });

    const originalRandom = Math.random;
    Math.random = () => 0; // deterministic roll

    const attacker = {
        attackPower: 3,
        equipment: { weapon: {} },
        stats: { get: () => 0 },
    };
    const defender = { stats: { get: (s) => (s === 'defense' ? 1 : 0) } };

    calculator.handleAttack({ attacker, defender, skill: null });

    Math.random = originalRandom;

    assert.ok(eventData, '이벤트 수신 여부');
    assert.strictEqual(eventData.damage, 2);
    assert.strictEqual(eventData.attacker, attacker);
    assert.strictEqual(eventData.defender, defender);
    assert.ok(eventData.details);
});

test('charging shot effect boosts damage and then expires', () => {
    const em = new EventManager();
    const tagManager = new TagManager();
    const calc = new CombatCalculator(em, tagManager);
    let dmg = null;
    em.subscribe('damage_calculated', d => { dmg = d.damage; });

    const attacker = {
        attackPower: 4,
        equipment: { weapon: {} },
        stats: { get: () => 0 },
        effects: [{ id: 'charging_shot_effect' }]
    };
    const defender = { stats: { get: () => 0 } };

    calc.handleAttack({ attacker, defender, skill: null });

    assert.strictEqual(dmg, 6); // 4 * 1.5
    assert.strictEqual(attacker.effects.length, 0);
});

test('knockback event fires when sword attack knocks back', () => {
    const em = new EventManager();
    const tm = new TagManager();
    const calc = new CombatCalculator(em, tm);
    let eventData = null;
    em.subscribe('knockback_success', d => { eventData = d; });

    const attacker = {
        attackPower: 3,
        equipment: { weapon: { tags: ['sword'], knockbackChance: 1, image: {} } },
        stats: { get: () => 0 }
    };
    const defender = { stats: { get: () => 0 } };

    const originalRandom = Math.random;
    Math.random = () => 0;
    calc.handleAttack({ attacker, defender, skill: null });
    Math.random = originalRandom;

    assert.ok(eventData, 'knockback_success 이벤트 발생 여부');
    assert.strictEqual(eventData.attacker, attacker);
    assert.strictEqual(eventData.weapon, attacker.equipment.weapon);
});

});
