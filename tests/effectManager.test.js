import { EffectManager } from '../src/managers/effectManager.js';
import { EventManager } from '../src/managers/eventManager.js';
import { StatManager } from '../src/stats.js';
import { describe, test, assert } from './helpers.js';

describe('Managers', () => {

test('버프 추가', () => {
    const eventManager = new EventManager();
    const effectManager = new EffectManager(eventManager);
    const mockTarget = { effects: [], stats: { recalculate: () => {}, increaseBaseStat: () => {} } };
    let eventFired = false;
    eventManager.subscribe('stats_changed', () => { eventFired = true; });

    effectManager.addEffect(mockTarget, 'strength_buff');

    assert.strictEqual(mockTarget.effects.length, 1);
    assert.strictEqual(mockTarget.effects[0].name, '힘의 축복');
    assert.ok(eventFired, 'stats_changed 이벤트');
});

test('보호막 적용 및 만료', () => {
    const eventManager = new EventManager();
    const effectManager = new EffectManager(eventManager);
    const target = { effects: [], stats: { recalculate: () => {}, increaseBaseStat: () => {} }, shield: 0, damageBonus: 0, takeDamage: () => {} };
    effectManager.addEffect(target, 'shield');
    assert.strictEqual(target.shield, 10);
    effectManager.update([target]);
    target.effects[0].remaining = 0;
    effectManager.update([target]);
    assert.strictEqual(target.shield, 0);
});

test('독 도트 피해', () => {
    const eventManager = new EventManager();
    const effectManager = new EffectManager(eventManager);
    let damageTaken = 0;
    const target = { effects: [], stats: { recalculate: () => {}, increaseBaseStat: () => {} }, shield: 0, damageBonus: 0,
                     takeDamage: (d) => { damageTaken += d; } };
    effectManager.addEffect(target, 'poison');
    // Simulate 100 frames (1 turn)
    for (let i = 0; i < 100; i++) effectManager.update([target]);
    assert.strictEqual(damageTaken, 3);
});

test('동결 이동 속도 감소', () => {
    const eventManager = new EventManager();
    const effectManager = new EffectManager(eventManager);
    const stats = new StatManager({}, { movement: 4 });
    const target = { effects: [], stats, shield: 0, damageBonus: 0, takeDamage: () => {} };
    const base = stats.get('movementSpeed');
    effectManager.addEffect(target, 'freeze');
    stats.recalculate();
    assert.strictEqual(stats.get('movementSpeed'), base - 2);
    effectManager.removeEffect(target, target.effects[0]);
    stats.recalculate();
    assert.strictEqual(stats.get('movementSpeed'), base);
});

});
