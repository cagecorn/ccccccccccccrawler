import { Mercenary, Item } from '../src/entities.js';
import { EquipmentManager } from '../src/managers/equipmentManager.js';
import { EventManager } from '../src/managers/eventManager.js';
import { MeleeAI, RangedAI } from '../src/ai.js';
import { describe, test, assert } from './helpers.js';

describe('AI', () => {

test('AI switches based on equipped weapon tags', () => {
    const em = new EventManager();
    const eqManager = new EquipmentManager(em);
    const merc = new Mercenary({ x:0, y:0, tileSize:1, groupId:'g', stats:{} });
    merc.ai = new MeleeAI();
    const bow = new Item(0,0,1,'bow',null);
    bow.tags = ['weapon','ranged'];
    const sword = new Item(0,0,1,'sword',null);
    sword.tags = ['weapon','melee'];

    eqManager.equip(merc, bow, []);
    assert.ok(merc.ai instanceof RangedAI);

    eqManager.equip(merc, sword, []);
    assert.ok(merc.ai instanceof MeleeAI);
});

});
