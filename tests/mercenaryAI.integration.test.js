import { describe, test, assert } from './helpers.js';
import { EventManager } from '../src/managers/eventManager.js';
import { MetaAIManager, STRATEGY } from '../src/managers/ai-managers.js';
import { CharacterFactory } from '../src/factory.js';
import { MicroItemAIManager } from '../src/managers/microItemAIManager.js';
import { HealerAI } from '../src/ai.js';

// 통합 테스트: 용병들이 자신의 스킬/무기 AI에 따라 행동하는지 확인

describe('Integration', () => {
  test('mercenary AIs act according to their roles and weapons', () => {
    const assets = { player:{}, mercenary:{}, monster:{} };
    const factory = new CharacterFactory(assets);
    const eventManager = new EventManager();
    const aiManager = new MetaAIManager(eventManager);
    const microItemAIManager = new MicroItemAIManager();

    const mapStub = { tileSize:1, isWallAt: () => false };
    const moveStub = { moveEntityTowards: (ent, target) => { ent.x = target.x; ent.y = target.y; } };
    const projectileMgr = { create(){} };
    const effectMgr = { addEffect(){} };
    const motionMgr = { dashTowards(){}, pullTargetTo(){} };
    const vfxMgr = { addTeleportEffect(_f,_t,cb){ if(cb) cb(); }, flashEntity(){}, addSpriteEffect(){}, addParticleBurst(){} };

    const playerGroup = aiManager.createGroup('player_party', STRATEGY.AGGRESSIVE);
    const monsterGroup = aiManager.createGroup('dungeon_monsters', STRATEGY.AGGRESSIVE);

    const player = factory.create('player', { x:0, y:0, tileSize:1, groupId:playerGroup.id });
    player.ai = null; // 플레이어는 직접 조종
    playerGroup.addMember(player);

    const archer = factory.create('mercenary', { x:1, y:0, tileSize:1, groupId:playerGroup.id, jobId:'archer' });
    const healer = factory.create('mercenary', { x:-1, y:0, tileSize:1, groupId:playerGroup.id, jobId:'healer' });
    // PurifierAI가 이동으로 가로채는 것을 막기 위해 HealerAI만 사용한다.
    healer.roleAI = new HealerAI();
    const bard = factory.create('mercenary', { x:0, y:1, tileSize:1, groupId:playerGroup.id, jobId:'bard' });
    playerGroup.addMember(archer);
    playerGroup.addMember(healer);
    playerGroup.addMember(bard);

    const monster = factory.create('monster', { x:5, y:0, tileSize:1, groupId:monsterGroup.id });
    monsterGroup.addMember(monster);

    // 플레이어가 피해를 입어 힐러의 대상이 되도록 설정
    player.hp = Math.floor(player.maxHp / 2);

    const actions = {};
    aiManager.executeAction = (ent, action) => { actions[ent.id] = action; };

    const context = {
      player,
      mapManager: mapStub,
      pathfindingManager: { findPath: () => [] },
      eventManager,
      movementManager: moveStub,
      projectileManager: projectileMgr,
      microItemAIManager,
      effectManager: effectMgr,
      motionManager: motionMgr,
      vfxManager: vfxMgr,
      speechBubbleManager: { addBubble(){} },
    };

    aiManager.update(context);

    assert.ok(actions[archer.id] && actions[archer.id].type !== 'idle', 'archer should act');
    assert.strictEqual(actions[healer.id].type, 'skill', 'healer should attempt to heal');
    assert.strictEqual(actions[bard.id].type, 'skill', 'bard should perform a hymn');
  });
});
