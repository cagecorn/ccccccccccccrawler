import { CharacterFactory } from '../src/factory.js';
import { FAITHS } from '../src/data/faiths.js';
import { StatManager } from '../src/stats.js';
import { describe, test, assert } from './helpers.js';

const assets = {};
const faithKeys = Object.keys(FAITHS);

describe('Faith System', () => {
  test('플레이어는 신앙을 갖지 않는다', () => {
    const factory = new CharacterFactory(assets);
    const player = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g' });
    assert.ok(!player.properties.faith, 'Player should not have a faith.');
  });

  test('용병은 유효한 신앙을 부여받는다', () => {
    const factory = new CharacterFactory(assets);
    const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g' });
    assert.ok(merc.properties.faith, 'Mercenary should have a faith.');
    assert.ok(faithKeys.includes(merc.properties.faith), 'Mercenary faith should be a valid key.');
  });

  test('몬스터는 유효한 신앙을 부여받는다', () => {
    const factory = new CharacterFactory(assets);
    const mon = factory.create('monster', { x:0, y:0, tileSize:1, groupId:'g' });
    assert.ok(mon.properties.faith, 'Monster should have a faith.');
    assert.ok(faithKeys.includes(mon.properties.faith), 'Monster faith should be a valid key.');
  });

  test('신앙에 따른 스탯 보너스가 올바르게 적용된다', () => {
    const factory = new CharacterFactory(assets);
    const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'g' });

    // 기본 신앙을 제거하고 스탯을 계산해 기준값을 얻는다
    merc.properties.faith = null;
    merc.stats.recalculate();
    const baseAttack = merc.stats.get('attackPower');
    const baseDefense = merc.stats.get('defense');

    // 불의 신 신앙을 부여한 뒤 스탯을 다시 계산
    merc.properties.faith = 'FIRE_GOD';
    merc.stats.recalculate();
    const newAttack = merc.stats.get('attackPower');
    const newDefense = merc.stats.get('defense');

    const bonus = FAITHS.FIRE_GOD.statBonuses;
    assert.strictEqual(newAttack, baseAttack + bonus.attackPower, '불의 신 공격력 보너스가 적용되어야 합니다.');
    assert.strictEqual(newDefense, (baseDefense || 0) + bonus.defense, '불의 신 방어력 패널티가 적용되어야 합니다.');
  });
});
