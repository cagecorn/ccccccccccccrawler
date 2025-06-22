// src/data/tables.js

// 몬스터 등장 확률 테이블
export const MONSTER_SPAWN_TABLE = [
    { id: 'normal_monster', weight: 80 }, // 일반 몬스터 등장 가중치: 80
    { id: 'epic_monster', weight: 20 },   // 에픽 몬스터 등장 가중치: 20
];

// 아이템 드랍 확률 테이블 (미래를 위한 구멍)
/**
 * 기본 아이템 드랍 테이블입니다. monsterDeathWorkflow나 초기 장비 지급 시
 * rollOnTable()과 함께 사용합니다. 몬스터 유형별로 세분화된 테이블을
 * 만들고 싶다면 이 배열을 기반으로 커스텀 테이블을 반환하도록
 * getMonsterLootTable()을 수정하세요.
 */
export const LOOT_DROP_TABLE = [
    { id: 'gold', weight: 60 },
    { id: 'potion', weight: 20 },
    { id: 'sword', weight: 5 },
    { id: 'spear', weight: 5 },
    { id: 'dagger', weight: 5 },
    { id: 'axe', weight: 5 },
    { id: 'mace', weight: 5 },
    { id: 'staff', weight: 5 },
    { id: 'whip', weight: 5 },
    { id: 'scythe', weight: 5 },
    { id: 'violin_bow', weight: 5 },
    { id: 'estoc', weight: 5 },
    { id: 'fox_charm', weight: 10 },
];

// 확장성을 위해 몬스터 타입을 매개변수로 받아 드랍 테이블을 반환하는 함수
export function getMonsterLootTable(monsterType = '') {
    // 현재는 모든 몬스터가 동일한 테이블을 사용하지만,
    // 필요에 따라 switch문 등으로 monsterType에 따른 분기 가능
    return LOOT_DROP_TABLE;
}
