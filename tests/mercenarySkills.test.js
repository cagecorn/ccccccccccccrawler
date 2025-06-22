import { CharacterFactory } from '../src/factory.js';
import { describe, test, assert } from './helpers.js';
import { SKILLS } from '../src/data/skills.js';

describe('Managers', () => {

const assets = { mercenary:{} };

function createMerc(jobId = undefined, randomValue = 0.5) {
    const original = Math.random;
    Math.random = () => randomValue;
    const factory = new CharacterFactory(assets);
    const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId, image:null });
    Math.random = original;
    return merc;
}

test('전사 기본 스킬 - charge_attack', () => {
    const merc = createMerc('warrior');
    assert.strictEqual(merc.skills[0], SKILLS.charge_attack.id);
});

test('기본 용병 무작위 스킬 - double_strike', () => {
    const merc = createMerc(undefined, 0.1);
    assert.strictEqual(merc.skills[0], SKILLS.double_strike.id);
});

test('기본 용병 무작위 스킬 - charge_attack', () => {
    const merc = createMerc(undefined, 0.9);
    assert.strictEqual(merc.skills[0], SKILLS.charge_attack.id);
});

test('궁수 스킬 부여 - double_thrust', () => {
    const merc = createMerc('archer', 0.1);
    assert.strictEqual(merc.skills[0], SKILLS.double_thrust.id);
});

test('궁수 스킬 부여 - hawk_eye', () => {
    const merc = createMerc('archer', 0.9);
    assert.strictEqual(merc.skills[0], SKILLS.hawk_eye.id);
});

test('마법사 스킬 부여 - fireball', () => {
    const merc = createMerc('wizard', 0.1);
    assert.strictEqual(merc.skills[0], SKILLS.fireball.id);
});

test('마법사 스킬 부여 - iceball', () => {
    const merc = createMerc('wizard', 0.9);
    assert.strictEqual(merc.skills[0], SKILLS.iceball.id);
});

});
