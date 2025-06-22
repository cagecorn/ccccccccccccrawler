// src/utils/random.js

/**
 * 가중치 테이블로부터 하나의 결과를 무작위로 선택합니다.
 * @param {Array<{id: string, weight: number}>} table - 가중치를 포함하는 객체 배열
 * @returns {string|null} - 선택된 아이템의 id
 */
export function rollOnTable(table) {
    // 1. 모든 가중치의 합을 구합니다.
    const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
    
    // 2. 0부터 가중치 총합 사이의 무작위 숫자를 뽑습니다.
    let randomRoll = Math.random() * totalWeight;

    // 3. 테이블을 순회하며, 무작위 숫자가 어느 구간에 속하는지 확인합니다.
    for (const entry of table) {
        if (randomRoll < entry.weight) {
            return entry.id; // 당첨!
        }
        randomRoll -= entry.weight;
    }

    return null; // 혹시 모를 오류 방지
}

/**
 * "1d8+2" 같은 주사위 표기법을 굴립니다.
 * @param {string} notation - 예: "2d6", "1d20+5"
 * @returns {number} - 주사위를 굴린 최종 값
 */
export function rollDiceNotation(notation) {
    if (!notation) return 0;
    let total = 0;
    const parts = notation.split('+');

    // 주사위 부분 (e.g., "2d6")
    const dicePart = parts[0];
    const match = dicePart.match(/(\d+)d(\d+)/);
    if (match) {
        const numDice = parseInt(match[1], 10);
        const numSides = parseInt(match[2], 10);
        for (let i = 0; i < numDice; i++) {
            total += Math.floor(Math.random() * numSides) + 1;
        }
    }

    // 추가 보너스 부분 (e.g., "+5")
    if (parts[1]) {
        total += parseInt(parts[1], 10);
    }

    return total;
}
