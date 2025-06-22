// tests/microWorld.integration.test.js

import { describe, test, assert } from './helpers.js';
import { EventManager } from '../src/managers/eventManager.js';
import { CharacterFactory, ItemFactory } from '../src/factory.js';
import { CombatCalculator } from '../src/combat.js';
import { TagManager } from '../src/managers/tagManager.js';
import { MicroEngine } from '../src/micro/MicroEngine.js';

describe('Micro-World Integration Test', () => {

  test('공격 성공 시 무기와 사용자 숙련도 경험치가 함께 증가한다', () => {
    // 1. Arrange (테스트 환경 설정)
    const assets = { sword: {} };
    const eventManager = new EventManager();
    const tagManager = new TagManager();

    const factory = new CharacterFactory(assets);
    const itemFactory = new ItemFactory(assets);
    const combatCalculator = new CombatCalculator(eventManager, tagManager);

    const microEngine = new MicroEngine(eventManager);

    const attacker = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g' });
    const defender = factory.create('monster', { x:1, y:0, tileSize:1, groupId:'m' });

    const sword = itemFactory.create('short_sword', 0, 0, 1);
    attacker.equipment.weapon = sword;

    // 숙련도 레벨업이 즉시 발생하도록 조건을 조정한다.
    attacker.proficiency.sword.exp = 0;
    attacker.proficiency.sword.expNeeded = 1;

    let levelUpLog = false;
    eventManager.subscribe('log', () => { levelUpLog = true; });

    const initialWeaponExp = sword.weaponStats.exp;
    const initialLevel = attacker.proficiency.sword.level;

    // 2. Act - 실제 공격 수행
    combatCalculator.handleAttack({ attacker, defender, skill: null });

    // 3. Assert
    assert.strictEqual(
        sword.weaponStats.exp,
        initialWeaponExp + 1,
        '공격 성공 후 무기 자체의 경험치가 1 증가해야 합니다.'
    );
    assert.strictEqual(
        attacker.proficiency.sword.level,
        initialLevel + 1,
        '경험치가 가득 차면 숙련도 레벨이 상승해야 합니다.'
    );
    assert.strictEqual(
        attacker.proficiency.sword.exp,
        0,
        '레벨업 후 숙련도 경험치는 0으로 초기화됩니다.'
    );
    assert.ok(levelUpLog, '숙련도 레벨업 로그 이벤트가 발행되어야 합니다.');
  });

});
