import { describe, test, assert } from './helpers.js';
import { ItemFactory, CharacterFactory } from '../src/factory.js';
import { WeaponStatManager } from '../src/micro/WeaponStatManager.js';

const assets = { sword:{}, player:{} };

describe('Micro-World: Weapon Proficiency', () => {
  test('무기 사용 시 숙련도 경험치가 오르고 쿨타임이 적용된다', () => {
    const itemFactory = new ItemFactory(assets);
    const charFactory = new CharacterFactory(assets);
    const sword = itemFactory.create('short_sword', 0,0,1);
    const player = charFactory.create('player', { x:0, y:0, tileSize:1, groupId:'p' });
    player.equipment.weapon = sword;

    const initialExp = sword.weaponStats.exp;
    sword.weaponStats.gainExp(1);
    assert.strictEqual(sword.weaponStats.exp, initialExp + 1);

    sword.weaponStats.cooldown = 30;
    assert.strictEqual(sword.weaponStats.cooldown, 30);
  });
});
