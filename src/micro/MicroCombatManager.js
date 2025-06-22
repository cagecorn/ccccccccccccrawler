const TIER_ORDER = { normal: 1, rare: 2, unique: 3 };

export class MicroCombatManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        console.log('[MicroCombatManager] Initialized');
    }

    resolveAttack(attacker, defender) {
        const weapon = attacker.equipment?.weapon;
        const armor = defender.equipment?.armor;
        if (!weapon || !armor) return;

        this._resolveSingleCombat(weapon, armor, defender);
        this._resolveSingleCombat(armor, weapon, attacker);
    }

    _resolveSingleCombat(attackingItem, defendingItem, owner) {
        if (!attackingItem || !defendingItem) return;
        if (TIER_ORDER[attackingItem.tier] < TIER_ORDER[defendingItem.tier]) {
            return;
        }

        const damage = Math.max(1, (attackingItem.weight || 0) - (defendingItem.toughness || 0));
        defendingItem.durability -= damage;

        if (defendingItem.durability <= 0) {
            if (defendingItem.type === 'weapon') {
                this.eventManager.publish('weapon_disarmed', { owner, weapon: defendingItem });
            } else if (defendingItem.type === 'armor') {
                this.eventManager.publish('armor_broken', { owner, armor: defendingItem });
            }
        }
    }
}
