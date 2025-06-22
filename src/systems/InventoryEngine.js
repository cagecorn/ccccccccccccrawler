export class InventoryEngine {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.inventories = new Map();
        console.log('[InventoryEngine] Initialized');
    }

    createInventory(entityId, capacity = 16) {
        if (!this.inventories.has(entityId)) {
            this.inventories.set(entityId, { items: [], capacity });
        }
    }

    addItem(entityId, itemToAdd) {
        const inv = this.inventories.get(entityId);
        if (!inv) return false;
        const existing = inv.items.find(i => i.baseId === itemToAdd.baseId && i.stackable);
        if (existing) {
            existing.quantity = (existing.quantity || 1) + (itemToAdd.quantity || 1);
            this.eventManager?.publish('inventory_updated', { entityId });
            return true;
        }
        if (inv.items.length < inv.capacity) {
            inv.items.push(itemToAdd);
            this.eventManager?.publish('inventory_updated', { entityId });
            return true;
        }
        this.eventManager?.publish('log', { message: '인벤토리가 가득 찼습니다!', color: 'orange' });
        return false;
    }

    removeItem(entityId, index) {
        const inv = this.inventories.get(entityId);
        if (!inv) return;
        if (index >= 0 && index < inv.items.length) {
            inv.items.splice(index, 1);
            this.eventManager?.publish('inventory_updated', { entityId });
        }
    }

    getInventory(entityId) {
        return this.inventories.get(entityId)?.items || null;
    }
}
