import { AquariumMapManager } from '../src/aquariumMap.js';
import { AquariumManager, AquariumInspector } from '../src/managers/aquariumManager.js';
import { CharacterFactory } from '../src/factory.js';
import { EventManager } from '../src/managers/eventManager.js';
import { MonsterManager } from '../src/managers/monsterManager.js';
import { ItemManager } from '../src/managers/itemManager.js';
import { VFXManager } from '../src/managers/vfxManager.js';
import { adjustMonsterStatsForAquarium } from '../src/utils/aquariumUtils.js';
import { StatManager } from '../src/stats.js';
import { describe, test, assert } from './helpers.js';

const assets = { monster:{} };

describe('Aquarium', () => {
    test('Aquarium map uses a wide maze layout', () => {
        const m = new AquariumMapManager(1);
        assert.ok(m.corridorWidth >= 8, 'corridor width should be wide');
        const wallCount = m.countTiles(m.tileTypes.WALL);
        assert.ok(wallCount > 0 && wallCount < m.width * m.height, 'maze should contain walls and floors');
    });

    test('Manager adds feature and inspector passes', () => {
        const eventManager = new EventManager();
        const monsterManager = new MonsterManager(0, new AquariumMapManager(), assets, eventManager, new CharacterFactory(assets));
        const itemManager = new ItemManager(0, monsterManager.mapManager, assets);
        const factory = new CharacterFactory(assets);
        const vfx = new VFXManager(eventManager);
        const aquariumManager = new AquariumManager(eventManager, monsterManager, itemManager, monsterManager.mapManager, factory, { create(){return null;} }, vfx, null);
        aquariumManager.addTestingFeature({ type:'monster', image:{} });
        const inspector = new AquariumInspector(aquariumManager);
        assert.ok(inspector.run(), 'inspection fails');
        assert.strictEqual(monsterManager.monsters.length, 1);
    });

    test('Bubble feature spawns emitter', () => {
        const eventManager = new EventManager();
        const monsterManager = new MonsterManager(0, new AquariumMapManager(), assets, eventManager, new CharacterFactory(assets));
        const itemManager = new ItemManager(0, monsterManager.mapManager, assets);
        const factory = new CharacterFactory(assets);
        const vfx = new VFXManager(eventManager);
        const aquariumManager = new AquariumManager(eventManager, monsterManager, itemManager, monsterManager.mapManager, factory, { create(){return null;} }, vfx, null);
        aquariumManager.addTestingFeature({ type: 'bubble' });
        assert.strictEqual(vfx.emitters.length, 1);
    });

    test('Monster stats adjusted for aquarium', () => {
        const base = { strength: 5, endurance: 3 };
        const adjusted = adjustMonsterStatsForAquarium(base);
        const dummy = { hp: 0, mp: 0 };
        const stats = new StatManager(dummy, adjusted);
        assert.strictEqual(stats.get('maxHp'), (10 + base.endurance * 5) * 2);
        assert.ok(Math.abs(stats.get('attackPower')) < 0.001);
    });
});
