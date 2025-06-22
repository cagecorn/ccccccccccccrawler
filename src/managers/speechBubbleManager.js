export class SpeechBubbleManager {
    constructor(eventManager = null) {
        this.bubbles = [];
        this.eventManager = eventManager;
        if (this.eventManager) {
            this.eventManager.subscribe('entity_removed', ({ victimId }) => {
                this.bubbles = this.bubbles.filter(b => b.entity.id !== victimId);
            });
        }
    }

    addBubble(entity, text, duration = 90) {
        if (!entity || !text) return;
        this.bubbles.push({ entity, text, life: duration });
    }

    update() {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            bubble.life--;
            if (bubble.life <= 0 || !bubble.entity) {
                this.bubbles.splice(i, 1);
            }
        }
    }

    render(ctx) {
        if (!ctx) return;
        ctx.save();
        ctx.font = '12px sans-serif';
        ctx.textBaseline = 'top';
        this.bubbles.forEach(b => {
            const { entity, text } = b;
            if (!entity) return;
            const x = entity.x + entity.width / 2;
            const y = entity.y - 18;
            ctx.fillStyle = 'white';
            const textWidth = ctx.measureText(text).width + 6;
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(x - textWidth / 2, y - 2, textWidth, 14);
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText(text, x, y);
        });
        ctx.restore();
    }
}
