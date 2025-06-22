import { CharacterFactory, ItemFactory } from '../src/factory.js';
import { describe, test, assert } from './helpers.js';

const assets = { potion:{}, 'pet-fox':{} };

describe('Player consumables', () => {
    test('player has 4 slot consumable inventory', () => {
        const factory = new CharacterFactory(assets);
        const player = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g', image:null });
        assert.ok(Array.isArray(player.consumables));
        assert.strictEqual(player.consumableCapacity, 4);
    });

    test('addConsumable respects capacity', () => {
        const factory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const player = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g', image:null });
        for(let i=0;i<5;i++) player.addConsumable(itemFactory.create('potion',0,0,1));
        assert.strictEqual(player.consumables.length, 4);
    });
});
