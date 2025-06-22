import { SYNERGIES } from '../data/synergies.js';

export class SynergyManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.activeBonuses = new WeakMap();
        if (this.eventManager) {
            this.eventManager.subscribe('equipment_changed', (data) =>
                this.updateSynergies(data.entity)
            );
        }
    }

    updateSynergies(entity) {
        this.removeAllSynergyBonuses(entity);
        const synergyCounts = {};
        for (const slot in entity.equipment) {
            const item = entity.equipment[slot];
            if (item && Array.isArray(item.synergies)) {
                for (const key of item.synergies) {
                    synergyCounts[key] = (synergyCounts[key] || 0) + 1;
                }
            }
        }
        for (const key in synergyCounts) {
            this.applySynergyBonus(entity, key, synergyCounts[key]);
        }
        if (this.eventManager) {
            this.eventManager.publish('stats_changed', { entity });
        }
    }

    applySynergyBonus(entity, synergyKey, count) {
        const data = SYNERGIES[synergyKey];
        if (!data) return;
        let active = null;
        for (const bonus of data.bonuses) {
            if (count >= bonus.count) {
                active = bonus;
            }
        }
        if (active) {
            console.log(
                `시너지 [${data.name}] ${active.count}단계 활성화: ${active.description}`
            );

            if (!this.activeBonuses.has(entity)) this.activeBonuses.set(entity, {});
            this.activeBonuses.get(entity)[synergyKey] = active;

            if (active.stats && entity.stats) {
                for (const [stat, val] of Object.entries(active.stats)) {
                    entity.stats.increaseBaseStat(stat, val);
                }
            }
        }
    }

    removeAllSynergyBonuses(entity) {
        const record = this.activeBonuses.get(entity);
        if (!record || !entity.stats) return;

        for (const bonus of Object.values(record)) {
            if (bonus.stats) {
                for (const [stat, val] of Object.entries(bonus.stats)) {
                    entity.stats.increaseBaseStat(stat, -val);
                }
            }
        }
        this.activeBonuses.set(entity, {});
    }
}
