export const SYNERGIES = {
    steel_pact: {
        name: '강철의 유대',
        description: '강철의 유대 장비는 착용자를 더 단단하게 만듭니다.',
        icon: '🛡️',
        bonuses: [
            {
                count: 2,
                description: '방어력 +5',
                stats: { defense: 5 },
            },
            {
                count: 4,
                description: '방어력 +12',
                stats: { defense: 12 },
            },
            {
                count: 6,
                description: '방어력 +25',
                stats: { defense: 25 },
            },
        ],
    },
    pyromancer_pact: {
        name: '화염술사의 계약',
        description:
            '화염 마법을 강화하고, 공격 시 화염구를 발사할 수 있게 합니다.',
        icon: '🔥',
        bonuses: [
            {
                count: 2,
                description: '공격력 +5',
                stats: { attackPower: 5 },
            },
            {
                count: 3,
                description: '공격력 +8',
                stats: { attackPower: 8 },
            },
            {
                count: 4,
                description: '공격력 +12',
                stats: { attackPower: 12 },
            },
        ],
    },
    night_stalker: {
        name: '밤의 추적자',
        description: '어둠 속에서 결정타를 노립니다.',
        icon: '🌙',
        bonuses: [
            {
                count: 2,
                description: '공격 속도 +0.1',
                stats: { attackSpeed: 0.1 },
            },
            {
                count: 3,
                description: '공격 속도 +0.2',
                stats: { attackSpeed: 0.2 },
            },
        ],
    },
};
