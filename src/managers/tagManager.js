import { RangedAI, MeleeAI } from '../ai.js';

export class TagManager {
    constructor() {
        console.log("[TagManager] Initialized");
    }

    /**
     * 대상(아이템, 스킬 등)이 특정 태그를 가지고 있는지 확인합니다.
     * @param {object} target - 검사할 대상 (item, skill 등)
     * @param {string} tag - 확인할 태그
     * @returns {boolean}
     */
    hasTag(target, tag) {
        return target && Array.isArray(target.tags) && target.tags.includes(tag);
    }

    /**
     * 장비 태그에 따라 유닛의 AI를 업데이트합니다.
     * 무기에 'ranged' 태그가 있으면 원거리 AI를,
     * 'melee' 태그가 있으면 근접 AI를 부여합니다.
     * @param {object} entity 대상 유닛
     */
    applyWeaponTags(entity) {
        const weapon = entity?.equipment?.weapon;
        if (!weapon) return;

        if (this.hasTag(weapon, 'ranged')) {
            if (!(entity.ai instanceof RangedAI)) {
                entity.ai = new RangedAI();
            }
        } else if (this.hasTag(weapon, 'melee')) {
            if (!(entity.ai instanceof MeleeAI)) {
                entity.ai = new MeleeAI();
            }
        }
    }

    /**
     * 장비와 스킬의 태그 조합에 따른 추가 피해를 계산합니다.
     * 예) 무기에 'fire_rune' 태그가 있고 스킬에 'fire' 태그가 있으면 보너스 데미지
     * @param {object} attacker 공격자
     * @param {object} skill 사용 스킬
     * @returns {number} 추가 피해량
     */
    calculateDamageBonus(attacker, skill) {
        let bonus = 0;
        const weapon = attacker?.equipment?.weapon;
        if (!weapon || !skill) return bonus;

        const elements = ['fire', 'ice'];
        for (const el of elements) {
            if (this.hasTag(weapon, `${el}_rune`) && this.hasTag(skill, el)) {
                bonus += 5;
            }
        }
        return bonus;
    }
}
