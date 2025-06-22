import { monsterDeathWorkflow } from '../src/workflows.js';
import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

describe('Integration', () => {
  test('몬스터 사망 워크플로우', () => {
    const eventManager = new EventManager();

    let deathEventFired = false;
    let expEventFired = false;
    let lootEventFired = false;
    let removedEventFired = false;
    let gainedExp = 0;

    const mockAttacker = {
      isPlayer: true,
      isFriendly: true,
      stats: {
        addExp: (exp) => {
          gainedExp = exp;
        },
      },
    };
    const mockVictim = {
      id: 'monster-123',
      expValue: 50,
      x: 100,
      y: 100,
      constructor: { name: 'Monster' },
    };
    const context = { eventManager, attacker: mockAttacker, victim: mockVictim };

    eventManager.subscribe('entity_death', () => { deathEventFired = true });
    eventManager.subscribe('exp_gained', () => { expEventFired = true });
    eventManager.subscribe('drop_loot', () => { lootEventFired = true });
    eventManager.subscribe('entity_removed', (data) => {
      if (data.victimId === 'monster-123') removedEventFired = true;
    });

    monsterDeathWorkflow(context);

    assert.ok(deathEventFired, '사망(entity_death) 이벤트가 발생하지 않음');
    assert.ok(expEventFired, '경험치 획득(exp_gained) 이벤트가 발생하지 않음');
    assert.ok(lootEventFired, '아이템 드랍(drop_loot) 이벤트가 발생하지 않음');
    assert.ok(removedEventFired, '개체 제거(entity_removed) 이벤트가 발생하지 않음');
    assert.strictEqual(gainedExp, 50, '획득 경험치가 50이 아님');
  });
});
