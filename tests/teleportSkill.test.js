import { CharacterFactory } from '../src/factory.js';
import { describe, test, assert } from './helpers.js';
import { SKILLS } from '../src/data/skills.js';

describe('Teleport Skill', () => {
  test('플레이어가 텔레포트 스킬을 보유한다', () => {
    const assets = { player:{} };
    const factory = new CharacterFactory(assets);
    const player = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g' });
    assert.ok(player.skills.includes(SKILLS.teleport.id));
  });
});
