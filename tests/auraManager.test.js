import { CharacterFactory } from '../src/factory.js';
import { EffectManager } from '../src/managers/effectManager.js';
import { AuraManager } from '../src/managers/AuraManager.js';
import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

const assets = { 'pet-fox': {} };

describe('AuraManager', () => {
    test('apply and remove aura effects based on range', () => {
        const eventMgr = new EventManager();
        const effectMgr = new EffectManager(eventMgr);
        const auraMgr = new AuraManager(effectMgr, eventMgr);
        const factory = new CharacterFactory(assets);
        const pet = factory.create('pet', { petId:'fox', x:0, y:0, tileSize:1, groupId:'g' });
        const ally = factory.create('mercenary', { jobId:'warrior', x:0, y:0, tileSize:1, groupId:'g' });
        auraMgr.registerAura(pet, { skillId:'regeneration_aura', range:20 });
        auraMgr.update([pet, ally]);
        assert.ok(ally.effects.some(e => e.id === 'regeneration_aura'));
        ally.x = 50;
        auraMgr.update([pet, ally]);
        assert.ok(!ally.effects.some(e => e.id === 'regeneration_aura'));
    });
});
