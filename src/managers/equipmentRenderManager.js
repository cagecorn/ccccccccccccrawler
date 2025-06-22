export class EquipmentRenderManager {
    constructor(eventManager = null, assets = null, factory = null) {
        console.log('[EquipmentRenderManager] Initialized');
    }

    drawEquipment(ctx, entity) {
        this.drawShield(ctx, entity);
        this.drawWeapon(ctx, entity);
    }

    drawWeapon(ctx, entity) {
        const weapon = entity.equipment?.main_hand;
        if (!weapon || !weapon.image) return;

        const drawWidth = entity.width * 0.8;
        const drawHeight = entity.height * 0.8;
        const drawX = entity.width * 0.1;
        const drawY = entity.height * 0.1;

        ctx.drawImage(weapon.image, drawX, drawY, drawWidth, drawHeight);
    }

    drawShield(ctx, entity) {
        const shield = entity.equipment?.off_hand;
        if (!shield || !shield.image) return;

        const drawWidth = entity.width * 0.7;
        const drawHeight = entity.height * 0.7;
        const drawX = -entity.width * 0.1;
        const drawY = entity.height * 0.2;

        ctx.drawImage(shield.image, drawX, drawY, drawWidth, drawHeight);
    }
}
