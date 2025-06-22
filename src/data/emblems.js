// src/data/emblems.js

export const EMBLEMS = {
    emblem_guardian: {
        name: '수호자의 휘장',
        type: 'accessory',
        slot: 'accessory1',
        tags: ['emblem', 'accessory'],
        stats: { defense: 5, maxHp: 10 },
        imageKey: 'emblem_guardian',
    },
    emblem_destroyer: {
        name: '파괴자의 휘장',
        type: 'accessory',
        slot: 'accessory1',
        tags: ['emblem', 'accessory'],
        stats: { attackPower: 5 },
        imageKey: 'emblem_destroyer',
    },
    emblem_devotion: {
        name: '헌신의 휘장',
        type: 'accessory',
        slot: 'accessory1',
        tags: ['emblem', 'accessory'],
        stats: { hpRegen: 0.1, mpRegen: 0.1 },
        imageKey: 'emblem_devotion',
    },
    emblem_conductor: {
        name: '지휘자의 휘장',
        type: 'accessory',
        slot: 'accessory1',
        tags: ['emblem', 'accessory'],
        stats: { castingSpeed: 0.2 },
        imageKey: 'emblem_conductor',
    },
};
