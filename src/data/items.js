export const ITEMS = {
    // 무기
    short_sword: {
        name: '단검',
        type: 'weapon',
        damageDice: '1d6',
        tags: ['melee', 'sword'],
        knockbackChance: 0.1,
        imageKey: 'sword',
        stats: { attackPower: 2 },
        tier: 'normal',
        durability: 100,
        weight: 10,
        toughness: 5,
    },
    long_bow: {
        name: '장궁',
        type: 'weapon',
        damageDice: '1d6',
        tags: ['ranged', 'bow', 'finesse_weapon'],
        imageKey: 'bow',
        stats: { attackPower: 2, attackRange: 384 },
        tier: 'normal',
        durability: 80,
        weight: 8,
        toughness: 3,
    },

    violin_bow: {
        name: '바이올린 보우',
        type: 'weapon',
        damageDice: '1d6',
        tags: ['ranged', 'bow', 'finesse_weapon', 'song'],
        imageKey: 'violin-bow',
        stats: { attackPower: 2, attackRange: 384 },
        tier: 'normal',
        durability: 70,
        weight: 7,
        toughness: 3,
    },

    plate_armor: {
        name: '강철 갑옷',
        type: 'armor',
        tags: ['armor', 'heavy_armor'],
        imageKey: 'plate-armor',
        stats: { maxHp: 10 },
        tier: 'rare',
        durability: 200,
        weight: 15,
        toughness: 12,
    },

    // 방어구
    leather_armor: {
        name: '가죽 갑옷',
        type: 'armor',
        tags: ['armor', 'light_armor'],
        imageKey: 'leather_armor',
        stats: { maxHp: 5 },
        tier: 'normal',
        durability: 60,
        weight: 5,
        toughness: 4,
    },

    shield_basic: {
        name: '기본 방패',
        type: 'shield',
        slot: 'off_hand',
        tags: ['shield', 'off_hand_equipment'],
        imageKey: 'shield',
        stats: { defense: 5 },
        tier: 'normal',
        durability: 150,
        weight: 8,
        toughness: 10,
    },

    // 기본 소모품 및 화폐
    potion: {
        name: '힐링 포션',
        type: 'consumable',
        tags: ['consumable', 'healing_item', '체력 회복 아이템'],
        imageKey: 'potion',
        healAmount: 5,
        range: 192,
    },
    gold: {
        name: 'gold',
        type: 'currency',
        tags: ['currency'],
        imageKey: 'gold',
    },

    // 일반적인 검 아이템 (드랍 테이블용)
    sword: {
        name: '검',
        type: 'weapon',
        damageDice: '1d6',
        tags: ['melee', 'sword'],
        knockbackChance: 0.15,
        imageKey: 'sword',
        stats: { attackPower: 2 },
        tier: 'normal',
        durability: 90,
        weight: 9,
        toughness: 5,
    },

    estoc: {
        name: '에스톡',
        type: 'weapon',
        damageDice: '1d8',
        tags: ['melee', 'sword', 'finesse_weapon'],
        knockbackChance: 0.2,
        imageKey: 'sword',
        stats: {
            attackPower: 3,
            movement: 2,
            attackSpeed: 0.2,
        },
        tier: 'rare',
        durability: 120,
        weight: 7,
        toughness: 7,
    },
    // --- 신규 무기 아이템 정의 ---
    axe: {
        name: '도끼', type: 'weapon', damageDice: '1d10',
        tags: ['melee', 'axe'], imageKey: 'axe', stats: { attackPower: 5 },
        tier: 'normal', durability: 150, weight: 15, toughness: 4
    },
    mace: {
        name: '메이스', type: 'weapon', damageDice: '2d6',
        tags: ['melee', 'mace'], imageKey: 'mace', stats: { attackPower: 4 },
        tier: 'normal', durability: 200, weight: 18, toughness: 6
    },
    staff: {
        name: '지팡이', type: 'weapon', damageDice: '1d4',
        tags: ['ranged', 'staff', 'magic_weapon'], imageKey: 'staff', stats: { intelligence: 3 },
        tier: 'normal', durability: 70, weight: 5, toughness: 2
    },
    spear: {
        name: '창', type: 'weapon', damageDice: '1d8',
        tags: ['melee', 'spear', 'reach'], imageKey: 'spear', stats: { attackPower: 3, attackRange: 256 },
        tier: 'normal', durability: 100, weight: 9, toughness: 5
    },
    scythe: {
        name: '낫', type: 'weapon', damageDice: '1d12',
        tags: ['melee', 'scythe', 'reach'], imageKey: 'scythe', stats: { attackPower: 6, attackRange: 224 },
        tier: 'rare', durability: 90, weight: 11, toughness: 3
    },
    whip: {
        name: '채찍', type: 'weapon', damageDice: '1d6',
        tags: ['ranged', 'whip', 'finesse_weapon'], imageKey: 'whip', stats: { agility: 2, attackRange: 288 },
        tier: 'normal', durability: 60, weight: 4, toughness: 1
    },
    dagger: {
        name: '단검', type: 'weapon', damageDice: '1d4',
        tags: ['melee', 'dagger', 'finesse_weapon'], imageKey: 'dagger', stats: { attackSpeed: 0.3 },
        tier: 'normal', durability: 80, weight: 3, toughness: 2
    },
    // --- 여기까지 ---

    // Parasite samples
    parasite_leech: {
        name: 'Leech',
        type: 'parasite',
        tags: ['parasite'],
        imageKey: 'leech',
        stats: { endurance: 1 },
    },
    parasite_worm: {
        name: 'Mind Worm',
        type: 'parasite',
        tags: ['parasite'],
        imageKey: 'worm',
        stats: { intelligence: 1 },
    },
    pet_fox: {
        name: 'Fox Pet',
        type: 'pet',
        tags: ['pet'],
        imageKey: 'pet-fox',
        cooldown: 600,
        aura: {
            skillId: 'natural_aura',
            range: 256,
            level: 1
        }
    },
    pet_food: {
        name: 'Pet Food',
        type: 'consumable',
        tags: ['pet_food'],
        imageKey: 'potion',
    },
    // 버프 아이템
    strength_elixir: {
        name: '힘의 비약',
        type: 'consumable',
        tags: ['consumable', 'buff_item'],
        imageKey: 'potion',
        effectId: 'strength_buff'
    },

    // --- 룬 아이템 ---
    fire_rune: {
        name: '화염의 룬',
        type: 'rune',
        tags: ['rune', 'fire', 'fire_rune'],
        imageKey: 'fire-ball',
        elementType: 'fire',
        weaponDamage: 5,
        armorResist: 0.1,
    },
    ice_rune: {
        name: '냉기의 룬',
        type: 'rune',
        tags: ['rune', 'ice', 'ice_rune'],
        imageKey: 'ice-ball',
        elementType: 'ice',
        weaponDamage: 4,
        armorResist: 0.1,
    },
};
