export class AuraManager {
    constructor(effectManager, eventManager = null, vfxManager = null) {
        this.effectManager = effectManager;
        this.eventManager = eventManager;
        this.vfxManager = vfxManager;
        this.activeAuras = []; // { sourceEntity, auraData, affectedEntities:Set, emitter }
        if (this.eventManager) {
            this.eventManager.subscribe('entity_removed', ({ victimId }) => {
                const match = this.activeAuras.find(a => a.sourceEntity.id === victimId);
                if (match) this.unregisterAura(match.sourceEntity);
            });
            this.eventManager.subscribe('entity_death', ({ victim }) => {
                const match = this.activeAuras.find(a => a.sourceEntity === victim);
                if (match) this.unregisterAura(match.sourceEntity);
            });
        }
        console.log('[AuraManager] Initialized');
    }

    registerAura(sourceEntity, auraData) {
        if (this.activeAuras.some(a => a.sourceEntity.id === sourceEntity.id)) return;
        const record = { sourceEntity, auraData, affectedEntities: new Set() };
        if (this.vfxManager && auraData.skillId === 'regeneration_aura') {
            record.emitter = this.vfxManager.addEmitter(
                sourceEntity.x + sourceEntity.width / 2,
                sourceEntity.y + sourceEntity.height / 2,
                {
                    followTarget: sourceEntity,
                    spawnRate: 2,
                    duration: -1,
                    particleOptions: {
                        color: 'rgba(144, 238, 144, 0.7)',
                        gravity: -0.02,
                        lifespan: 120,
                        speed: 0.5,
                        size: 4,
                    }
                }
            );
        }
        this.activeAuras.push(record);
        console.log(`[AuraManager] ${sourceEntity.name || sourceEntity.id} aura registered.`);
    }

    unregisterAura(sourceEntity) {
        const idx = this.activeAuras.findIndex(a => a.sourceEntity.id === sourceEntity.id);
        if (idx !== -1) {
            const record = this.activeAuras[idx];
            if (record.emitter && typeof record.emitter.stop === 'function') {
                record.emitter.stop();
            }
            this.activeAuras.splice(idx, 1);
            console.log(`[AuraManager] ${sourceEntity.name || sourceEntity.id} aura removed.`);
        }
    }

    update(entities) {
        for (const aura of this.activeAuras) {
            const { sourceEntity, auraData, affectedEntities } = aura;
            const current = new Set();
            for (const entity of entities) {
                if (entity.isFriendly === sourceEntity.isFriendly) {
                    const dist = Math.hypot(entity.x - sourceEntity.x, entity.y - sourceEntity.y);
                    if (dist <= auraData.range) {
                        current.add(entity);
                    }
                }
            }
            for (const ent of current) {
                if (!affectedEntities.has(ent)) {
                    this.effectManager.addEffect(ent, auraData.skillId);
                }
            }
            for (const ent of affectedEntities) {
                if (!current.has(ent)) {
                    this.effectManager.removeEffectsByTag(ent, auraData.skillId);
                }
            }
            aura.affectedEntities = current;
        }
    }
}
