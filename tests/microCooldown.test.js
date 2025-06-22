import { describe, test, assert } from './helpers.js';
import { MicroTurnManager } from '../src/micro/MicroTurnManager.js';
import { Item } from '../src/entities.js';

describe('Micro-World Cooldown Management', () => {

  test('MicroTurnManager가 아티팩트 쿨타임을 감소시킨다', () => {
    const turnManager = new MicroTurnManager();
    const artifact = new Item(0, 0, 1, 'Test Artifact', null);
    artifact.cooldownRemaining = 10;
    const allItems = [artifact];
    turnManager.update(allItems);
    turnManager.update(allItems);
    turnManager.update(allItems);
    assert.strictEqual(artifact.cooldownRemaining, 7, '쿨타임이 3만큼 감소해야 합니다.');
  });

  test('MicroTurnManager가 펫 아이템 쿨타임을 감소시킨다', () => {
    const turnManager = new MicroTurnManager();
    const petItem = new Item(0, 0, 1, 'Pet Charm', null);
    petItem.cooldownRemaining = 600;
    const allItems = [petItem];
    for (let i = 0; i < 100; i++) {
        turnManager.update(allItems);
    }
    assert.strictEqual(petItem.cooldownRemaining, 500, '쿨타임이 100만큼 감소해야 합니다.');
  });

  test('Item.update는 더 이상 쿨타임을 직접 감소시키지 않는다', () => {
    const artifact = new Item(0, 0, 1, 'Test Artifact', null);
    artifact.cooldownRemaining = 10;
    artifact.update();
    artifact.update();
    assert.strictEqual(artifact.cooldownRemaining, 10, 'Item.update()는 쿨타임을 변경해서는 안 됩니다.');
  });

});
