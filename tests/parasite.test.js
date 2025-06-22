import { CharacterFactory, ItemFactory } from '../src/factory.js';
import { TurnManager } from '../src/managers/turnManager.js';
import { ParasiteManager } from '../src/managers/parasiteManager.js';
import { describe, test, assert } from './helpers.js';

const assets = { leech:null, worm:null };

describe('Parasite System', () => {
    test('equip parasite adds to consumables', () => {
        const factory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const parasiteMgr = new ParasiteManager();
        const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        const parasite = itemFactory.create('parasite_leech', 0,0,1);
        parasiteMgr.equip(merc, parasite);
        assert.ok(parasiteMgr.hasParasite(merc));
    });

    test('fullness drains faster with parasite', () => {
        const factory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const parasiteMgr = new ParasiteManager();
        const turnManager = new TurnManager();
        turnManager.framesPerTurn = 1;
        const merc = factory.create('mercenary', { x:1, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        merc.prevTurnPos = { x:0, y:0 };
        const parasite = itemFactory.create('parasite_leech',0,0,1);
        parasiteMgr.equip(merc, parasite);
        const startFull = merc.fullness;
        turnManager.update([merc], { parasiteManager: parasiteMgr });
        assert.strictEqual(merc.fullness, +(startFull - 0.2).toFixed(2));
    });

    test('exp gain reduced when carrying parasite', () => {
        const factory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const parasiteMgr = new ParasiteManager();
        const merc = factory.create('mercenary', { x:0,y:0,tileSize:1,groupId:'g', jobId:'warrior', image:null });
        const parasite = itemFactory.create('parasite_leech',0,0,1);
        parasiteMgr.equip(merc, parasite);
        merc.stats.addExp(10);
        assert.strictEqual(merc.stats.get('exp'), 8);
    });

    test('combine duplicates increases rank', () => {
        const factory = new CharacterFactory(assets);
        const itemFactory = new ItemFactory(assets);
        const parasiteMgr = new ParasiteManager();
        const merc = factory.create('mercenary', { x:0,y:0,tileSize:1,groupId:'g', jobId:'warrior', image:null });
        const p1 = itemFactory.create('parasite_leech',0,0,1);
        const p2 = itemFactory.create('parasite_leech',0,0,1);
        parasiteMgr.equip(merc, p1);
        parasiteMgr.equip(merc, p2);
        const combined = parasiteMgr.combineParasites(merc, 'parasite_leech');
        assert.ok(combined, 'should combine');
        assert.strictEqual(merc.consumables.length, 1);
        assert.strictEqual(merc.consumables[0].rank, 2);
    });
});
