export class ParticleDecoratorManager {
    constructor(eventManager = null, assets = null, factory = null) {
        this.vfxManager = null;
        this.mapManager = null;
        this.emitters = [];
        this.initialized = false;
        console.log('[ParticleDecoratorManager] Initialized');
    }

    setManagers(vfxManager, mapManager) {
        this.vfxManager = vfxManager;
        this.mapManager = mapManager;
    }

    init() {
        if (this.initialized) return;
        if (!this.vfxManager || !this.mapManager) return;
        for (const room of this.mapManager.rooms) {
            const centerX = (room.x + room.width / 2) * this.mapManager.tileSize;
            const centerY = (room.y + room.height / 2) * this.mapManager.tileSize;
            const emitter = this.vfxManager.addEmitter(centerX, centerY, {
                spawnRate: 1,
                duration: -1,
                particleOptions: { color: 'rgba(255,255,255,0.3)', speed: 0.5, gravity: 0 }
            });
            this.emitters.push(emitter);
        }
        this.initialized = true;
    }

    clear() {
        for (const emitter of this.emitters) {
            this.vfxManager.removeEmitter(emitter);
        }
        this.emitters = [];
        this.initialized = false;
    }

    /**
     * 회복 계열 행동 시 사용할 초록빛 파티클 효과를 생성한다.
     * @param {object} entity 파티클을 표시할 대상 엔티티
     */
    playHealingEffect(entity) {
        if (!this.vfxManager || !entity) return;
        const x = entity.x + (entity.width || 0) / 2;
        const y = entity.y + (entity.height || 0) / 2;
        this.vfxManager.addParticleBurst(x, y, {
            count: 10,
            color: 'lime',
            gravity: -0.05,
        });
    }
}
