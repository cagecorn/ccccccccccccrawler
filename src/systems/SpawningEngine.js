import { rollOnTable } from '../utils/random.js';
import { getMonsterLootTable } from '../data/tables.js';
import { adjustMonsterStatsForAquarium } from '../utils/aquariumUtils.js';
import { TRAITS } from '../data/traits.js';

export class SpawningEngine {
    constructor(monsterManager, factory, mapManager, equipmentManager, parasiteManager, equipmentRenderManager = null) {
        this.monsterManager = monsterManager;
        this.factory = factory;
        this.mapManager = mapManager;
        this.equipmentManager = equipmentManager;
        this.parasiteManager = parasiteManager;
        this.equipmentRenderManager = equipmentRenderManager;
        console.log('[SpawningEngine] Initialized');
    }

    spawnInitial(count) {
        const monsters = [];
        for (let i = 0; i < count; i++) {
            const pos = this.mapManager.getRandomFloorPosition();
            if (!pos) continue;

            let stats = {};
            if (this.mapManager.name === 'aquarium') {
                stats = adjustMonsterStatsForAquarium(stats);
            }

            const monster = this.factory.create('monster', {
                x: pos.x,
                y: pos.y,
                tileSize: this.mapManager.tileSize,
                groupId: 'dungeon_monsters',
                image: this.factory.assets.monster,
                baseStats: stats
            });

            if (this.monsterManager.traitManager) {
                this.monsterManager.traitManager.applyTraits(monster, TRAITS);
            }

            if (this.equipmentRenderManager) {
                monster.equipmentRenderManager = this.equipmentRenderManager;
            }

            this._equipInitialGear(monster);
            monsters.push(monster);
        }

        this.monsterManager.monsters.push(...monsters);

        if (this.monsterManager.metaAI) {
            const group = this.monsterManager.metaAI.groups['dungeon_monsters'];
            if (group) monsters.forEach(m => group.addMember(m));
        }

        console.log(`[SpawningEngine] Spawned ${monsters.length} initial monsters.`);
    }

    spawnWave({ count = 1, monsterType = 'monster', groupId = 'dungeon_monsters', image = null }) {
        const monsters = [];
        for (let i = 0; i < count; i++) {
            const pos = this.mapManager.getRandomFloorPosition();
            if (!pos) continue;

            const monster = this.factory.create(monsterType, {
                x: pos.x,
                y: pos.y,
                tileSize: this.mapManager.tileSize,
                groupId,
                image: image || this.factory.assets[monsterType] || this.factory.assets.monster,
            });

            if (this.monsterManager.traitManager) {
                this.monsterManager.traitManager.applyTraits(monster, TRAITS);
            }

            if (this.equipmentRenderManager) {
                monster.equipmentRenderManager = this.equipmentRenderManager;
            }

            this._equipInitialGear(monster);
            monsters.push(monster);
        }

        this.monsterManager.monsters.push(...monsters);

        if (this.monsterManager.metaAI) {
            const group = this.monsterManager.metaAI.groups[groupId];
            if (group) monsters.forEach(m => group.addMember(m));
        }

        console.log(`[SpawningEngine] Spawned wave of ${monsters.length} ${monsterType}.`);
    }

    _equipInitialGear(monster) {
        if (!monster) return;

        monster.consumables = [];
        monster.consumableCapacity = 4;

        const weaponId = rollOnTable(getMonsterLootTable('monster'));
        const weapon = this.factory.itemFactory.create(weaponId, 0, 0, this.mapManager.tileSize);
        if (weapon && (weapon.type === 'weapon' || weapon.tags.includes('weapon'))) {
            this.equipmentManager.equip(monster, weapon, null);
        }

        const armorChoices = ['leather_armor', 'plate_armor', 'metal_armor', 'wizard_robe'];
        const armorId = armorChoices[Math.floor(Math.random() * armorChoices.length)];
        const armor = this.factory.itemFactory.create(armorId, 0, 0, this.mapManager.tileSize);
        if (armor) {
            this.equipmentManager.equip(monster, armor, null);
        }

        if (Math.random() < 0.5) {
            const shield = this.factory.itemFactory.create('shield_basic', 0, 0, this.mapManager.tileSize);
            if (shield) {
                this.equipmentManager.equip(monster, shield, null);
            }
        }

        const consumableId = rollOnTable(getMonsterLootTable('monster'));
        const consumable = this.factory.itemFactory.create(consumableId, 0, 0, this.mapManager.tileSize);
        if (consumable && consumable.tags.includes('consumable')) {
            monster.addConsumable(consumable);
        }

        if (this.parasiteManager && Math.random() < 0.15) {
            const pid = Math.random() < 0.5 ? 'parasite_leech' : 'parasite_worm';
            const pItem = this.factory.itemFactory.create(pid, 0, 0, this.mapManager.tileSize);
            if (pItem) this.parasiteManager.equip(monster, pItem);
        }
    }
}
