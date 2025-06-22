export const FAITHS = {
    FIRE_GOD: {
        name: '불의 신',
        description: '공격적인 성향을 강화합니다.',
        statBonuses: { attackPower: 2, defense: -1 },
    },
    WATER_GOD: {
        name: '물의 신',
        description: '생존력과 안정성을 강화합니다.',
        statBonuses: { maxHp: 5, maxMp: 5 },
    },
    WIND_GOD: {
        name: '바람의 신',
        description: '회피와 이동 능력을 향상시킵니다.',
        statBonuses: { movementSpeed: 0.2, defense: -1 },
    },
    EARTH_GOD: {
        name: '땅의 신',
        description: '방어적 성향과 체력을 높여 줍니다.',
        statBonuses: { defense: 2, movementSpeed: -0.2 },
    },
    LIGHT_GOD: {
        name: '빛의 신',
        description: '회복 및 방어 마법에 축복을 내립니다.',
        statBonuses: { defense: 1, maxMp: 5 },
    },
    DARK_GOD: {
        name: '어둠의 신',
        description: '공격적인 마법과 치명타를 선호합니다.',
        statBonuses: { attackPower: 2, defense: -1 },
    },
    NONE: {
        name: '무신론',
        description: '신앙에 얽매이지 않습니다.',
        statBonuses: {},
    },
};
