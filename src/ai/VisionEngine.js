import { hasLineOfSight } from '../utils/geometry.js';

export class VisionEngine {
    constructor(mapManager) {
        this.mapManager = mapManager;
        console.log('[VisionEngine] Initialized');
    }

    getVisibleTargets(caster, potentialTargets = []) {
        const visibles = [];
        const range = caster.stats?.get('visionRange') ?? caster.visionRange;
        for (const target of potentialTargets) {
            const dist = Math.hypot(target.x - caster.x, target.y - caster.y);
            if (range && dist > range) continue;
            if (this.hasLineOfSight(caster, target)) {
                visibles.push(target);
            }
        }
        return visibles;
    }

    hasLineOfSight(startEntity, endEntity) {
        if (!this.mapManager) return true;
        const sx = Math.floor(startEntity.x / this.mapManager.tileSize);
        const sy = Math.floor(startEntity.y / this.mapManager.tileSize);
        const ex = Math.floor(endEntity.x / this.mapManager.tileSize);
        const ey = Math.floor(endEntity.y / this.mapManager.tileSize);
        return hasLineOfSight(sx, sy, ex, ey, this.mapManager);
    }

    updateFacingDirection(entity) {
        let targetX = null;
        if (entity.velocity && entity.velocity.x) {
            targetX = entity.x + entity.velocity.x;
        } else if (entity.currentTarget) {
            targetX = entity.currentTarget.x;
        }
        if (targetX !== null) {
            if (targetX < entity.x) entity.direction = 'left';
            else if (targetX > entity.x) entity.direction = 'right';
        }
    }
}
