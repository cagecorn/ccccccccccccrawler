import { PurifierAI, HealerAI, CompositeAI } from '../src/ai.js';
import { CharacterFactory } from '../src/factory.js';
import { SKILLS } from '../src/data/skills.js';
import { describe, test, assert } from './helpers.js';

const assets = { player:{}, mercenary:{} };

describe('Purify', () => {
  test('healer removes ailment from ally', () => {
    const factory = new CharacterFactory(assets);
    const healer = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'healer' });
    healer.ai = new CompositeAI(new PurifierAI(), new HealerAI());
    healer.properties.mbti = 'ISFJ';
    healer.mp = healer.maxMp;
    const ally = factory.create('mercenary', { x:5, y:0, tileSize:1, groupId:'g', jobId:'warrior' });
    ally.effects.push({ id:'poison', tags:['status_ailment'], remaining:100 });
    const context = { player:{}, allies:[healer, ally], enemies:[], mapManager:{ tileSize:1, isWallAt:() => false } };
    const action = healer.ai.decideAction(healer, context);
    assert.strictEqual(action.type, 'skill');
    assert.strictEqual(action.skillId, SKILLS.purify.id);
    assert.strictEqual(action.target, ally);
  });
});
