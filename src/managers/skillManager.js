import { SKILLS } from '../data/skills.js';

export class SkillManager {
    constructor(
        eventManager = null,
        vfxManager = null,
        projectileManager = null,
        motionManager = null,
        factory = null,
        metaAIManager = null,
        knockbackEngine = null
    ) {
        this.eventManager = eventManager;
        this.vfxManager = vfxManager;
        this.projectileManager = projectileManager;
        this.motionManager = motionManager;
        this.factory = factory;
        this.metaAIManager = metaAIManager;
        this.knockbackEngine = knockbackEngine;
        this.effectManager = null;
        this.monsterManager = null;
        console.log("[SkillManager] Initialized");

        if (this.eventManager) {
            this.eventManager.subscribe('skill_used', ({ caster, skill, target }) => {
                this.applySkillEffects(caster, skill, target);
            });
        }
    }

    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }

    setManagers(effectManager, factory, metaAIManager, monsterManager = null) {
        this.effectManager = effectManager;
        this.factory = factory;
        this.metaAIManager = metaAIManager;
        this.monsterManager = monsterManager;
    }

    applySkillEffects(caster, skill, target = null) {
        if (!skill || !this.effectManager) return;

        const process = (receiver, eff) => {
            if (typeof eff === 'string') {
                this.effectManager.addEffect(receiver, eff);
                return;
            }

            if (eff.type === 'knockback' && this.knockbackEngine) {
                this.knockbackEngine.apply(caster, receiver, eff.strength || 5);
                return;
            }

            if (eff.id) {
                this.effectManager.addEffect(receiver, eff.id);
            }
        };

        if (skill.effects) {
            if (skill.effects.self) {
                for (const eff of skill.effects.self) {
                    process(caster, eff);
                }
            }
            if (skill.effects.target && target) {
                for (const eff of skill.effects.target) {
                    process(target, eff);
                }
            }
        }
        if (skill.removeTags && target) {
            for (const tag of skill.removeTags) {
                this.effectManager.removeEffectsByTag(target, tag);
            }
        }

        if (skill.teleport) {
            this._handleTeleport(caster);
        }

        if (skill.id === SKILLS.summon_skeleton.id) {
            this._handleSummon(caster);
        }
    }

    _handleTeleport(caster) {
        if (!caster.teleportSavedPos) {
            caster.teleportSavedPos = { x: caster.x, y: caster.y };
            this.eventManager?.publish('log', { message: '🌀 위치를 저장했습니다.' });
        } else if (!caster.teleportReturnPos) {
            caster.teleportReturnPos = { x: caster.x, y: caster.y };
            caster.x = caster.teleportSavedPos.x;
            caster.y = caster.teleportSavedPos.y;
            this.eventManager?.publish('log', { message: '🌀 저장된 위치로 이동했습니다.' });
        } else {
            const { x, y } = caster.teleportReturnPos;
            caster.teleportReturnPos = null;
            caster.x = x;
            caster.y = y;
            this.eventManager?.publish('log', { message: '🌀 이전 위치로 돌아왔습니다.' });
        }
    }

    _handleSummon(caster) {
        if (!this.factory) return;
        const pos = { x: caster.x, y: caster.y };
        const monster = this.factory.create('monster', {
            x: pos.x,
            y: pos.y,
            tileSize: caster.tileSize,
            groupId: caster.groupId,
            image: this.factory.assets?.skeleton,
            baseStats: { strength: 3, agility: 3, endurance: 5, movement: 6, expValue: 0 }
        });
        monster.isFriendly = caster.isFriendly;
        monster.properties.summonedBy = caster.id;
        if (this.monsterManager) {
            this.monsterManager.monsters.push(monster);
        }
        if (this.metaAIManager) {
            const group = this.metaAIManager.groups[caster.groupId];
            if (group) group.addMember(monster);
        }
    }
}
