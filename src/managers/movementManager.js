export class MovementManager {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.stuckTimers = new Map();
    }

    setPath(entity, path) {
        if (Array.isArray(path) && path.length > 0) {
            entity._aiPath = path.slice();
            entity._aiPathIndex = 0;
        } else {
            entity._aiPath = null;
            entity._aiPathIndex = 0;
        }
    }

    followPath(entity, context) {
        if (!entity._aiPath || entity._aiPathIndex >= entity._aiPath.length) return;
        const tileSize = this.mapManager.tileSize;
        const step = entity._aiPath[entity._aiPathIndex];
        const target = { x: step.x * tileSize, y: step.y * tileSize };
        this.moveEntityTowards(entity, target, context);
        if (Math.hypot(entity.x - target.x, entity.y - target.y) <= entity.speed) {
            entity._aiPathIndex++;
            if (entity._aiPathIndex >= entity._aiPath.length) {
                entity._aiPath = null;
            }
        }
    }

    moveEntityTowards(entity, target, context) {
        const distance = Math.hypot(target.x - entity.x, target.y - entity.y);
        if (distance < entity.width) {
            this.stuckTimers.delete(entity.id);
            return;
        }

        if (distance <= entity.speed) {
            if (!this._isOccupied(target.x, target.y, entity, context)) {
                entity.x = target.x;
                entity.y = target.y;
            }
            this.stuckTimers.delete(entity.id);
            return;
        }

        const speedBonus = Math.min(5, Math.floor(distance / this.mapManager.tileSize / 2));
        const currentSpeed = entity.speed + speedBonus;
        let vx = ((target.x - entity.x) / distance) * currentSpeed;
        let vy = ((target.y - entity.y) / distance) * currentSpeed;

        let newX = entity.x + vx;
        let newY = entity.y + vy;

        if (this._isOccupied(newX, newY, entity, context)) {
            if (!this._isOccupied(newX, entity.y, entity, context)) {
                entity.x = newX;
                this.stuckTimers.delete(entity.id);
                return;
            }
            if (!this._isOccupied(entity.x, newY, entity, context)) {
                entity.y = newY;
                this.stuckTimers.delete(entity.id);
                return;
            }
            const stuckTime = (this.stuckTimers.get(entity.id) || 0) + 1;
            this.stuckTimers.set(entity.id, stuckTime);
            if (stuckTime > 180) {
                const sizeInTiles = {
                    w: Math.ceil(entity.width / this.mapManager.tileSize),
                    h: Math.ceil(entity.height / this.mapManager.tileSize)
                };
                const safePos = this.mapManager.getRandomFloorPosition(sizeInTiles);
                if (safePos) {
                    entity.x = safePos.x;
                    entity.y = safePos.y;
                }
                this.stuckTimers.delete(entity.id);
            }
        } else {
            entity.x = newX;
            entity.y = newY;
            this.stuckTimers.delete(entity.id);
        }
    }

    _isOccupied(x, y, self, context) {
        // 벽 충돌은 기존과 동일하게 우선 확인한다.
        if (this.mapManager.isWallAt(x, y, self.width, self.height)) return true;

        // 모든 유닛을 대상으로 충돌을 검사하여 서로를 장애물로 인식하도록 한다.
        const allEntities = [context.player, ...context.mercenaryManager.mercenaries, ...context.monsterManager.monsters];

        for (const other of allEntities) {
            if (other === self) continue;

            if (x < other.x + other.width &&
                x + self.width > other.x &&
                y < other.y + other.height &&
                y + self.height > other.y) {
                return true;
            }
        }

        return false;
    }
}
