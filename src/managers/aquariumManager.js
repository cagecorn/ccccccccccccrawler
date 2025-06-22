// src/managers/aquariumManager.js
// Manages patches and features placed on the Aquarium map
import { TRAITS } from '../data/traits.js';
import { EquipmentManager } from './equipmentManager.js';
import { adjustMonsterStatsForAquarium } from '../utils/aquariumUtils.js';
export class AquariumManager {
    constructor(eventManager, monsterManager, itemManager, mapManager, charFactory, itemFactory, vfxManager = null, traitManager = null) {
        this.eventManager = eventManager;
        this.monsterManager = monsterManager;
        this.itemManager = itemManager;
        this.mapManager = mapManager;
        this.charFactory = charFactory;
        this.itemFactory = itemFactory;
        this.vfxManager = vfxManager;
        this.traitManager = traitManager;
        this.features = [];
        this.equipmentManager = new EquipmentManager(eventManager);
        this.allWeaponIds = ['short_sword', 'long_bow', 'estoc', 'axe', 'mace', 'staff', 'spear', 'scythe', 'whip', 'dagger', 'violin_bow'];
        // 순환하며 각 방에 몬스터를 배치하기 위한 인덱스
        this._roomIndex = 0;
    }

    _findSpacedPosition(minDist = this.mapManager.tileSize * 4) {
        for (let i = 0; i < 30; i++) {
            const pos = this.mapManager.getRandomFloorPosition();
            if (!pos) continue;
            const tooClose = this.monsterManager.monsters.some(m => {
                const dx = m.x - pos.x;
                const dy = m.y - pos.y;
                return Math.hypot(dx, dy) < minDist;
            });
            if (!tooClose) return pos;
        }
        return this.mapManager.getRandomFloorPosition();
    }

    _getRoomBasedPosition(minDist = this.mapManager.tileSize * 6) {
        const rooms = this.mapManager.rooms || [];
        if (rooms.length === 0) return this._findSpacedPosition(minDist);

        for (let r = 0; r < rooms.length; r++) {
            const room = rooms[(this._roomIndex + r) % rooms.length];
            const pos = {
                x: (room.x + Math.floor(room.width / 2)) * this.mapManager.tileSize,
                y: (room.y + Math.floor(room.height / 2)) * this.mapManager.tileSize
            };
            const tooClose = this.monsterManager.monsters.some(m => {
                const dx = m.x - pos.x;
                const dy = m.y - pos.y;
                return Math.hypot(dx, dy) < minDist;
            });
            if (!tooClose) {
                this._roomIndex = (this._roomIndex + r + 1) % rooms.length;
                return pos;
            }
        }
        return this._findSpacedPosition(minDist);
    }

