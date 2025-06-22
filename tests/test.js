import { Monster, Item } from '../src/entities.js';
import { EquipmentManager } from '../src/managers/equipmentManager.js';
import { EquipmentRenderManager } from '../src/managers/equipmentRenderManager.js';
import { TagManager } from '../src/managers/tagManager.js';
import { EventManager } from '../src/managers/eventManager.js';
import { MeleeAI, RangedAI } from '../src/ai.js';
import { describe, test, assert } from './helpers.js';

function setupManagers() {
    const eventManager = new EventManager();
    const eqManager = new EquipmentManager(eventManager);
    const tagManager = new TagManager();
    eqManager.setTagManager(tagManager);
    return { eqManager };
}

describe('Monster Loot & AI', () => {
    test('monster equips loot weapon and updates AI', () => {
        const { eqManager } = setupManagers();
        const monster = new Monster({ x: 0, y: 0, tileSize: 1, groupId: 'g', stats: {} });
        const bowImage = {};
        const bow = new Item(0, 0, 1, 'bow', bowImage);
        bow.type = 'weapon';
        bow.tags = ['weapon', 'ranged'];
        eqManager.equip(monster, bow, null);
        assert.strictEqual(monster.equipment.weapon, bow);
        assert.ok(monster.ai instanceof RangedAI);
    });

    test('equipped weapon is drawn and melee AI applied', () => {
        const { eqManager } = setupManagers();
        const monster = new Monster({ x: 0, y: 0, tileSize: 1, groupId: 'g', stats: {} });
        const swordImage = {};
        const sword = new Item(0, 0, 1, 'sword', swordImage);
        sword.type = 'weapon';
        sword.tags = ['weapon', 'melee'];
        eqManager.equip(monster, sword, null);
        monster.equipmentRenderManager = new EquipmentRenderManager();
        let drawnImage = null;
        const ctx = { drawImage(img) { drawnImage = img; } };
        monster.equipmentRenderManager.drawWeapon(ctx, monster);
        assert.strictEqual(drawnImage, swordImage);
        assert.ok(monster.ai instanceof MeleeAI);
    });
});
