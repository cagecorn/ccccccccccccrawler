export class SaveLoadManager {
    // 게임의 현재 상태를 하나의 객체로 수집 (스냅샷 찍기)
    gatherSaveData(gameState, monsterManager, mercenaryManager) {
        const saveData = {
            timestamp: new Date().toISOString(),
            player: gameState.player.getSaveState(),
            gold: gameState.gold,
            statPoints: gameState.statPoints,
            inventory: gameState.inventory.map(item => item.name), // 아이템은 이름만 저장
            monsters: monsterManager.monsters.map(m => m.getSaveState()),
            mercenaries: mercenaryManager.mercenaries.map(m => m.getSaveState()),
        };
        return saveData;
    }

    // (미래를 위한 구멍) 저장된 데이터로 게임 상태를 복원하는 함수
    loadGameFromData(saveData, gameState, ...allManagers) {
        console.log("게임 불러오기 기능은 여기에 구현될 예정입니다.");
    }
}
