// src/ai-managers.js
import { SKILLS } from '../data/skills.js';
import { WEAPON_SKILLS } from '../data/weapon-skills.js';
import { MbtiEngine } from './ai/MbtiEngine.js';

export const STRATEGY = {
    IDLE: 'idle',
    AGGRESSIVE: 'aggressive',
    DEFENSIVE: 'defensive',
};

class AIGroup {
    constructor(id, strategy = STRATEGY.AGGRESSIVE) {
        this.id = id;
        this.members = [];
        this.strategy = strategy;
    }
    addMember(entity) { this.members.push(entity); }
    removeMember(entityId) {
        this.members = this.members.filter(m => m.id !== entityId);
    }
}

export class MetaAIManager {
    constructor(eventManager) {
        this.groups = {};
        // 내부 엔진 생성
        this.mbtiEngine = new MbtiEngine(eventManager);
        // "몬스터 제거" 이벤트를 구독하여 그룹에서 멤버를 제거
        eventManager.subscribe('entity_removed', (data) => {
            for (const groupId in this.groups) {
                this.groups[groupId].removeMember(data.victimId);
            }
        });
    }

    createGroup(id, strategy) {
        if (!this.groups[id]) {
            this.groups[id] = new AIGroup(id, strategy);
        }
        return this.groups[id];
    }
    
    setGroupStrategy(id, strategy) {
        if (this.groups[id]) {
            this.groups[id].strategy = strategy;
        }
    }

    executeAction(entity, action, context) {
        if (!action || !action.type || action.type === 'idle') return;
        const { eventManager } = context;

        // 행동 결정 로그는 너무 잦은 호출이 성능 문제를 일으킬 수 있어
        // 간단한 쿨다운 메커니즘으로 빈도를 제한한다.
        if (!entity._aiLogCooldown) entity._aiLogCooldown = 0;
        if (entity._aiLogCooldown <= 0) {
            eventManager.publish('debug', {
                tag: 'AI',
                message: `${entity.constructor.name} (id: ${entity.id.substr(0,4)}) decided action: ${action.type}`
            });
            entity._aiLogCooldown = 30; // 약 0.5초(60fps 기준) 동안 로그 억제
        } else {
            entity._aiLogCooldown--;
        }

        switch (action.type) {
            case 'attack':
                if (entity.attackCooldown === 0) {
                    const weaponTags = entity.equipment?.weapon?.tags || [];
                    const isRanged = weaponTags.includes('ranged') || weaponTags.includes('bow');
                    eventManager.publish('entity_attack', { attacker: entity, defender: action.target });
                    if (isRanged && context.projectileManager) {
                        const projSkill = {
                            projectile: 'arrow',
                            damage: entity.attackPower,
                            knockbackStrength: 32
                        };
                        context.projectileManager.create(entity, action.target, projSkill);
                    }
                    const baseCd = 60;
                    entity.attackCooldown = Math.max(1, Math.round(baseCd / (entity.attackSpeed || 1)));
                }
                break;
            case 'skill':
                const isSilenced = entity.effects?.some(e => e.id === 'silence');
                if (isSilenced) {
                    eventManager.publish('log', { message: `[침묵] 상태라 스킬을 사용할 수 없습니다.`, color: 'grey' });
                    break;
                }
                const skill = SKILLS[action.skillId];
                if (
                    skill &&
                    entity.mp >= skill.manaCost &&
                    (entity.skillCooldowns[action.skillId] || 0) <= 0
                ) {
                    entity.mp -= skill.manaCost;
                    entity.skillCooldowns[action.skillId] = skill.cooldown;
                    eventManager.publish('skill_used', { caster: entity, skill, target: action.target });
                    if (context.speechBubbleManager) {
                        context.speechBubbleManager.addBubble(entity, skill.name);
                    }
                    const baseCd = 60;
                    entity.attackCooldown = Math.max(1, Math.round(baseCd / (entity.attackSpeed || 1)));
                }
                break;
            case 'backstab_teleport': {
                const { target } = action;
                const { mapManager, vfxManager } = context;
                if (!target || !mapManager || !vfxManager) break;

                const fromPos = { x: entity.x, y: entity.y };
                const behindX = target.x - (target.direction * (mapManager.tileSize * 0.8));
                const behindY = target.y;
                const toPos = { x: behindX, y: behindY };

                vfxManager.addTeleportEffect(entity, fromPos, toPos, () => {
                    this.executeAction(entity, { type: 'attack', target }, context);
                });
                break;
            }
            case 'weapon_skill': {
                const skillData = WEAPON_SKILLS[action.skillId];
                if (!skillData) break;
                const weapon = entity.equipment?.weapon;
                if (!weapon || !weapon.weaponStats?.canUseSkill(action.skillId)) break;

                eventManager.publish('log', {
                    message: `${entity.constructor.name}의 ${weapon.name}(이)가 [${skillData.name}] 스킬을 사용합니다!`,
                    color: 'yellow'
                });

                if (action.skillId === 'charge' && context.motionManager && action.target) {
                    context.motionManager.dashTowards(
                        entity,
                        action.target,
                        3,
                        context.enemies,
                        context.eventManager,
                        context.vfxManager,
                        context.assets['strike-effect']
                    );
                }

                if (action.skillId === 'pull' && context.motionManager && action.target) {
                    // vfxManager를 pullTargetTo에 전달합니다.
                    context.motionManager.pullTargetTo(action.target, entity, context.vfxManager);
                }

                if (action.skillId === 'charge_shot' && context.effectManager) {
                    context.effectManager.addEffect(action.target, 'charging_shot_effect');
                }

                if (action.skillId === 'parry_stance' && context.effectManager) {
                    context.effectManager.addEffect(entity, 'parry_ready');
                }

                if (context.speechBubbleManager) {
                    context.speechBubbleManager.addBubble(entity, skillData.name);
                }

                weapon.weaponStats.setCooldown(skillData.cooldown);
                break; }
            case 'charge_attack': {
                const { motionManager, eventManager: ev, enemies, vfxManager, assets } = context;
                const { target, skill } = action;

                if (motionManager) {
                    motionManager.dashTowards(
                        entity,
                        target,
                        Math.floor(skill.chargeRange / context.mapManager.tileSize),
                        enemies,
                        ev,
                        vfxManager,
                        assets['strike-effect']
                    );
                } else {
                    const dx = target.x - entity.x;
                    const dy = target.y - entity.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    entity.x = target.x - (dx / dist) * entity.width;
                    entity.y = target.y - (dy / dist) * entity.height;
                    ev.publish('entity_attack', { attacker: entity, defender: target, skill });
                }

                entity.mp -= skill.manaCost;
                entity.skillCooldowns[skill.id] = skill.cooldown;
                entity.attackCooldown = Math.max(1, Math.round(60 / (entity.attackSpeed || 1)));
                break; }
            case 'move':
                const { movementManager } = context;
                if (movementManager) {
                    movementManager.moveEntityTowards(entity, action.target, context);
                }
                break;
        }
    }