    spawnMonsterGroup(count = 3, opts = {}) {
        const center = this._getRoomBasedPosition(this.mapManager.tileSize * 8);
        if (!center) return;

        const radius = opts.radius || this.mapManager.tileSize * 2;
        let shieldSpawned = false;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = radius * (0.5 + Math.random());
            const pos = {
                x: center.x + Math.round(Math.cos(angle) * dist),
                y: center.y + Math.round(Math.sin(angle) * dist),
            };

            const vision = opts.baseStats?.visionRange ?? this.mapManager.tileSize * 2;
            const stats = adjustMonsterStatsForAquarium({
                ...(opts.baseStats || {}),
                visionRange: vision,
            });

            const monster = this.charFactory.create('monster', {
                x: pos.x,
                y: pos.y,
                tileSize: this.mapManager.tileSize,
                groupId: 'dungeon_monsters',
                image: opts.image,
                baseStats: stats,
            });

            if (this.traitManager) {
                this.traitManager.applyTraits(monster, TRAITS);
            }

            this.monsterManager.monsters.push(monster);

            if (Math.random() < 0.8) {
                const randomWeaponId = this.allWeaponIds[Math.floor(Math.random() * this.allWeaponIds.length)];
                const weapon = this.itemFactory.create(randomWeaponId, 0, 0, 1);
                if (weapon) {
                    this.equipmentManager.equip(monster, weapon, null);

                    const tags = weapon.tags || [];
                    const isMelee = tags.includes('melee') && !tags.includes('ranged');
                    const excluded = tags.includes('spear') || tags.includes('scythe');

                    let equipShield = Math.random() < 0.5;
                    if (opts.ensureShield && !shieldSpawned && i === count - 1) {
                        equipShield = true;
                    }

                    if (isMelee && !excluded && equipShield) {
                        const shield = this.itemFactory.create('shield_basic', 0, 0, 1);
                        if (shield) {
                            this.equipmentManager.equip(monster, shield, null);
                            shieldSpawned = true;
                        }
                    }
                }
            }
        }
    }

    addTestingFeature(feature) {
        this.features.push(feature);
        if (feature.type === 'monster') {
            const pos = this._getRoomBasedPosition(this.mapManager.tileSize * 6);
            if (pos) {
                const vision = feature.baseStats?.visionRange ?? this.mapManager.tileSize * 2;
                const stats = adjustMonsterStatsForAquarium({
                    ...feature.baseStats,
                    visionRange: vision,
                });
                const monster = this.charFactory.create('monster', {
                    x: pos.x,
                    y: pos.y,
                    tileSize: this.mapManager.tileSize,
                    groupId: 'dungeon_monsters',
                    image: feature.image,
                    baseStats: stats,
                });
                if (this.traitManager) {
                    this.traitManager.applyTraits(monster, TRAITS);
                }
                this.monsterManager.monsters.push(monster);

                // --- 몬스터에게 무작위 무기 장착 ---
                if (Math.random() < 0.8) {
                    const randomWeaponId = this.allWeaponIds[Math.floor(Math.random() * this.allWeaponIds.length)];
                    const weapon = this.itemFactory.create(randomWeaponId, 0, 0, 1);
                    if (weapon) {
                        this.equipmentManager.equip(monster, weapon, null);

                        // 근거리 무기(창, 낫 제외)를 들고 있을 때 확률적으로 방패 장착
                        const tags = weapon.tags || [];
                        const isMelee = tags.includes('melee') && !tags.includes('ranged');
                        const excluded = tags.includes('spear') || tags.includes('scythe');
                        if (isMelee && !excluded && Math.random() < 0.5) {
                            const shield = this.itemFactory.create('shield_basic', 0, 0, 1);
                            if (shield) {
                                this.equipmentManager.equip(monster, shield, null);
                            }
                        }
                    }
                }
                // --- 여기까지 ---
            }
        } else if (feature.type === 'item') {
            const pos = this.mapManager.getRandomFloorPosition();
            if (pos) {
                const item = this.itemFactory.create(feature.itemId, pos.x, pos.y, this.mapManager.tileSize);
                if (item) this.itemManager.addItem(item);
            }
        } else if (feature.type === 'bubble' && this.vfxManager) {
            const pos = this.mapManager.getRandomFloorPosition();
            if (pos) {
                const emitter = this.vfxManager.addEmitter(
                    pos.x + this.mapManager.tileSize / 2,
                    pos.y + this.mapManager.tileSize / 2,
                    {
                        spawnRate: feature.spawnRate || 2,
                        duration: -1,
                        particleOptions: {
                            color: feature.color || 'rgba(200,200,255,0.7)',
                            gravity: feature.gravity !== undefined ? feature.gravity : -0.05,
                            speed: feature.speed || 0.5,
                        },
                    }
                );
                feature.emitter = emitter;
            }
        }
    }

    inspectFeatures() {
        return this.features.length > 0;
    }
}

export class AquariumInspector {
    constructor(aquariumManager) {
        this.aquariumManager = aquariumManager;
    }

    run() {
        return this.aquariumManager.inspectFeatures();
    }
}

