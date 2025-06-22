export class EffectIconManager {
    constructor(eventManager = null, assets = {}) {
        this.eventManager = eventManager;
        this.assets = assets;
    }

    setAssets(assets) {
        this.assets = assets;
    }

    render(ctx, entities, effectsData) {
        if (!ctx || !entities) return;
        const size = 12;
        entities.forEach(ent => {
            if (!ent.effects || ent.effects.length === 0) return;
            const buffs = [];
            const debuffs = [];
            ent.effects.forEach(eff => {
                const data = effectsData[eff.id];
                if (!data || !data.iconKey) return;
                const img = this.assets[data.iconKey];
                if (!img) return;
                const tags = data.tags || [];
                if (tags.includes('debuff') || tags.includes('status_ailment')) {
                    debuffs.push({ img, eff });
                } else {
                    buffs.push({ img, eff });
                }
            });
            let xTop = ent.x;
            const yTop = ent.y - size - 2;
            buffs.forEach((b, i) => {
                ctx.drawImage(b.img, xTop + i * (size + 2), yTop, size, size);
                if (b.eff.duration) {
                    const turns = Math.ceil(b.eff.remaining / 100);
                    ctx.fillStyle = 'white';
                    ctx.font = '8px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(turns, xTop + i * (size + 2) + size / 2, yTop + size - 2);
                }
            });
            const yBottom = ent.y + ent.height + 2;
            debuffs.forEach((b, i) => {
                ctx.drawImage(b.img, ent.x + i * (size + 2), yBottom, size, size);
                if (b.eff.duration) {
                    const turns = Math.ceil(b.eff.remaining / 100);
                    ctx.fillStyle = 'white';
                    ctx.font = '8px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(turns, ent.x + i * (size + 2) + size / 2, yBottom + size - 2);
                }
            });
        });
    }
}
