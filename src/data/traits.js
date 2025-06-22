// src/data/traits.js
// 공용 특성 목록. 일단은 용병과 몬스터가 함께 사용한다.

export const TRAITS = {
    TOUGH: {
        name: '강인함',
        description: '기본 체력이 약간 증가합니다.',
        stats: { endurance: 1 },
    },
    QUICK_REFLEXES: {
        name: '재빠른',
        description: '공격 속도가 소폭 증가합니다.',
        stats: { attackSpeed: 0.1 },
    },
    BRAVE: {
        name: '용감함',
        description: '전투에서 겁을 덜 먹습니다.',
        stats: { strength: 1 },
    },
    FOCUSED: {
        name: '집중력',
        description: '정신력이 조금 향상됩니다.',
        stats: { focus: 1 },
    },
    CUNNING: {
        name: '교활함',
        description: '이동 속도가 약간 증가합니다.',
        stats: { movement: 1 },
    },
    SAVAGE: {
        name: '흉포함',
        description: '공격력이 증가합니다.',
        stats: { attackPower: 2 },
    },
    STOIC: {
        name: '냉정함',
        description: '지능이 약간 향상됩니다.',
        stats: { intelligence: 1 },
    },
};
