// src/data/weapon-skills.js

export const WEAPON_SKILLS = {
    // 검 레벨 1
    parry: {
        id: 'parry',
        name: '패링',
        description: '적의 근접 공격을 쳐내어 무효화합니다. (발동 확률 15%)',
        type: 'passive_proc',
        procChance: 0.15,
        cooldown: 30,
        tags: ['weapon_skill', 'defensive', 'sword'],
    },

    parry_stance: {
        id: 'parry_stance',
        name: '패링 자세',
        description: '다음 근접 공격을 확실히 막아냅니다.',
        type: 'active',
        cooldown: 20,
        tags: ['weapon_skill', 'defensive', 'sword']
    },
    // 단검 레벨 1
    backstab: {
        id: 'backstab',
        name: '백스탭',
        description: '적의 배후에서 공격 시 150%의 치명타 피해를 입힙니다.',
        type: 'conditional_buff',
        cooldown: 0,
        tags: ['weapon_skill', 'offensive', 'dagger'],
    },
    // 활 레벨 1
    charge_shot: {
        id: 'charge_shot',
        name: '충전 사격',
        description: '1턴 동안 조준하여 다음 화살의 공격력을 50% 증가시킵니다.',
        type: 'active',
        cooldown: 15,
        tags: ['weapon_skill', 'offensive', 'bow'],
    },
    // 창 레벨 1
    charge: {
        id: 'charge',
        name: '돌진',
        description: '적을 향해 최대 3칸 돌진합니다.',
        type: 'active',
        cooldown: 25,
        range: 192 * 3,
        tags: ['weapon_skill', 'movement', 'spear'],
    },
    // 샤벨 1레벨 스킬 아래에 추가
    pull: {
        id: 'pull',
        name: '끌어당기기',
        description: '멀리 있는 대상을 자신의 앞으로 끌어당깁니다.',
        type: 'active',
        range: 192 * 4,
        cooldown: 45,
        tags: ['weapon_skill', 'utility', 'whip'],
    },
    // 바이올린 활 레벨 1
    sonic_arrow: {
        id: 'sonic_arrow',
        name: '음파 화살',
        description: '화살이 적중한 대상 주변에 작은 범위 피해를 입힙니다.',
        type: 'passive_aoe',
        cooldown: 0,
        tags: ['weapon_skill', 'offensive', 'violin_bow'],
    },
    // 에스톡 레벨 1 (창의 돌진 스킬을 공유)
};

