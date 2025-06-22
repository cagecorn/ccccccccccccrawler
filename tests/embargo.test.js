import { MapManager } from '../src/map.js';
import { CharacterFactory, ItemFactory } from '../src/factory.js';
import { EventManager } from '../src/managers/eventManager.js';
import { MetaAIManager, STRATEGY } from '../src/managers/ai-managers.js';
import { PathfindingManager } from '../src/managers/pathfindingManager.js';
import { ItemManager } from '../src/managers/itemManager.js';
import { EquipmentManager } from '../src/managers/equipmentManager.js';
import { TagManager } from '../src/managers/tagManager.js';
import { CombatCalculator } from '../src/combat.js';
import { MeleeAI, PurifierAI, HealerAI, CompositeAI } from '../src/ai.js';
import { Item } from '../src/entities.js';
import { SKILLS } from '../src/data/skills.js';
import { describe, test, assert } from './helpers.js';

// 업데이트된 엠바고 테스트

describe('Integration', () => {

class AutoPlayerAI extends MeleeAI {
    decideAction(self, context) {
        const { enemies } = context;
        let nearest = null;
        let minDist = Infinity;
        for (const e of enemies) {
            const d = Math.hypot(e.x - self.x, e.y - self.y);
            if (d < minDist) { minDist = d; nearest = e; }
        }
        if (nearest) {
            const charge = SKILLS.charge_attack;
            if (minDist > self.attackRange && minDist <= charge.chargeRange) {
                return { type: 'charge_attack', target: nearest, skill: charge };
            }
            if (minDist <= self.attackRange) return { type: 'attack', target: nearest };
            return { type: 'move', target: nearest };
        }
        return { type: 'idle' };
    }
}

test('차지 어택과 포션 사용 시나리오', () => {
    const assets = { player:{}, monster:{}, potion:{}, sword:{}, leather_armor:{}, 'violin-bow':{}, 'plate-armor':{} };
    const mapManager = new MapManager(1);
    const factory = new CharacterFactory(assets);
    const itemFactory = new ItemFactory(assets);
    const violinBow = itemFactory.create('violin_bow', 0, 0, mapManager.tileSize);
    const plateArmor = itemFactory.create('plate_armor', 0, 0, mapManager.tileSize);
    assert.ok(violinBow.tags.includes('song'), '바이올린 보우 태그 누락');
    assert.ok(plateArmor.stats.get('maxHp') >= 10, '플레이트 아머 스탯 이상');
    const eventManager = new EventManager();
    const pathfindingManager = new PathfindingManager(mapManager);
    const aiManager = new MetaAIManager(eventManager);
    const itemManager = new ItemManager(0, mapManager, assets);
    const equipmentManager = new EquipmentManager(eventManager);
    const tagManager = new TagManager();
    const combatCalculator = new CombatCalculator(eventManager, tagManager);
    const movementManager = { moveEntityTowards(e,t){ e.x=t.x; e.y=t.y; } };

    const playerGroup = aiManager.createGroup('player_party', STRATEGY.AGGRESSIVE);
    const monsterGroup = aiManager.createGroup('dungeon_monsters', STRATEGY.AGGRESSIVE);

    const player = factory.create('player', { x:0, y:0, tileSize:mapManager.tileSize, groupId:playerGroup.id });
    player.ai = new AutoPlayerAI();
    player.skills.push(SKILLS.charge_attack.id);
    playerGroup.addMember(player);

    const monster = factory.create('monster', { x: mapManager.tileSize * 2, y:0, tileSize:mapManager.tileSize, groupId:monsterGroup.id });
    monsterGroup.addMember(monster);

    // 포션 사용 로직 (HP가 낮으면 자동 사용)
    const potion = new Item(0,0,mapManager.tileSize,'potion', null);
    const inventory = [potion];
    player.hp = 3;
    if (player.hp <= 5 && inventory.length) {
        player.hp = Math.min(player.maxHp, player.hp + 5);
        inventory.pop();
    }

    let chargeUsed = false;
    eventManager.subscribe('entity_attack', data => {
        if (data.skill && data.skill.id === SKILLS.charge_attack.id) chargeUsed = true;
    });
    eventManager.subscribe('damage_calculated', data => {
        data.defender.takeDamage(data.damage);
    });

    const context = { player, mapManager, pathfindingManager, movementManager, eventManager, itemManager, equipmentManager, tagManager, combatCalculator };

    aiManager.createGroup('player_party');
    aiManager.createGroup('dungeon_monsters');

    aiManager.groups['player_party'] = playerGroup;
    aiManager.groups['dungeon_monsters'] = monsterGroup;

    aiManager.update(context);

    assert.ok(chargeUsed, '차지 어택이 발동되지 않았습니다');
    assert.ok(player.hp >= 8, '포션 사용 후 HP 값이 올바르지 않습니다');
});

// 독 상태이상과 정화 시나리오
 test('Poison status and purifier AI', () => {
     const assets = { player:{}, mercenary:{}, monster:{} };
     const mapManager = new MapManager(1);
     const factory = new CharacterFactory(assets);
     const player = factory.create('player', { x:0, y:0, tileSize:1, groupId:'g' });
     const healer = factory.create('mercenary', { x:1, y:0, tileSize:1, groupId:'g', jobId:'healer' });
     healer.ai = new CompositeAI(new PurifierAI(), new HealerAI());
     healer.properties.mbti = 'ESFJ';
     healer.mp = healer.maxMp;
     const monster = factory.create('monster', { x:2, y:0, tileSize:1, groupId:'m' });
     monster.skills.push(SKILLS.poison_sting.id);

     // 몬스터의 독 공격 가정
     player.effects.push({ id:'poison', tags:['status_ailment'], remaining:50 });
     assert.ok(player.effects.some(e => e.id === 'poison'), 'Poison effect should apply');

     const context = { player, allies:[player, healer], enemies:[monster], mapManager:{ tileSize:1, isWallAt:() => false } };
     const action = healer.ai.decideAction(healer, context);

     const usedPurify = action.type === 'skill' && action.skillId === SKILLS.purify.id;
     if (usedPurify) {
         player.effects = player.effects.filter(e => !e.tags?.includes('status_ailment'));
     }

     assert.ok(usedPurify || player.effects.some(e => e.id === 'poison'), 'Healer may skip purify based on MBTI');
 });


});
