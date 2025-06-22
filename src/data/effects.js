export const EFFECTS = {
    // 버프
    strength_buff: {
        name: '힘의 축복',
        type: 'buff',
        duration: 300, // 300프레임 (약 5초)
        stats: { strength: 5 },
        tags: ['buff', 'stat_up'],
    },
    defense_buff: {
        name: '수비 태세',
        type: 'buff',
        duration: 300,
        stats: { defense: 5 },
        tags: ['buff', 'defense_up'],
    },
    magic_buff: {
        name: '비전 집중',
        type: 'buff',
        duration: 300,
        stats: { intelligence: 5 },
        tags: ['buff', 'magic_up'],
    },
    magic_resist_buff: {
        name: '마법 보호막',
        type: 'buff',
        duration: 300,
        stats: { magicResist: 5 },
        tags: ['buff', 'magic_resist_up'],
    },
    all_stat_buff: {
        name: '신의 가호',
        type: 'buff',
        duration: 300,
        stats: { strength: 2, agility: 2, endurance: 2, intelligence: 2 },
        tags: ['buff', 'stat_up'],
        iconKey: 'talisman2',
    },
    // 디버프
    armor_break: {
        name: '방어구 부수기',
        type: 'debuff',
        duration: 300,
        stats: { defense: -10 },
        tags: ['debuff', 'stat_down'],
    },
    attack_down: {
        name: '공격 약화',
        type: 'debuff',
        duration: 300,
        stats: { attackPower: -5 },
        tags: ['debuff', 'attack_down'],
    },
    magic_down: {
        name: '마법 약화',
        type: 'debuff',
        duration: 300,
        stats: { intelligence: -5 },
        tags: ['debuff', 'magic_down'],
    },
    magic_resist_down: {
        name: '저항 약화',
        type: 'debuff',
        duration: 300,
        stats: { magicResist: -5 },
        tags: ['debuff', 'magic_resist_down'],
    },
    resist_down: {
        name: '모든 저항 약화',
        type: 'debuff',
        duration: 300,
        stats: { elementalResist: -5 },
        tags: ['debuff', 'resist_down'],
    },
    // 상태이상
    poison: {
        name: '중독',
        type: 'dot',
        duration: 500, // 5턴
        damagePerTurn: 3,
        tags: ['status_ailment', 'poison', 'dot'],
        iconKey: 'parasite',
        overlayColor: 'rgba(0, 255, 0, 0.3)',
        particle: {
            type: 'bubble',
            color: 'rgba(100, 200, 100, 0.7)',
            gravity: -0.02,
            speed: 0.4,
        },
    },
    freeze: {
        name: '동결',
        type: 'dot_cc',
        duration: 300,
        damagePerTurn: 1,
        tags: ['status_ailment', 'freeze', 'dot', 'cc'],
        stats: {
            movementSpeed: -2,
            attackSpeed: -0.5,
            castingSpeed: -0.5,
        },
        overlayColor: 'rgba(100, 150, 255, 0.4)',
        particle: {
            type: 'snowflake',
            color: 'rgba(200, 220, 255, 0.9)',
            gravity: 0.05,
            speed: 0.5,
        },
    },

    shield: {
        name: '보호막',
        type: 'shield',
        duration: 300,
        shieldAmount: 10,
        tags: ['buff', 'shield'],
        iconKey: 'guardian-hymn-effect',
    },

    bonus_damage: {
        name: '공격력 증가',
        type: 'damage_buff',
        duration: 300,
        bonusDamage: 2,
        tags: ['buff', 'attack_up'],
        iconKey: 'courage-hymn-effect',
    },

    slow: {
        name: '감속',
        type: 'debuff',
        duration: 300,
        stats: { movementSpeed: -1 },
        tags: ['debuff', 'slow'],
    },

    charging_shot_effect: {
        name: '충전된 사격',
        type: 'buff',
        duration: 120,
        stats: {},
        tags: ['buff', 'attack_up', 'charge_shot'],
        iconKey: 'courage-hymn-effect',
    },

    parry_ready: {
        name: '패링 준비',
        type: 'buff',
        duration: 60,
        stats: {},
        tags: ['buff', 'parry_ready']
    },
    regeneration_aura: {
        name: '재생 오라',
        type: 'buff',
        duration: 60,
        stats: { hpRegen: 0.1 },
        tags: ['aura', 'regen', 'regeneration_aura'],
    },
    airborne: {
        name: '에어본',
        type: 'cc', // Crowd Control
        duration: 75, // 1.25초 (60fps 기준)
        tags: ['status_ailment', 'cc', 'airborne'],
    },
    // --- 2단계 상태이상 ---
    sleep: {
        name: '수면',
        type: 'cc',
        duration: 1000, // 10턴
        tags: ['status_ailment', 'cc', 'sleep'],
        wakeUpOnHit: 3, // 3번 맞으면 깨어남
        particle: { type: 'text', text: 'Zzz' }
    },
    paralysis: {
        name: '마비',
        type: 'cc',
        duration: 200, // 2턴
        tags: ['status_ailment', 'cc', 'paralysis'],
        overlayColor: 'rgba(255, 255, 0, 0.4)',
        particle: { type: 'electric', color: 'yellow' }
    },
    burn: {
        name: '화상',
        type: 'dot',
        duration: 300,
        damagePerTurn: 4,
        stats: { movementSpeed: 2 }, // 이동속도 증가
        tags: ['status_ailment', 'burn', 'dot'],
        overlayColor: 'rgba(255, 100, 0, 0.4)',
        particle: { type: 'ember', color: 'rgba(255, 90, 40, 0.8)' }
    },
    bleed: {
        name: '출혈',
        type: 'dot',
        duration: 400,
        damagePerTurn: 5,
        tags: ['status_ailment', 'bleed', 'dot'],
        particle: { type: 'blood_drip', color: 'rgba(200, 0, 0, 0.7)' }
    },
    petrify: {
        name: '석화',
        type: 'cc',
        duration: 500,
        stats: { defense: 15, magicResist: -15 }, // 방어력 증가, 마법저항력 감소
        tags: ['status_ailment', 'cc', 'petrify'],
        overlayColor: 'rgba(150, 150, 150, 0.7)',
    },

    // --- 3단계 상태이상 ---
    silence: {
        name: '침묵',
        type: 'debuff', // 스킬 사용만 막으므로 cc는 아님
        duration: 400,
        tags: ['status_ailment', 'silence'],
        particle: { type: 'text', text: '...', color: 'grey' }
    },
    blind: {
        name: '실명',
        type: 'debuff',
        duration: 500,
        stats: { visionRange: -300 }, // 시야 대폭 감소
        tags: ['status_ailment', 'blind'],
        overlayColor: 'rgba(50, 50, 50, 0.5)',
        particle: { type: 'aura', color: 'rgba(20, 20, 20, 0.4)' }
    },
    fear: {
        name: '공포',
        type: 'ai_override', // AI를 덮어쓰는 타입
        duration: 300,
        tags: ['status_ailment', 'cc', 'fear', 'ai_override'],
        particle: { type: 'aura', color: 'rgba(128, 0, 128, 0.4)'}
    },
    confusion: {
        name: '혼란',
        type: 'ai_override',
        duration: 500,
        tags: ['status_ailment', 'cc', 'confusion', 'ai_override'],
        particle: { type: 'text', text: '???', color: 'orange' }
    },
    berserk: {
        name: '광폭화',
        type: 'ai_override',
        duration: 400,
        stats: { attackPower: 10, attackSpeed: 0.5, movementSpeed: 2 },
        tags: ['status_ailment', 'berserk', 'ai_override'],
        overlayColor: 'rgba(255, 0, 0, 0.3)',
        particle: { type: 'aura', color: 'rgba(200, 0, 0, 0.5)' }
    },
    charm: {
        name: '매혹',
        type: 'ai_override',
        duration: 600,
        tags: ['status_ailment', 'cc', 'charm', 'ai_override'],
        particle: { type: 'heart', color: 'rgba(255, 105, 180, 0.9)' }
    },

    // --- 알파벳 상태 효과 (Emotion Card 기반) ---
    state_E: {
        name: 'E 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'E_state'],
        stats: { agility: 1 }
    },
    state_I: {
        name: 'I 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'I_state'],
        stats: { strength: 1 }
    },
    state_S: {
        name: 'S 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'S_state'],
        stats: { attackSpeed: 0.1 }
    },
    state_N: {
        name: 'N 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'N_state'],
        stats: { intelligence: 1 }
    },
    state_T: {
        name: 'T 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'T_state'],
        stats: { attackSpeed: 0.1 }
    },
    state_F: {
        name: 'F 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'F_state'],
        stats: { hpRegen: 0.05 }
    },
    state_P: {
        name: 'P 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'P_state'],
        stats: { movement: 1 }
    },
    state_J: {
        name: 'J 상태',
        type: 'state',
        duration: 300,
        tags: ['alphabet_state', 'J_state'],
        stats: { movement: -1 }
    }
};
