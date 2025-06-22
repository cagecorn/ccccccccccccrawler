export class EquipmentManager {
    constructor(eventManager = null) {
        this.eventManager = eventManager;
        this.tagManager = null;
        console.log('[EquipmentManager] Initialized');
    }

    setTagManager(tagManager) {
        this.tagManager = tagManager;
    }

    equip(entity, item, inventory) {
        const slot = this._getSlotForItem(item);
        if (!slot) return;

        const oldItem = entity.equipment[slot];
        if (oldItem?.tags.includes('emblem')) {
            this.eventManager?.publish('emblem_unequipped', { entity });
        }
        if (oldItem && inventory) {
            inventory.push(oldItem);
        }

        entity.equipment[slot] = item;

        if (entity.stats && typeof entity.stats.updateEquipmentStats === 'function') {
            entity.stats.updateEquipmentStats();
        }
        if (typeof entity.updateAI === 'function') {
            entity.updateAI();
        }
        if (this.tagManager && typeof this.tagManager.applyWeaponTags === 'function') {
            this.tagManager.applyWeaponTags(entity);
        }

        if (this.eventManager && item) {
            this.eventManager.publish('log', { message: `${entity.constructor.name}(이)가 ${item.name} (을)를 장착했습니다.` });
            this.eventManager.publish('equipment_changed', { entity });
            if (item.tags.includes('emblem')) {
                this.eventManager.publish('emblem_equipped', { entity, emblemItem: item });
            }
        }
    }

    /**
     * Remove an equipped item from the given slot.
     *
     * @param {Object} entity - The character losing the item.
     * @param {string} slot - 'weapon' or 'armor'.
     * @param {Array|null} inventory - Optional array to store the removed item.
     */
    unequip(entity, slot, inventory = null) {
        if (!slot || !entity.equipment[slot]) return;

        const oldItem = entity.equipment[slot];
        if (oldItem?.tags.includes('emblem')) {
            this.eventManager?.publish('emblem_unequipped', { entity });
        }
        if (oldItem && inventory) {
            inventory.push(oldItem);
        }

        entity.equipment[slot] = null;

        if (entity.stats && typeof entity.stats.updateEquipmentStats === 'function') {
            entity.stats.updateEquipmentStats();
        }
        if (typeof entity.updateAI === 'function') {
            entity.updateAI();
        }
        if (this.tagManager && slot === 'weapon' && typeof this.tagManager.applyWeaponTags === 'function') {
            this.tagManager.applyWeaponTags(entity);
        }

        if (this.eventManager) {
            this.eventManager.publish('log', { message: `${entity.constructor.name}(이)가 ${slot}을/를 해제했습니다.` });
            this.eventManager.publish('equipment_changed', { entity });
        }
    }

    _getSlotForItem(item) {
        if (!item) return null;
        // 1. 아이템 데이터에 명시된 slot을 최우선으로 사용합니다.
        if (item.slot) return item.slot;

        // 2. 기존 로직 (하위 호환용)
        if ((item.tags && item.tags.includes('weapon')) || item.type === 'weapon') return 'main_hand';
        if ((item.tags && item.tags.includes('armor')) || item.type === 'armor') return 'armor';
        return null;
    }
}
