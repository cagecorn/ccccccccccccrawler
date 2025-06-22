// src/stats.js
import { FAITHS } from './data/faiths.js';

const STATE_BONUSES = {
    state_E: { agility: 1 },
    state_I: { strength: 1 },
    state_S: { attackSpeed: 0.1 },
    state_N: { intelligence: 1 },
    state_T: { attackSpeed: 0.1 },
    state_F: { hpRegen: 0.05 },
    state_P: { movement: 1 },
    state_J: { movement: -1 },
};

export class StatManager {
    constructor(entity, config = {}) {
        // entity 자신을 참조할 수 있도록 저장
        this.entity = entity;
        this._baseStats = {
            level: config.level || 1,
            exp: config.exp || 0,
            expNeeded: config.expNeeded || 20,
            strength: config.strength || 1,
            agility: config.agility || 1,
            endurance: config.endurance || 1,
            focus: config.focus || 1,
            intelligence: config.intelligence || 1,
            // 초반 밸런스를 고려하여 기본 이동 속도를 낮춘다
            movement: config.movement || 2,
            expValue: config.expValue || 0,
            sizeInTiles_w: config.sizeInTiles_w || 1,
            sizeInTiles_h: config.sizeInTiles_h || 1,
            visionRange: config.visionRange || 192 * 4,
            attackRange: config.attackRange || 192,
            // 지나치게 빠른 전투 템포를 완화하기 위해 기본 시전/공격 속도를 하향한다
            castingSpeed: config.castingSpeed || 0.5,
            attackSpeed: config.attackSpeed || 0.5,
            hpRegen: config.hpRegen || 0,
            mpRegen: config.mpRegen || 0,

            // 상태이상 저항 스탯
            poisonResist: config.poisonResist || 0,
            freezeResist: config.freezeResist || 0,
            sleepResist: config.sleepResist || 0,
            paralysisResist: config.paralysisResist || 0,
            burnResist: config.burnResist || 0,
            bleedResist: config.bleedResist || 0,
            petrifyResist: config.petrifyResist || 0,
            silenceResist: config.silenceResist || 0,
            blindResist: config.blindResist || 0,
            fearResist: config.fearResist || 0,
            confusionResist: config.confusionResist || 0,
            charmResist: config.charmResist || 0,
            movementResist: config.movementResist || 0,
        };
        this._pointsAllocated = {
            strength: 0, agility: 0, endurance: 0, focus: 0, intelligence: 0,
            movement: 0, castingSpeed: 0, attackSpeed: 0,
            poisonResist: 0, freezeResist: 0, sleepResist: 0, paralysisResist: 0,
            burnResist: 0, bleedResist: 0, petrifyResist: 0, silenceResist: 0,
            blindResist: 0, fearResist: 0, confusionResist: 0, charmResist: 0,
            movementResist: 0,
        };

        // 장비로부터 적용되는 스탯 저장용
        this._fromEquipment = {};

        this.derivedStats = {};
        this.recalculate();
    }

    allocatePoint(stat) {
        if (this._pointsAllocated[stat] !== undefined) {
            this._pointsAllocated[stat]++;
        }
    }

    // 장비 스탯을 업데이트하는 함수
    updateEquipmentStats() {
        this._fromEquipment = {};
        if (!this.entity || !this.entity.equipment) return;

        for (const slot in this.entity.equipment) {
            const item = this.entity.equipment[slot];
            if (!item) continue;

            // 1. 아이템 자체 스탯
            if (item.stats) {
                const statsSource = item.stats instanceof Map ? item.stats.entries() : Object.entries(item.stats);
                for (const [stat, value] of statsSource) {
                    this._fromEquipment[stat] = (this._fromEquipment[stat] || 0) + value;
                }
            }

            // 2. 소켓 룬 스탯
            if (item.sockets && item.sockets.length > 0) {
                for (const rune of item.sockets) {
                    if (!rune) continue;

                    if (item.type === 'armor' && rune.armorResist) {
                        const map = { fire: 'burnResist', ice: 'freezeResist', poison: 'poisonResist' };
                        const resistStatName = map[rune.elementType] || `${rune.elementType}Resist`;
                        this._fromEquipment[resistStatName] = (this._fromEquipment[resistStatName] || 0) + rune.armorResist;
                    }
                }
            }
        }
        this.recalculate();
    }

