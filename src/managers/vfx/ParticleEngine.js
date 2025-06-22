import { Particle } from '../../particle.js';

export class ParticleEngine {
    constructor() {
        this.particles = [];
        this.emitters = [];
        console.log('[ParticleEngine] Initialized');
    }

    addParticleBurst(x, y, options = {}) {
        const count = options.count || 8;
        const color = options.color || 'yellow';
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, options));
        }
    }

    addEmitter(x, y, options = {}) {
        const particleOpts = { ...(options.particleOptions || {}) };
        if (particleOpts.type === 'text') {
            particleOpts.text = particleOpts.text || '?';
            particleOpts.lifespan = 40;
            particleOpts.gravity = -0.1;
            particleOpts.speed = 0;
        }
        const emitter = {
            id: Math.random().toString(36).substr(2, 9),
            x,
            y,
            spawnRate: options.spawnRate || 2,
            duration: options.duration !== undefined ? options.duration : 60,
            particleOptions: particleOpts,
            followTarget: options.followTarget || null,
            offsetX: options.offsetX || 0,
            offsetY: options.offsetY || 0,
        };
        this.emitters.push(emitter);
        return emitter;
    }

    createTrail(target, options = {}) {
        return this.addEmitter(target.x, target.y, {
            followTarget: target,
            spawnRate: options.spawnRate || 1,
            duration: options.duration !== undefined ? options.duration : -1,
            particleOptions: options.particleOptions || {},
            offsetX: options.offsetX || target.width / 2 || 0,
            offsetY: options.offsetY || target.height / 2 || 0,
        });
    }

    addHomingBurst(x, y, target, options = {}) {
        const count = options.count || 12;
        const particleOpts = {
            ...options.particleOptions,
            homingTarget: target,
        };
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, options.color || 'white', particleOpts));
        }
    }

    createDashTrail(fromX, fromY, toX, toY, options = {}) {
        const particleCount = options.count || 10;
        const color = options.color || 'rgba(255, 255, 255, 0.5)';
        const lifespan = options.lifespan || 20;
        for (let i = 0; i < particleCount; i++) {
            const progress = i / particleCount;
            const x = fromX + (toX - fromX) * progress;
            const y = fromY + (toY - fromY) * progress;
            const particle = new Particle(x, y, color);
            particle.lifespan = lifespan;
            particle.gravity = 0;
            this.particles.push(particle);
        }
    }

    createWhipTrail(fromX, fromY, toX, toY) {
        const particleCount = 12;
        for (let i = 0; i < particleCount; i++) {
            const progress = i / particleCount;
            const x = fromX + (toX - fromX) * progress;
            const y = fromY + (toY - fromY) * progress;
            const particle = new Particle(x, y, 'rgba(255, 100, 100, 0.7)');
            particle.lifespan = 15;
            particle.gravity = 0;
            this.particles.push(particle);
        }
    }

    removeEmitter(emitter) {
        const idx = this.emitters.indexOf(emitter);
        if (idx >= 0) {
            this.emitters.splice(idx, 1);
        }
    }

    update() {
        for (let i = this.emitters.length - 1; i >= 0; i--) {
            const e = this.emitters[i];
            if (e.followTarget) {
                e.x = e.followTarget.x + e.offsetX;
                e.y = e.followTarget.y + e.offsetY;
            }
            for (let j = 0; j < e.spawnRate; j++) {
                this.particles.push(new Particle(e.x, e.y, e.particleOptions.color || 'white', e.particleOptions));
            }
            if (e.duration > 0) {
                e.duration--;
                if (e.duration <= 0) {
                    this.emitters.splice(i, 1);
                }
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.lifespan <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        for (const p of this.particles) {
            p.render(ctx);
        }
    }
}

