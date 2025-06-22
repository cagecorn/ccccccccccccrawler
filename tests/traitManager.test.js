import { CharacterFactory } from '../src/factory.js';
import { TraitManager } from '../src/managers/traitManager.js';
import { TRAITS } from '../src/data/traits.js';
import { describe, test, assert } from './helpers.js';

describe('Trait System', () => {
    test('new mercenary gets two traits', () => {
        const factory = new CharacterFactory({});
        const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior', image:null });
        assert.strictEqual(merc.properties.traits.length, 2);
        for (const id of merc.properties.traits) {
            assert.ok(TRAITS[id]);
        }
    });

    test('TraitManager applies stat bonuses', () => {
        const factory = new CharacterFactory({});
        const monster = factory.create('monster', { x:0, y:0, tileSize:1, groupId:'g', image:null });
        monster.properties.traits = ['TOUGH'];
        const traitManager = new TraitManager();
        const before = monster.stats.get('endurance');
        traitManager.applyTraits(monster, TRAITS);
        assert.strictEqual(monster.stats.get('endurance'), before + 1);
    });
});
