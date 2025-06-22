import { TRAITS } from '../data/traits.js';

export class MercenaryManager {
    constructor(eventManager = null, assets = null, factory = null) {
        this.eventManager = eventManager;
        this.assets = assets;
        this.factory = factory;
        this.mercenaries = [];
        this.equipmentRenderManager = null;
        this.traitManager = null;
        console.log("[MercenaryManager] Initialized");

        if (this.eventManager) {
            this.eventManager.subscribe('entity_removed', (data) => {
                this.mercenaries = this.mercenaries.filter(m => m.id !== data.victimId);
            });
        }
    }

    setTraitManager(traitManager) {
        this.traitManager = traitManager;
    }

    hireMercenary(jobId, x, y, tileSize, groupId) {
        if (!this.factory || !this.assets) {
            return null;
        }
        const imageKey = this.assets[jobId] ? jobId : 'mercenary';
        const merc = this.factory.create('mercenary', {
            x,
            y,
            tileSize,
            groupId,
            jobId,
            image: this.assets[imageKey],
        });
        if (merc) {
            if (this.equipmentRenderManager) {
                merc.equipmentRenderManager = this.equipmentRenderManager;
            }
            if (this.traitManager) {
                this.traitManager.applyTraits(merc, TRAITS);
            }
            this.mercenaries.push(merc);
        }
        return merc;
    }

    render(ctx) {
        for (const merc of this.mercenaries) {
            if (merc.render) merc.render(ctx);
        }
    }
}
