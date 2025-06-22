export class KnockbackEngine {
    /**
     * @param {object} motionManager - The MotionManager instance
     * @param {object} vfxManager - The VFXManager instance
     */
    constructor(motionManager, vfxManager) {
        if (!motionManager || !vfxManager) {
            throw new Error("KnockbackEngine requires MotionManager and VFXManager");
        }
        this.motionManager = motionManager;
        this.vfxManager = vfxManager;
        console.log('[KnockbackEngine] Initialized');
    }

    /**
     * Applies knockback to a target entity.
     * @param {object} source - The entity causing the knockback
     * @param {object} target - The entity receiving the knockback
     * @param {number} strength - The strength of the knockback (pixels)
     */
    apply(source, target, strength) {
        if (!source || !target || !strength || strength <= 0) {
            return;
        }

        const result = this.motionManager.knockbackTarget(target, source, strength);
        if (!result) return;

        this.vfxManager.addKnockbackAnimation(target, result.fromPos, result.toPos);

        const effectX = target.x + target.width / 2;
        const effectY = target.y + target.height / 2;
        if (this.vfxManager.addKnockbackVisual) {
            this.vfxManager.addKnockbackVisual(effectX, effectY);
        }
    }
}
