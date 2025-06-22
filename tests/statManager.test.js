import { StatManager } from '../src/stats.js';
import { describe, test, assert } from './helpers.js';

describe('StatManager', () => {

// 초기 스탯이 올바르게 설정되는가?
test('초기 스탯 설정', () => {
    const jobConfig = { strength: 5, endurance: 10 };
    const stats = new StatManager({}, jobConfig);
    assert.strictEqual(stats.get('strength'), 5);
    assert.strictEqual(stats.get('endurance'), 10);
    assert.strictEqual(stats.get('castingSpeed'), 0.5);
    assert.strictEqual(stats.get('attackSpeed'), 0.5);
});

// 파생 스탯(maxHp, attackPower)이 올바르게 계산되는가?
test('파생 스탯 계산', () => {
    const jobConfig = { strength: 5, endurance: 10 };
    const stats = new StatManager({}, jobConfig);
    assert.strictEqual(stats.get('maxHp'), 60); // 10 + 10 * 5
    assert.strictEqual(stats.get('attackPower'), 11); // 1 + 5 * 2
});

// 스탯 포인트 분배가 올바르게 작동하는가?
test('스탯 포인트 분배', () => {
    const jobConfig = { strength: 5, endurance: 10 };
    const stats = new StatManager({}, jobConfig);
    stats.allocatePoint('strength');
    stats.recalculate();
    assert.strictEqual(stats.get('strength'), 6);
    assert.strictEqual(stats.get('attackPower'), 13);
});

// 레벨 업 시 스탯 증가 확인

test('레벨 업', () => {
    const stats = new StatManager({}, { strength: 1, endurance: 1, expNeeded: 10 });
    stats.levelUp();
    stats.recalculate();
    assert.strictEqual(stats.get('level'), 2);
    assert.strictEqual(stats.get('strength'), 2);
    assert.strictEqual(stats.get('endurance'), 2);
});

// 체력/마나 재생 계산 확인
test('재생 스탯 계산', () => {
    const stats = new StatManager({}, { endurance: 10, focus: 8 });
    assert.ok(stats.get('hpRegen') > 0);
    assert.ok(stats.get('mpRegen') > 0);
});

});
