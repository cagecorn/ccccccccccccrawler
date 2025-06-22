export class AIPathfindingEngine {
    constructor(pathfindingManager) {
        if (!pathfindingManager) {
            throw new Error('AIPathfindingEngine requires a PathfindingManager.');
        }
        this.pathfindingManager = pathfindingManager;
        this.leashRadius = 300; // 최대 반경
        console.log('[AIPathfindingEngine] Initialized');
    }

    decideAction(self, target, context) {
        const { player, mapManager } = context;
        const tileSize = (mapManager || this.pathfindingManager.mapManager).tileSize;

        if (target) {
            const distance = Math.hypot(target.x - self.x, target.y - self.y);
            if (distance < self.attackRange) {
                return { type: 'attack', target };
            }
            const sx = Math.floor(self.x / tileSize);
            const sy = Math.floor(self.y / tileSize);
            const tx = Math.floor(target.x / tileSize);
            const ty = Math.floor(target.y / tileSize);
            const path = this.pathfindingManager.findPath(sx, sy, tx, ty, () => false);
            if (path && path.length > 0) {
                return { type: 'follow_path', path, target };
            }
        } else {
            const distanceToPlayer = Math.hypot(self.x - player.x, self.y - player.y);
            if (distanceToPlayer > this.leashRadius) {
                const sx = Math.floor(self.x / tileSize);
                const sy = Math.floor(self.y / tileSize);
                const px = Math.floor(player.x / tileSize);
                const py = Math.floor(player.y / tileSize);
                const pathToPlayer = this.pathfindingManager.findPath(sx, sy, px, py, () => false);
                if (pathToPlayer && pathToPlayer.length > 0) {
                    return { type: 'follow_path', path: pathToPlayer, target: player };
                }
            }
        }

        return { type: 'idle' };
    }
}
