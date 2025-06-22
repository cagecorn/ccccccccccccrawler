import { Item } from '../entities.js';

export class ItemManager {
    constructor(count = 0, mapManager = null, assets = null) {
        this.items = [];
        this.mapManager = mapManager;
        this.assets = assets;
        console.log("[ItemManager] Initialized");

        if (count > 0 && this.mapManager && this.assets) {
            this._spawnItems(count);
        }
    }

    _spawnItems(count) {
        for (let i = 0; i < count; i++) {
            const pos = this.mapManager.getRandomFloorPosition();
            if (pos) {
                if (Math.random() < 0.5) {
                    this.items.push(new Item(pos.x, pos.y, this.mapManager.tileSize, 'gold', this.assets.gold));
                } else {
                    this.items.push(new Item(pos.x, pos.y, this.mapManager.tileSize, 'potion', this.assets.potion));
                }
            }
        }
    }

    addItem(item) {
        this.items.push(item);
    }

    removeItem(item) {
        const idx = this.items.indexOf(item);
        if (idx !== -1) {
            this.items.splice(idx, 1);
        }
    }

    update() {
        for (const item of this.items) {
            if (typeof item.update === 'function') {
                item.update();
            }
        }
    }

    render(ctx) {
        for (const item of this.items) {
            item.render(ctx);
        }
    }
}
