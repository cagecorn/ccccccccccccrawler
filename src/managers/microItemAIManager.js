export class MicroItemAIManager {
    constructor() {
        console.log('[MicroItemAIManager] Initialized');
    }

    /**
     * 무기 아이템을 받아 해당 전투 AI를 반환합니다.
     * @param {Item} weapon - 검사할 무기 아이템
     * @returns {BaseWeaponAI | null} - 무기에 할당된 AI 또는 null
     */
    getWeaponAI(weapon) {
        return weapon?.weaponStats?.getAI() || null;
    }
}
