export class ParasiteManager {
    constructor(eventManager = null) {
        this.eventManager = eventManager;
        console.log('[ParasiteManager] Initialized');
    }

    equip(entity, parasite) {
        if (!entity.consumables) entity.consumables = [];
        if (entity.consumables.length >= (entity.consumableCapacity || 0)) return false;
        parasite.quantity = 1;
        entity.consumables.push(parasite);
        return true;
    }

    hasParasite(entity) {
        return Array.isArray(entity.consumables) && entity.consumables.some(i => i.type === 'parasite' || i.tags?.includes('parasite'));
    }

    combineParasites(entity, baseId) {
        if (!Array.isArray(entity.consumables)) return false;
        const matches = entity.consumables.filter(i => i.baseId === baseId);
        if (matches.length < 2) return false;
        const target = matches[0];
        target.rank = (target.rank || 1) + 1;
        const idx = entity.consumables.indexOf(matches[1]);
        if (idx !== -1) entity.consumables.splice(idx, 1);
        return true;
    }
}
