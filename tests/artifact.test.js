import { CharacterFactory, ItemFactory } from '../src/factory.js';
import { ItemAIManager } from '../src/managers/item-ai-manager.js';
import { describe, test, assert } from './helpers.js';

const assets = { talisman1:{} };

describe('Artifact Item', () => {
    test('healing talisman heals without consumption and has cooldown', () => {
        const charFactory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const itemAI = new ItemAIManager(null, null, null, { addEffect(){} });
        const merc = charFactory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        merc.consumables = [];
        const arti = itemFactory.create('healing_talisman', 0,0,1);
        merc.consumables.push(arti);
        merc.hp = merc.maxHp - 2;
        const context = { player:merc, mercenaryManager:{ mercenaries:[merc] }, monsterManager:{ monsters:[] } };
        itemAI.update(context);
        assert.ok(merc.hp > merc.maxHp - 2, 'hp increased');
        assert.strictEqual(merc.consumables.length, 1, 'artifact not consumed');
        const cd = arti.cooldownRemaining;
        const ctx = { mapManager:{tileSize:1}, pathfindingManager:{ findEscapeRoute:()=>null }, player:merc, monsterManager:{monsters:[]}, mercenaryManager:{mercenaries:[merc]} };
        for (let i=0;i<cd;i++) merc.update(ctx);
        merc.hp = merc.maxHp - 2;
        itemAI.update(context);
        assert.ok(arti.cooldownRemaining > 0, 'cooldown reset after reuse');
    });

    test('talisman use triggers vfx', () => {
        const charFactory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const vfxLog = [];
        const itemAI = new ItemAIManager(null, null, { addItemUseEffect:(e,img)=>vfxLog.push({e,img}) }, { addEffect(){} });
        const merc = charFactory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        merc.consumables = [];
        const arti = itemFactory.create('healing_talisman', 0,0,1);
        merc.consumables.push(arti);
        merc.hp = merc.maxHp - 1;
        const context = { player:merc, mercenaryManager:{ mercenaries:[merc] }, monsterManager:{ monsters:[] } };
        itemAI.update(context);
        assert.strictEqual(vfxLog.length, 1, 'vfx triggered');
        assert.strictEqual(vfxLog[0].img, arti.image, 'correct image used');
    });

    test('only one artifact used when multiple are available', () => {
        const charFactory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const itemAI = new ItemAIManager();
        itemAI.setEffectManager({ addEffect(){} });
        const merc = charFactory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        merc.consumables = [
            itemFactory.create('healing_talisman',0,0,1),
            itemFactory.create('healing_talisman',0,0,1)
        ];
        merc.consumables.forEach(i => i.cooldownRemaining = 0);
        const context = { player:merc, mercenaryManager:{ mercenaries:[merc] }, monsterManager:{ monsters:[] } };
        itemAI.update(context);
        const readyCount = merc.consumables.filter(i => i.cooldownRemaining > 0).length;
        assert.strictEqual(readyCount, 1, 'only one artifact consumed cooldown');
    });
});
