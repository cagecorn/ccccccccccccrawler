import { rollOnTable } from '../utils/random.js';
import { getMonsterLootTable } from '../data/tables.js';
import { adjustMonsterStatsForAquarium } from '../utils/aquariumUtils.js';
import { TRAITS } from '../data/traits.js';

export class QuantumEngine {
    constructor(factory, monsterManager, metaAIManager, equipmentManager = null, parasiteManager = null, traitManager = null, mapManager = null) {
        this.factory = factory;
        this.monsterManager = monsterManager;
        this.metaAIManager = metaAIManager;
        this.equipmentManager = equipmentManager;
        this.parasiteManager = parasiteManager;
        this.traitManager = traitManager;
        this.mapManager = mapManager;
    }

    /**
     * 잠재적 몬스터 목록을 받아, 활성화 조건을 만족하는 몬스터들을 실체화합니다.
     * @param {Array<object>} potentialMonsters - 검사할 잠재적 몬스터 데이터 목록
     * @param {object} fogManager - 안개 정보
     * @returns {{newlyActivated: Array<object>, activatedIndexes: Array<number>}}
     */
    processActivations(potentialMonsters, fogManager) {
        const newlyActivated = [];
        const activatedIndexes = [];
        const TILE_SIZE = fogManager.tileSize;

        potentialMonsters.forEach((data, index) => {
            const tileX = Math.floor(data.x / TILE_SIZE);
            const tileY = Math.floor(data.y / TILE_SIZE);

            // 1. 활성화 조건 검사: 안개가 걷혔는가?
            if (fogManager.isVisible(tileX, tileY)) {
                const monsterType = data.monsterType || 'monster';
                let baseStats = { ...(data.baseStats || {}) };
                if (this.mapManager && this.mapManager.name === 'aquarium') {
                    baseStats = adjustMonsterStatsForAquarium(baseStats);
                }

                const monster = this.factory.create(monsterType, {
                    ...data,
                    baseStats,
                    tileSize: data.tileSize || TILE_SIZE,
                    image: data.image || this.factory.assets[monsterType] || this.factory.assets.monster,
                    groupId: data.groupId || 'dungeon_monsters',
                });

                if (this.traitManager) {
                    this.traitManager.applyTraits(monster, TRAITS);
                }

                if (this.equipmentManager) {
                    this._equipInitialGear(monster, monsterType);
                }

                if (this.monsterManager.add) {
                    this.monsterManager.add(monster);
                } else {
                    this.monsterManager.monsters.push(monster);
                }
                this.metaAIManager.getGroup(monster.groupId)?.addMember(monster);

                newlyActivated.push(monster);
                activatedIndexes.push(index);
            }
        });

        return { newlyActivated, activatedIndexes };
    }

    _equipInitialGear(monster, monsterType) {
        const weaponId = rollOnTable(getMonsterLootTable(monsterType));
        const weapon = this.factory.itemFactory.create(weaponId, 0, 0, monster.tileSize);
        if (weapon && (weapon.type === 'weapon' || weapon.tags?.includes('weapon'))) {
            this.equipmentManager.equip(monster, weapon, null);
        }

        const armorChoices = ['leather_armor', 'plate_armor', 'metal_armor', 'wizard_robe'];
        const armorId = armorChoices[Math.floor(Math.random() * armorChoices.length)];
        const armor = this.factory.itemFactory.create(armorId, 0, 0, monster.tileSize);
        if (armor) {
            this.equipmentManager.equip(monster, armor, null);
        }

        if (Math.random() < 0.5) {
            const shield = this.factory.itemFactory.create('shield_basic', 0, 0, monster.tileSize);
            if (shield) {
                this.equipmentManager.equip(monster, shield, null);
            }
        }

        const consumableId = rollOnTable(getMonsterLootTable(monsterType));
        const consumable = this.factory.itemFactory.create(consumableId, 0, 0, monster.tileSize);
        if (consumable && consumable.tags?.includes('consumable')) {
            monster.addConsumable(consumable);
        }

        if (this.parasiteManager && Math.random() < 0.15) {
            const pid = Math.random() < 0.5 ? 'parasite_leech' : 'parasite_worm';
            const pItem = this.factory.itemFactory.create(pid, 0, 0, monster.tileSize);
            if (pItem) this.parasiteManager.equip(monster, pItem);
        }
    }
}
