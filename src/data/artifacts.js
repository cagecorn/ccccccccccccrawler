export const ARTIFACTS = {
    healing_talisman: {
        id: 'healing_talisman',
        name: '치유 부적',
        type: 'artifact',
        description: '사용 시 소량의 체력을 회복합니다.',
        cooldown: 60,
        healAmount: 5,
        tags: ['artifact', 'healing_item'],
        imageKey: 'talisman1',
    },
    fox_charm: {
        id: 'fox_charm',
        name: '여우의 부적',
        type: 'artifact',
        description: '사용 시 잠시 능력치를 향상시킵니다.',
        cooldown: 120,
        effectId: 'all_stat_buff',
        tags: ['artifact', 'buff'],
        imageKey: 'talisman2',
    },
};
