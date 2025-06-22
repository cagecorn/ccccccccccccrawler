export class TraitManager {
    constructor(eventManager = null, assets = null, factory = null) {
        this.eventManager = eventManager;
        this.assets = assets;
        this.factory = factory;
        console.log('[TraitManager] Initialized');
    }

    applyTraits(entity, traitData) {
        const traits = entity?.properties?.traits;
        if (!Array.isArray(traits)) return;
        for (const id of traits) {
            const data = traitData[id];
            if (!data || !data.stats) continue;
            for (const [stat, val] of Object.entries(data.stats)) {
                if (entity.stats && typeof entity.stats.increaseBaseStat === 'function') {
                    entity.stats.increaseBaseStat(stat, val);
                }
            }
        }
        if (entity.stats && typeof entity.stats.recalculate === 'function') {
            entity.stats.recalculate();
        }
    }
}
