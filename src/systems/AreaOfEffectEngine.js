export class AreaOfEffectEngine {
    constructor() {
        console.log('[AreaOfEffectEngine] Initialized');
    }

    /**
     * 지정된 형태와 옵션에 따라 범위 내의 타겟들을 찾습니다.
     * @param {{x: number, y: number}} origin - 범위의 중심점
     * @param {Array<object>} allEntities - 확인할 모든 엔티티 목록
     * @param {string} shape - 범위의 모양 ('circle', 'cone' 등)
     * @param {object} options - 범위의 상세 옵션 (예: { radius: 50 })
     * @returns {Array<object>} - 범위 내에 있는 엔티티 목록
     */
    findTargets(origin, allEntities, shape, options) {
        const targets = [];
        switch (shape) {
            case 'circle':
                if (!options.radius) {
                    console.error("AoEEngine: 'circle' shape requires a 'radius' option.");
                    return [];
                }
                for (const entity of allEntities) {
                    if (!entity.isDying && entity.hp > 0) {
                        const distance = Math.hypot(entity.x - origin.x, entity.y - origin.y);
                        if (distance <= options.radius) {
                            targets.push(entity);
                        }
                    }
                }
                break;
            case 'cone':
                console.warn("AoEEngine: 'cone' shape is not yet implemented.");
                break;
            default:
                console.error(`AoEEngine: Unknown shape '${shape}'`);
        }
        return targets;
    }
}
