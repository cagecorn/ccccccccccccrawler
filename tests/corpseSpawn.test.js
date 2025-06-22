import { EventManager } from '../src/managers/eventManager.js';
import { ItemManager } from '../src/managers/itemManager.js';
import { Item } from '../src/entities.js';
import { describe, test, assert } from './helpers.js';

describe('Corpse', () => {
  test('몬스터 사망 시 시체가 생성된다', () => {
    const eventManager = new EventManager();
    const itemManager = new ItemManager();
    const assets = { corpse: {} };
    const tileSize = 32;

    eventManager.subscribe('entity_death', (data) => {
      const { victim } = data;
      const corpse = new Item(victim.x, victim.y, tileSize, 'corpse', assets.corpse);
      corpse.bobbingSpeed = 0;
      corpse.bobbingAmount = 0;
      corpse.baseY = victim.y;
      itemManager.addItem(corpse);
    });

    const victim = { x: 10, y: 20, unitType: 'monster' };
    eventManager.publish('entity_death', { attacker: {}, victim });

    assert.strictEqual(itemManager.items.length, 1, '아이템이 추가되지 않음');
    assert.strictEqual(itemManager.items[0].name, 'corpse', '추가된 아이템이 시체가 아님');
    assert.strictEqual(itemManager.items[0].x, 10, '시체 위치가 올바르지 않음');
    assert.strictEqual(itemManager.items[0].y, 20, '시체 위치가 올바르지 않음');
  });
});
