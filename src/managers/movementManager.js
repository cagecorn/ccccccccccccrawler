export class MovementManager {
    constructor(mapManager) {
        this.mapManager = mapManager;
        this.stuckTimers = new Map();
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
        if (this.mapManager.isWallAt(x, y, self.width, self.height)) return true;

        const selfHasShield = self.equipment?.off_hand?.tags.includes('shield');
        if (!selfHasShield) return false;

        const allEntities = [context.player, ...context.mercenaryManager.mercenaries, ...context.monsterManager.monsters];

        for (const other of allEntities) {
            if (other === self) continue;

            // Only block movement when both entities carry shields
            const otherHasShield = other.equipment?.off_hand?.tags.includes('shield');
            if (!otherHasShield) continue;

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
