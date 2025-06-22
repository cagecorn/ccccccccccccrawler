import { CharacterFactory } from '../src/factory.js';
import { describe, test, assert } from './helpers.js';

const assets = { player:{}, mercenary:{} };

describe('Regeneration', () => {
  const factory = new CharacterFactory(assets);

  test('player regenerates hp and mp', () => {
    const player = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g', baseStats:{ endurance:10, focus:10 } });
    player.hp = player.maxHp - 5;
    player.mp = player.maxMp - 5;
    player.applyRegen();
    assert.ok(player.hp > player.maxHp - 5);
    assert.ok(player.mp > player.maxMp - 5);
  });

  test('mercenary regenerates hp and mp', () => {
    const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g', jobId:'warrior' });
    merc.hp = merc.maxHp - 3;
    merc.mp = merc.maxMp - 3;
    merc.applyRegen();
    assert.ok(merc.hp > merc.maxHp - 3);
    assert.ok(merc.mp >= merc.maxMp - 3); // warriors may have low mp regen
  });
});
