export class MicroTurnManager {
    constructor() {
        this.turn = 0;
    }

    /**
     * 모든 아이템을 순회하며 미시 세계 관련 상태를 업데이트합니다.
     * @param {Item[]} allItems - 게임 내 존재하는 모든 아이템의 배열
     */
    update(allItems) {
        this.turn++;

        for (const item of allItems) {
            // 1. 무기 스킬 쿨다운을 관리합니다.
            if (item.weaponStats && item.weaponStats.cooldown > 0) {
                item.weaponStats.cooldown--;
            }

            // 2. 아티팩트, 펫 등 모든 아이템의 범용 쿨다운을 관리합니다.
            if (item.cooldownRemaining > 0) {
                item.cooldownRemaining--;
            }
        }
    }

    // recordAttack 메서드는 삭제되었습니다.
    // 경험치 획득은 MicroEngine에서 이벤트 기반으로 처리합니다.
}
