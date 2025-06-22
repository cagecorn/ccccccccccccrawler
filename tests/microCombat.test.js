import { describe, test, assert } from './helpers.js';
import { EventManager } from '../src/managers/eventManager.js';
import { CharacterFactory, ItemFactory } from '../src/factory.js';
import { MicroCombatManager } from '../src/micro/MicroCombatManager.js';
import { CombatCalculator } from '../src/combat.js';
import { TagManager } from '../src/managers/tagManager.js';
import { EquipmentManager } from '../src/managers/equipmentManager.js';
import { ItemManager } from '../src/managers/itemManager.js';
import { disarmWorkflow, armorBreakWorkflow } from '../src/workflows.js';

describe('Micro-World Combat Scenarios', () => {
  function setupTestEnvironment() {
      const eventManager = new EventManager();
      const assets = { short_sword: {}, plate_armor: {} };
      const factory = new CharacterFactory(assets);
      const itemFactory = new ItemFactory(assets);
      const microCombatManager = new MicroCombatManager(eventManager);
      const equipmentManager = new EquipmentManager(eventManager);
      const itemManager = new ItemManager();
      const tagManager = new TagManager();
      const combatCalculator = new CombatCalculator(eventManager, tagManager);

      const attacker = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g' });
      const defender = factory.create('monster', { x:1, y:0, tileSize:1, groupId:'m' });

      const context = {
          eventManager,
          itemManager,
          equipmentManager,
          vfxManager: { addEjectAnimation: () => {}, addArmorBreakAnimation: () => {} }
      };

      return { eventManager, factory, itemFactory, microCombatManager, attacker, defender, context, combatCalculator, itemManager, tagManager };
  }

  test('방어구 파괴: 무게가 높은 무기가 강인함이 낮은 방어구를 파괴한다', () => {
      const { eventManager, itemFactory, microCombatManager, attacker, defender, context } = setupTestEnvironment();

      const strongSword = itemFactory.create('short_sword', 0, 0, 1);
      strongSword.weight = 200;

      const weakArmor = itemFactory.create('plate_armor', 0, 0, 1);
      weakArmor.durability = 10;
      weakArmor.toughness = 5;
      weakArmor.tier = 'normal';

      attacker.equipment.weapon = strongSword;
      defender.equipment.armor = weakArmor;

      let armorBroken = false;
      eventManager.subscribe('armor_broken', (data) => {
          armorBroken = true;
          armorBreakWorkflow({ ...context, ...data });
      });

      microCombatManager.resolveAttack(attacker, defender);

      assert.ok(armorBroken, 'armor_broken 이벤트가 발생해야 합니다.');
      assert.strictEqual(defender.equipment.armor, null, '수비자의 방어구가 해제되어야 합니다.');
  });

  test('무기 무장해제: 강인함이 높은 방어구가 내구도 낮은 무기를 튕겨낸다', () => {
      const { eventManager, itemFactory, microCombatManager, attacker, defender, context } = setupTestEnvironment();

      const weakSword = itemFactory.create('short_sword', 0, 0, 1);
      weakSword.durability = 5;
      weakSword.toughness = 1;
      weakSword.tier = 'normal';

      const strongArmor = itemFactory.create('plate_armor', 0, 0, 1);
      strongArmor.weight = 100;
      strongArmor.toughness = 20;

      attacker.equipment.weapon = weakSword;
      defender.equipment.armor = strongArmor;

      let weaponDisarmed = false;
      eventManager.subscribe('weapon_disarmed', (data) => {
          weaponDisarmed = true;
          disarmWorkflow({ ...context, ...data });
      });

      microCombatManager.resolveAttack(attacker, defender);

      assert.ok(weaponDisarmed, 'weapon_disarmed 이벤트가 발생해야 합니다.');
      assert.strictEqual(attacker.equipment.weapon, null, '공격자의 무기가 해제되어야 합니다.');
  });
  
  test('위계 질서: 일반(normal) 등급 무기는 레어(rare) 등급 방어구를 파괴할 수 없다', () => {
      const { eventManager, itemFactory, microCombatManager, attacker, defender } = setupTestEnvironment();
      
      const normalSword = itemFactory.create('short_sword', 0, 0, 1);
      normalSword.weight = 9999;
      normalSword.tier = 'normal';

      const rareArmor = itemFactory.create('plate_armor', 0, 0, 1);
      rareArmor.durability = 1;
      rareArmor.tier = 'rare';

      attacker.equipment.weapon = normalSword;
      defender.equipment.armor = rareArmor;

      let armorBroken = false;
      eventManager.subscribe('armor_broken', () => { armorBroken = true; });

      microCombatManager.resolveAttack(attacker, defender);

      assert.strictEqual(armorBroken, false, '하위 등급 장비는 상위 등급 장비를 파괴할 수 없습니다.');
      assert.strictEqual(rareArmor.durability, 1, '하위 등급의 공격은 상위 등급 장비에 피해를 주지 않아야 합니다.');
  });

  test('패링 성공: 패링 스킬을 가진 무기는 확률적으로 공격을 무효화한다', () => {
      const { eventManager, itemFactory, combatCalculator, attacker, defender } = setupTestEnvironment();

      const parryingSword = itemFactory.create('short_sword', 0, 0, 1);
      defender.equipment.weapon = parryingSword;
      parryingSword.weaponStats.skills.push('parry');

      const initialDefenderHP = defender.hp;
      let parrySuccessLog = false;
      let parryEvent = false;
      eventManager.subscribe('log', (data) => {
          if (data.message.includes('[패링]')) parrySuccessLog = true;
      });
      eventManager.subscribe('parry_success', () => { parryEvent = true; });

      const originalRandom = Math.random;
      Math.random = () => 0;

      combatCalculator.handleAttack({ attacker, defender, skill: null });

      Math.random = originalRandom;

      assert.ok(parrySuccessLog, '패링 성공 로그가 출력되어야 합니다.');
      assert.ok(parryEvent, 'parry_success 이벤트가 발생해야 합니다.');
      assert.strictEqual(defender.hp, initialDefenderHP, '패링 성공 시 수비자의 HP는 변하지 않아야 합니다.');
      assert.ok(parryingSword.weaponStats.cooldown > 0, '패링 성공 시 무기에 쿨타임이 적용되어야 합니다.');
  });

  test('패링 실패: 확률적으로 패링에 실패하면 정상적으로 피해를 입는다', () => {
      const { eventManager, itemFactory, combatCalculator, attacker, defender } = setupTestEnvironment();

      const parryingSword = itemFactory.create('short_sword', 0, 0, 1);
      defender.equipment.weapon = parryingSword;
      parryingSword.weaponStats.skills.push('parry');

      const initialDefenderHP = defender.hp;
      let parryEvent = false;

      const originalRandom = Math.random;
      Math.random = () => 0.99;
      eventManager.subscribe('parry_success', () => { parryEvent = true; });

      combatCalculator.handleAttack({ attacker, defender, skill: null });

      Math.random = originalRandom;

      defender.takeDamage(5);

      assert.ok(defender.hp < initialDefenderHP, '패링 실패 시 수비자는 피해를 입어야 합니다.');
      assert.strictEqual(parryEvent, false, '패링 실패 시 parry_success 이벤트가 발생하지 않아야 합니다.');
  });

  test('패링 자세 사용 시 다음 공격을 완전히 막는다', () => {
      const { eventManager, itemFactory, combatCalculator, attacker, defender } = setupTestEnvironment();

      const sword = itemFactory.create('short_sword', 0, 0, 1);
      defender.equipment.weapon = sword;
      sword.weaponStats.skills.push('parry_stance');

      eventManager.subscribe('parry_success', () => {});

      // AI가 패링 자세 효과를 받았다고 가정
      defender.effects.push({ id: 'parry_ready', remaining: 60 });

      const originalRandom = Math.random;
      Math.random = () => 0.99;

      combatCalculator.handleAttack({ attacker, defender, skill: null });

      Math.random = originalRandom;

      assert.ok(defender.effects.length === 0, '패링 준비 효과는 한 번 사용 후 사라져야 한다.');
      assert.ok(sword.weaponStats.cooldown > 0, '패링 자세 사용 후 쿨타임이 적용되어야 한다.');
  });
});
