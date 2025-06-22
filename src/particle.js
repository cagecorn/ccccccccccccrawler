export class Particle {
    constructor(x, y, color = 'yellow', options = {}) {
        this.x = x;
        this.y = y;
        this.color = color;

        this.text = options.text || null;

        const angle = options.angle !== undefined ? options.angle : Math.random() * Math.PI * 2;
        const speed = options.speed !== undefined ? options.speed : Math.random() * 3 + 1;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;

        this.gravity = options.gravity !== undefined ? options.gravity : 0.1;
        this.lifespan = options.lifespan !== undefined ? options.lifespan : 60 + Math.random() * 30;
        this.initialLifespan = this.lifespan;
        this.size = options.size !== undefined ? options.size : Math.random() * 3 + 1;

        this.homingTarget = options.homingTarget || null;
        this.homingStrength = options.homingStrength !== undefined ? options.homingStrength : 0.05;
    }

    update() {
        this.lifespan--;

        if (this.homingTarget) {
            const dx = this.homingTarget.x - this.x;
            const dy = this.homingTarget.y - this.y;
            const dist = Math.hypot(dx, dy) || 1;
            this.vx += (dx / dist) * this.homingStrength;
            this.vy += (dy / dist) * this.homingStrength;
        }

        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
    }

    render(ctx) {
        ctx.globalAlpha = this.lifespan / this.initialLifespan;

        if (this.text) {
            ctx.fillStyle = this.color;
            ctx.font = `${this.size * 5}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
        }

        ctx.globalAlpha = 1.0;
    }
}
