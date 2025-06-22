import { EFFECTS } from '../data/effects.js';

export class EffectManager {
    constructor(eventManager, vfxManager = null) {
        this.eventManager = eventManager;
        this.vfxManager = vfxManager;
        console.log("[EffectManager] Initialized");
    }

    addEffect(target, effectId, caster = null) {
        const effectData = EFFECTS[effectId];
        if (!effectData) return;

        // 상태이상 효과라면 저항 스탯을 확인한다
        if (effectData.tags && effectData.tags.includes('status_ailment')) {
            const resistStatName = `${effectId}Resist`;
            const resistance = target.stats?.get?.(resistStatName) ?? 0;
            if (Math.random() < resistance) {
                this.eventManager.publish('log', {
                    message: `${target.constructor.name}이(가) [${effectData.name}] 효과에 저항했습니다!`,
                    color: 'dodgerblue'
                });
                return;
            }
        }

        const existingEffect = target.effects.find(e => e.id === effectId);
        if (existingEffect) {
            existingEffect.remaining = effectData.duration;
            return;
        }

        const newEffect = {
            id: effectId,
            ...effectData,
            remaining: effectData.duration,
            emitter: null,
            caster: caster,
        };

        if (this.vfxManager && newEffect.particle) {
            newEffect.emitter = this.vfxManager.addEmitter(target.x, target.y, {
                followTarget: target,
                offsetX: target.width / 2,
                offsetY: target.height / 2,
                spawnRate: 2,
                duration: -1,
                particleOptions: newEffect.particle,
            });
        }

        if (newEffect.stats && target.stats) {
            for (const [stat, val] of Object.entries(newEffect.stats)) {
                const baseKey = stat === 'movementSpeed' ? 'movement' : stat;
                target.stats.increaseBaseStat(baseKey, val);
            }
        }

        if (newEffect.type === 'shield') {
            target.shield = (target.shield || 0) + newEffect.shieldAmount;
        } else if (newEffect.type === 'damage_buff') {
            target.damageBonus = (target.damageBonus || 0) + newEffect.bonusDamage;
        }

        target.effects.push(newEffect);
        this.eventManager.publish('stats_changed', { entity: target });
    }

    removeEffect(target, effect) {
        if (this.vfxManager && effect.emitter) {
            this.vfxManager.removeEmitter(effect.emitter);
            effect.emitter = null;
        }

        if (effect.stats && target.stats) {
            for (const [stat, val] of Object.entries(effect.stats)) {
                const baseKey = stat === 'movementSpeed' ? 'movement' : stat;
                target.stats.increaseBaseStat(baseKey, -val);
            }
        }

        if (effect.type === 'shield') {
            target.shield = Math.max(0, target.shield - (effect.shieldAmount || 0));
        } else if (effect.type === 'damage_buff') {
            target.damageBonus = Math.max(0, target.damageBonus - (effect.bonusDamage || 0));
        }

        target.effects = target.effects.filter(e => e !== effect);
        this.eventManager.publish('stats_changed', { entity: target });
    }

    removeEffectsByTag(target, tag) {
        if (!target.effects || target.effects.length === 0) return;
        for (const effect of [...target.effects]) {
            if (effect.tags && effect.tags.includes(tag)) {
                this.removeEffect(target, effect);
            }
        }
    }

    update(entities) {
        entities.forEach(entity => {
            if (entity.effects.length === 0) return;

            for (let i = entity.effects.length - 1; i >= 0; i--) {
                const effect = entity.effects[i];
                effect.remaining--;

                if (effect.damagePerTurn && effect.remaining % 100 === 0) {
                    entity.takeDamage(effect.damagePerTurn);
                    this.eventManager.publish('log', {
                        message: `[${effect.name}] 효과로 ${entity.constructor.name}가 ${effect.damagePerTurn}의 피해를 입었습니다.`,
                        color: 'orange',
                    });
                }

                if (effect.remaining % 100 === 0 && Math.random() < 0.1) {
                    this.eventManager.publish('log', {
                        message: `${entity.constructor.name}가 [${effect.name}] 효과를 이겨냈습니다!`,
                        color: 'lightgreen',
                    });
                    this.removeEffect(entity, effect);
                    continue;
                }

                if (effect.remaining <= 0) {
                    this.removeEffect(entity, effect);
                }
            }
        });
    }
}