    update(context) {
        for (const groupId in this.groups) {
            const group = this.groups[groupId];
            const currentContext = {
                ...context,
                allies: group.members,
                enemies: Object.values(this.groups).filter(g => g.id !== groupId).flatMap(g => g.members)
            };

            const membersSorted = [...group.members].sort((a,b) => (b.attackSpeed || 1) - (a.attackSpeed || 1));
            for (const member of membersSorted) {
                if (member.hp <= 0) continue;

                // 에어본 상태이면, 이번 턴 행동을 건너뜀
                if (Array.isArray(member.effects) && member.effects.some(e => e.id === 'airborne')) {
                    if (typeof member.update === 'function') member.update(currentContext);
                    continue;
                }

                // 1단계: 쿨다운 감소 등 상태 업데이트
                if (typeof member.update === 'function') {
                    member.update(currentContext);
                } else {
                    if (member.attackCooldown > 0) member.attackCooldown--;
                    if (typeof member.applyRegen === 'function') member.applyRegen();
                }

                // 2단계: 행동 결정
                let action = { type: 'idle' };

                // 2.1: 역할(Role) AI가 먼저 행동을 결정 (힐, 소환 등)
                if (member.roleAI) {
                    action = member.roleAI.decideAction(member, currentContext);
                }

                // 2.2: 역할 AI가 특별한 행동을 하지 않으면, 무기(Weapon) AI가 전투 행동을 결정
                if (action.type === 'idle') {
                    const weapon = member.equipment?.weapon;
                    const combatAI = context.microItemAIManager?.getWeaponAI(weapon);
                    if (combatAI) {
                        action = combatAI.decideAction(member, weapon, currentContext);
                    }
                }

                // 2.3: 무기 AI도 할 일이 없으면, 최후의 보루(Fallback) AI가 기본 행동 결정
                if (action.type === 'idle') {
                    if (member.fallbackAI) {
                        action = member.fallbackAI.decideAction(member, currentContext);
                    } else if (member.ai && !member.roleAI) { // 이전 버전 호환성
                        action = member.ai.decideAction(member, currentContext);
                    }
                }
                
                // AI가 행동을 결정한 직후 MBTI 엔진 처리
                this.mbtiEngine.process(member, { ...action, context: currentContext });

                this.executeAction(member, action, currentContext);
            }
        }
    }
}
