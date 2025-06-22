/**
 * 다양한 조건에 맞는 적을 골라주는 범용 타겟팅 엔진
 */
export class TargetingEngine {
    constructor() {
        console.log('[TargetingEngine] Initialized');
    }

    /**
     * 지정된 전략에 따라 최적의 타겟을 찾습니다.
     * @param {object} caster - 대상을 찾는 주체
     * @param {Array<object>} potentialTargets - 대상 후보 목록
     * @param {object} strategy - { rule: 'closest' | 'weakest' | 'ally_focus', context: ai_context }
     * @returns {object|null}
     */
    findBestTarget(caster, potentialTargets, strategy = {}) {
        if (!potentialTargets || potentialTargets.length === 0) return null;

        const rule = strategy.rule || 'closest';

        // 도발 상태 확인
        const tauntEffect = caster.effects?.find(e => e.id === 'taunt' && e.caster);
        if (tauntEffect) {
            const taunter = potentialTargets.find(t => t.id === tauntEffect.caster.id);
            if (taunter) return taunter;
        }

        // 은신 상태 제거
        let targetable = potentialTargets.filter(t => !t.effects?.some(e => e.id === 'stealth'));
        if (targetable.length === 0) return null;

        switch (rule) {
            case 'weakest':
                targetable.sort((a, b) => a.hp - b.hp);
                return targetable[0];
            case 'ally_focus':
                const allyTargets = new Set();
                strategy.context?.allies?.forEach(ally => {
                    if (ally.currentTarget) allyTargets.add(ally.currentTarget.id);
                });
                const focused = targetable.find(t => allyTargets.has(t.id));
                if (focused) return focused;
                // fallthrough to closest
            case 'closest':
            default:
                let best = null;
                let minDist = Infinity;
                for (const target of targetable) {
                    const dist = Math.hypot(target.x - caster.x, target.y - caster.y);
                    if (dist < minDist) {
                        minDist = dist;
                        best = target;
                    }
                }
                return best;
        }
    }
}