    recalculate() {
        const final = {};
        for (const stat in this._baseStats) {
            final[stat] = (this._baseStats[stat] || 0)
                       + (this._pointsAllocated[stat] || 0)
                       + (this._fromEquipment[stat] || 0);
        }

        // 장비에만 존재하는 스탯도 합산
        for (const stat in this._fromEquipment) {
            if (!(stat in final)) {
                final[stat] = this._fromEquipment[stat];
            }
        }

        // 신앙 보너스 합산
        const faithId = this.entity?.properties?.faith;
        if (faithId && FAITHS[faithId] && FAITHS[faithId].statBonuses) {
            for (const [stat, bonus] of Object.entries(FAITHS[faithId].statBonuses)) {
                final[stat] = (final[stat] || 0) + bonus;
            }
        }

        if (this.entity && Array.isArray(this.entity.effects)) {
            for (const effect of this.entity.effects) {
                const bonus = STATE_BONUSES[effect.id];
                if (bonus) {
                    for (const [stat, val] of Object.entries(bonus)) {
                        final[stat] = (final[stat] || 0) + val;
                    }
                }
            }
        }

        final.maxHp = 10 + final.endurance * 5;
        final.attackPower = (final.attackPower || 0) + 1 + final.strength * 2;
        final.maxMp = 10 + final.focus * 10;
        final.movementSpeed = final.movement;
        // 체력/마나 재생률이 지나치게 높아 전투 테스트가 어려웠다.
        // 기본 회복 공식을 완화하여 초당 회복량을 대폭 줄인다.
        final.hpRegen = (final.hpRegen || 0) + final.endurance * 0.01;
        final.mpRegen = (final.mpRegen || 0) + final.focus * 0.01;

        this.derivedStats = final;
    }

    get(statName) {
        return this.derivedStats[statName] ?? 0;
    }

    getSavableState() {
        return {
            baseStats: this._baseStats,
            pointsAllocated: this._pointsAllocated,
        };
    }

    addExp(amount) {
        let finalAmount = amount;
        if (this.entity?.consumables?.some(i => i.type === 'parasite' || i.tags?.includes('parasite'))) {
            finalAmount = Math.floor(amount * 0.8);
        }
        this._baseStats.exp += finalAmount;
        this.recalculate();

        while (this.get('exp') >= this.get('expNeeded')) {
            this.levelUp();
            this.entity.hp = this.entity.maxHp;
            this.entity.mp = this.entity.maxMp;

            if (this.entity.isPlayer) {
                if (this.entity.eventManager) {
                    this.entity.eventManager.publish('player_levelup_bonus', { statPoints: 5 });
                }
            }

            if (this.entity.eventManager) {
                this.entity.eventManager.publish('level_up', { player: this.entity, level: this.get('level') });
            }
            
            // --- BUG FIX ---
            // 루프가 끝난 후에 호출되던 것을 루프 안으로 이동시켜
            // 매 레벨업마다 스탯을 다시 계산하도록 수정합니다.
            this.recalculate();
        }

        this.recalculate();
    }

    levelUp() {
        this._baseStats.level++;
        this._baseStats.exp -= this._baseStats.expNeeded;
        this._baseStats.expNeeded = Math.floor(this._baseStats.expNeeded * 1.5);
        this.increaseBaseStat('endurance', 1);
        this.increaseBaseStat('strength', 1);
    }

    increaseBaseStat(stat, value) {
        if (this._baseStats[stat] !== undefined) {
            this._baseStats[stat] += value;
        }
    }
}
