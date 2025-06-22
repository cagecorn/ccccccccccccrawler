export class SupportEngine {
    constructor() {
        console.log('[SupportEngine] Initialized');
    }

    /**
     * 치유가 필요한 아군을 찾습니다.
     * @param {object} caster - 시전자
     * @param {Array<object>} allies - 아군 목록
     * @returns {object|null} MBTI 성향을 고려해 선택된 아군
     */
    findHealTarget(caster, allies) {
        const mbti = caster.properties?.mbti || '';
        let threshold = 0.7;
        if (mbti.includes('S')) {
            threshold = 0.9;
        } else if (mbti.includes('N')) {
            threshold = 0.5;
        }

        const candidates = allies.filter(
            a => a.hp < a.maxHp && a.hp / a.maxHp <= threshold
        );
        if (candidates.length === 0) return null;

        if (mbti.includes('I')) {
            return candidates.find(c => c === caster) || candidates[0];
        }

        if (mbti.includes('E')) {
            return candidates.reduce((low, cur) =>
                cur.hp / cur.maxHp < low.hp / low.maxHp ? cur : low,
                candidates[0]);
        }

        return candidates[0];
    }

    /**
     * 정화가 필요한 아군을 찾습니다.
     * @param {object} caster - 시전자
     * @param {Array<object>} allies - 아군 목록
     * @returns {object|null} 상태 이상이 있는 아군
     */
    findPurifyTarget(caster, allies) {
        const mbti = caster.properties?.mbti || '';
        const candidates = [caster, ...allies].filter(a =>
            a.effects?.some(eff => eff.tags?.includes('status_ailment'))
        );
        if (candidates.length === 0) return null;

        if (mbti.includes('I')) {
            return candidates.find(c => c === caster) || candidates[0];
        }
        return candidates[0];
    }

    /**
     * 특정 버프가 필요한 아군을 찾습니다.
     * @param {object} caster - 시전자
     * @param {Array<object>} allies - 아군 목록
     * @param {string} buffId - 확인할 버프 효과의 ID
     * @returns {object|null} 지정 버프가 없는 아군
     */
    findBuffTarget(caster, allies, buffId) {
        if (!buffId) return null;
        const mbti = caster.properties?.mbti || '';
        const targets = [caster, ...allies].filter(a =>
            a.hp > 0 && !a.effects?.some(eff => eff.id === buffId)
        );
        if (targets.length === 0) return null;

        if (mbti.includes('I')) {
            return targets.find(t => t === caster) || targets[0];
        }
        return targets[0];
    }
}
