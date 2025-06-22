import { describe, test, assert } from './helpers.js';
import { EventManager } from '../src/managers/eventManager.js';
import { HealerAI } from '../src/ai.js';
import { SKILLS } from '../src/data/skills.js';
import { monsterDeathWorkflow } from '../src/workflows.js';

// 풀 사이클을 간략히 검증하는 통합 테스트

describe('Full Cycle Integration Test', () => {
  test('Hiring, combat, AI healing, and looting workflow', () => {
    const eventManager = new EventManager();

    let expEvent = false;
    let lootEvent = false;
    eventManager.subscribe('exp_gained', () => { expEvent = true; });
    eventManager.subscribe('drop_loot', () => { lootEvent = true; });

    const player = {
      id: 'player',
      isPlayer: true,
      isFriendly: true,
      x: 0,
      y: 0,
      width: 32,
      height: 32,
      tileSize: 32,
      hp: 50,
      maxHp: 50,
      gold: 100,
      inventory: [],
      stats: {
        get: (stat) => (stat === 'attackPower' ? 10 : 50),
        addExp: () => {},
      },
      takeDamage(amount) { this.hp -= amount; },
    };

    const monster = {
      id: 'monster1',
      x: 32,
      y: 0,
      width: 32,
      height: 32,
      tileSize: 32,
      hp: 30,
      maxHp: 30,
      expValue: 20,
      takeDamage(amount) { this.hp -= amount; },
    };

    const healer = {
      id: 'healer1',
      isFriendly: true,
      x: 0,
      y: 32,
      width: 32,
      height: 32,
      tileSize: 32,
      hp: 40,
      maxHp: 40,
      mp: 30,
      maxMp: 30,
      skills: ['heal'],
      skillCooldowns: {},
      ai: new HealerAI(),
      properties: { mbti: 'ESFJ' },
      stats: { get: () => 0 },
      attackRange: 192,
    };

    // 전투 시작 - 플레이어가 몬스터를 공격
    eventManager.publish('entity_attack', { attacker: player, defender: monster });
    monster.takeDamage(10);
    assert.strictEqual(monster.hp, 20, 'Monster should take damage');

    // 몬스터가 반격하여 플레이어 HP 감소
    eventManager.publish('entity_attack', { attacker: monster, defender: player });
    player.takeDamage(40);
    assert.strictEqual(player.hp, 10, 'Player should take damage');

    // 힐러 AI가 행동 결정
    const context = {
      player,
      allies: [player, healer],
      enemies: [monster],
      mapManager: { tileSize: 1, isWallAt: () => false },
      eventManager,
    };
    const healerAction = healer.ai.decideAction(healer, context);

    assert.strictEqual(healerAction.type, 'skill', 'Healer should decide to use a skill');
    assert.strictEqual(healerAction.skillId, SKILLS.heal.id, 'Healer should use the Heal skill');
    assert.strictEqual(healerAction.target, player, 'Healer should target the player');

    // 힐 적용 시뮬레이션
    player.hp = Math.min(player.maxHp, player.hp + SKILLS.heal.healAmount);
    assert.ok(player.hp > 10, 'Player HP should increase after heal');

    // 플레이어가 몬스터를 처치
    monster.takeDamage(20);
    assert.strictEqual(monster.hp, 0);
    const wfContext = { eventManager, victim: monster, attacker: player };
    monsterDeathWorkflow(wfContext);

    assert.ok(expEvent, 'exp_gained event should fire');
    assert.ok(lootEvent, 'drop_loot event should fire');
  });
});
