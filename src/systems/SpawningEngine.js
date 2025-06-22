export class SpawningEngine {
    constructor(quantumManager, mapManager) {
        this.quantumManager = quantumManager;
        this.mapManager = mapManager;
        console.log('[SpawningEngine] Initialized');
    }

    spawnInitial(count) {
        let registeredCount = 0;
        for (let i = 0; i < count; i++) {
            const pos = this.mapManager.getRandomFloorPosition();
            if (!pos) continue;

            const data = {
                x: pos.x,
                y: pos.y,
                tileSize: this.mapManager.tileSize,
                monsterType: 'monster',
                groupId: 'dungeon_monsters',
                image: null,
                baseStats: {},
            };
            this.quantumManager.registerPotentialMonster(data);
            registeredCount++;
        }
        console.log(`[SpawningEngine] Registered ${registeredCount} potential monsters.`);
    }

    spawnWave({ count = 1, monsterType = 'monster', groupId = 'dungeon_monsters', image = null }) {
        let registeredCount = 0;
        for (let i = 0; i < count; i++) {
            const pos = this.mapManager.getRandomFloorPosition();
            if (!pos) continue;
            const data = {
                x: pos.x,
                y: pos.y,
                tileSize: this.mapManager.tileSize,
                monsterType,
                groupId,
                image: image,
                baseStats: {},
            };
            this.quantumManager.registerPotentialMonster(data);
            registeredCount++;
        }
        console.log(`[SpawningEngine] Registered wave of ${registeredCount} ${monsterType}.`);
    }
}
