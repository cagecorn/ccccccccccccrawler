import { CharacterFactory } from '../src/factory.js';
import { PetManager } from '../src/managers/petManager.js';
import { describe, test, assert } from './helpers.js';

const assets = { 'pet-fox': {} };

describe('Pet System', () => {
    test('equip summons pet', () => {
        const factory = new CharacterFactory(assets);
        const petMgr = new PetManager(null, factory);
        const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        merc.consumables = []; merc.consumableCapacity = 4;
        const item = { baseId:'pet_fox', cooldown:0, cooldownRemaining:0 };
        merc.addConsumable(item);
        const pet = petMgr.equip(merc, item, 'fox');
        assert.ok(pet && pet.owner === merc);
        assert.strictEqual(petMgr.pets.length, 1);
    });

    test('combine pets ranks up', () => {
        const factory = new CharacterFactory(assets);
        const petMgr = new PetManager();
        const player = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        player.consumables = []; player.consumableCapacity = 5;
        const i1 = { baseId:'pet_fox' }; const i2 = { baseId:'pet_fox' }; const i3 = { baseId:'pet_fox' };
        player.addConsumable(i1); player.addConsumable(i2); player.addConsumable(i3);
        const ok = petMgr.combinePets(player, 'pet_fox');
        assert.ok(ok);
        assert.strictEqual(player.consumables.length, 1);
        assert.strictEqual(player.consumables[0].rank, 2);
    });

    test('feeding pet gives exp', () => {
        const factory = new CharacterFactory(assets);
        const petMgr = new PetManager(null, factory);
        const player = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        const item = { baseId:'pet_fox', cooldown:0, cooldownRemaining:0 };
        player.consumables = []; player.consumableCapacity = 4; player.addConsumable(item);
        const pet = petMgr.equip(player, item, 'fox');
        const food = { tags:['pet_food'] };
        const start = pet.stats.get('exp');
        petMgr.feedPet(pet, food);
        assert.ok(pet.stats.get('exp') > start);
    });
});
