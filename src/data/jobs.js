export const JOBS = {
    warrior: {
        name: '전사',
        description: '강인한 체력과 근접 전투 능력의 전문가입니다.',
        stats: {
            strength: 8,
            agility: 4,
            endurance: 6,
            // 초반 밸런스에 맞춰 이동 속도를 낮춘다
            movement: 4,
            hp: 40,
            attackPower: 17,
        }
    },
    archer: {
        name: '궁수',
        description: '원거리에서 활을 다루는 전문가입니다.',
        stats: {
            strength: 5,
            agility: 8,
            endurance: 4,
            movement: 4,
            hp: 30,
            attackPower: 15,
        }
    },
    healer: {
        name: '힐러',
        description: '아군을 치유하고 지원하는 전문가입니다.',
        stats: {
            strength: 3,
            agility: 5,
            endurance: 4,
            focus: 8,
            movement: 4,
            hp: 28,
            attackPower: 10,
        }
    },
    wizard: {
        name: '마법사',
        description: '원소 마법으로 적을 제압하는 전문가입니다.',
        stats: {
            strength: 2,
            agility: 4,
            endurance: 3,
            focus: 9,
            intelligence: 8,
            movement: 4,
            hp: 24,
            attackPower: 12,
        }
    },
    summoner: {
        name: '소환사',
        description: '하수인을 소환해 전투를 지원하는 전문가입니다.',
        stats: {
            strength: 2,
            agility: 3,
            endurance: 3,
            focus: 10,
            intelligence: 9,
            movement: 4,
            hp: 22,
            attackPower: 11,
        }
    },
    bard: {
        name: '음유시인',
        description: '연주로 아군을 지원하는 전문가입니다.',
        stats: {
            strength: 3,
            agility: 6,
            endurance: 4,
            focus: 8,
            movement: 4,
            hp: 26,
            attackPower: 10,
        }
    },
};

