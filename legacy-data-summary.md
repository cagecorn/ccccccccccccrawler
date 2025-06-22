# Legacy Database Summary

This document preserves the condensed data tables from the abandoned version of the project. The dataset is **not** used directly in the current codebase but serves as a reference when planning new content.

```
1. 아이템 관련 데이터
아이템의 기본 정보, 고유 아이템, 제작법, 접두사/접미사 등 아이템과 관련된 모든 데이터입니다.

JavaScript

// 아이템 타입 분류
const ITEM_TYPES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
    POTION: 'potion',
    REVIVE: 'revive',
    EXP_SCROLL: 'expScroll',
    RECIPE_SCROLL: 'recipeScroll',
    EGG: 'egg',
    FERTILIZER: 'fertilizer',
    ESSENCE: 'essence',
    FOOD: 'food',
    MAP: 'map'
};

// 인벤토리 카테고리
const INVENTORY_CATEGORIES = {
    equipment: [ITEM_TYPES.WEAPON, ITEM_TYPES.ARMOR, ITEM_TYPES.ACCESSORY],
    recipe: [ITEM_TYPES.RECIPE_SCROLL],
    food: [ITEM_TYPES.FOOD],
    potion: [ITEM_TYPES.POTION, ITEM_TYPES.REVIVE],
    map: [ITEM_TYPES.MAP],
    etc: [ITEM_TYPES.EGG, ITEM_TYPES.FERTILIZER, ITEM_TYPES.ESSENCE]
};

// 일반 아이템 데이터베이스
const ITEMS = {
    shortSword: { name: '🗡️ 단검', type: ITEM_TYPES.WEAPON, attack: 2, damageDice: "1d6", price: 10, level: 1, icon: '🗡️', imageUrl: 'assets/images/shortsword.png' },
    longSword: { name: '⚔️ 장검', type: ITEM_TYPES.WEAPON, attack: 4, price: 25, damageDice: "1d8", level: 2, icon: '⚔️' },
    bow: { name: '🏹 활', type: ITEM_TYPES.WEAPON, attack: 3, damageDice: "1d6", price: 20, level: 1, icon: '🏹', imageUrl: 'assets/images/bow.png' },
    // ... (파일에 있던 모든 아이템 데이터)
    ruinsMap: { name: '🗺️ 폐허 지도', type: ITEM_TYPES.MAP, level: 2, icon: '🗺️' }
};

// 고유 아이템 데이터베이스
const UNIQUE_ITEMS = {
    volcanicEruptor: { name: '🌋 화산의 분출자', type: ITEM_TYPES.WEAPON, attack: 8, damageDice: '1d12', tier: 'unique', procs: [{ event: 'onAttack', skill: 'Fireball', chance: 0.1, level: 0.5 }], icon: '🌋', level: 1, price: 0 },
    glacialGuard: { name: '🧊 빙하의 수호자', type: ITEM_TYPES.ARMOR, defense: 8, tier: 'unique', procs: [{ event: 'onDamaged', skill: 'IceNova', chance: 0.075, level: 0.5 }], icon: '🛡️', level: 1, price: 0 },
    guardianAmulet: { name: '🛡️ 수호의 부적', type: ITEM_TYPES.ACCESSORY, tier: 'unique', procs: [{ event: 'onDamaged', skill: 'GuardianHymn', chance: 0.05, level: 0.5 }], icon: '🛡️', level: 1, price: 0 },
    courageAmulet: { name: '🎵 용기의 부적', type: ITEM_TYPES.ACCESSORY, tier: 'unique', procs: [{ event: 'onDamaged', skill: 'CourageHymn', chance: 0.05, level: 0.5 }], icon: '🎵', level: 1, price: 0 }
};

// 아이템 발동(Proc) 효과 목록
const UNIQUE_EFFECT_POOL = [
    { event: 'onAttack', skill: 'FireNova', chance: 0.15 },
    { event: 'onAttack', skill: 'IceNova', chance: 0.15 },
    { event: 'onDamaged', skill: 'GuardianHymn', chance: 0.1 },
    { event: 'onDamaged', skill: 'CourageHymn', chance: 0.1 }
];

// 아이템 제작 레시피
const RECIPES = {
    healthPotion: { name: 'Health Potion', output: 'healthPotion', materials: { herb: 2 }, turns: 3 },
    shortSword: { name: 'Short Sword', output: 'shortSword', materials: { wood: 1, iron: 2 }, turns: 5 },
    // ... (파일에 있던 모든 레시피 데이터)
    royalBanquet: { name: 'Royal Banquet', output: 'royalBanquet', materials: { meatStew: 1, vegetableSoup: 1, sandwich: 1 }, turns: 5 }
};

// 재료 아이콘
const MATERIAL_ICONS = {
    wood: '🪵',
    iron: '⛓️',
    bone: '🦴',
    herb: '🌿'
};

// 일반 아이템 접두사
const PREFIXES = [
    { name: 'Flaming', modifiers: { fireDamage: 2 } },
    { name: 'Chilling', modifiers: { iceDamage: 2 } },
    // ... (파일에 있던 모든 접두사 데이터)
    { name: 'Freeze Resistant', modifiers: { freezeResist: 0.3 } }
];

// 일반 아이템 접미사
const SUFFIXES = [
    { name: 'of Protection', modifiers: { defense: 2 } },
    { name: 'of Fury', modifiers: { attack: 2 } },
    // ... (파일에 있던 모든 접미사 데이터)
    { name: 'of Frost Resistance', modifiers: { freezeResist: 0.3 } }
];

// 희귀 아이템 접두사
const RARE_PREFIXES = [
    { name: 'Arcane', modifiers: { magicPower: 3, manaRegen: 1 } },
    { name: 'Savage', modifiers: { attack: 2, critChance: 0.05 } },
    // ... (파일에 있던 모든 희귀 접두사 데이터)
    { name: 'Empowered', modifiers: { skillPowerMult: () => 1.1 + Math.random() * 0.4 } }
];

// 희귀 아이템 접미사
const RARE_SUFFIXES = [
    { name: 'of Mastery', modifiers: { attack: 2, defense: 2 } },
    { name: 'of the Magus', modifiers: { magicPower: 3, manaRegen: 1 } },
    // ... (파일에 있던 모든 희귀 접미사 데이터)
    { name: 'of Power', modifiers: { skillPowerMult: () => 1.1 + Math.random() * 0.4 } }
];
2. 스킬 데이터
플레이어, 용병, 몬스터가 사용하는 모든 스킬의 정의와 스킬 세트 목록입니다.

JavaScript

// 모든 스킬의 기본 정의
const SKILL_DEFS = {
    Fireball: { name: 'Fireball', icon: '🔥', damageDice: '1d10', range: 5, magic: true, element: 'fire', manaCost: 3, cooldown: 2 },
    Iceball: { name: 'Iceball', icon: '❄️', damageDice: '1d8', range: 5, magic: true, element: 'ice', manaCost: 2, cooldown: 2 },
    // ... (파일에 있던 모든 스킬 정의)
    ElementalWeakness: { name: '원소 취약', icon: '⬇️', statBuff: { elementResists: true, mult: -0.25, target: 'enemy' }, duration: 3, cooldown: 3 }
};

// 용병 전용 스킬 정의 (SKILL_DEFS와 중복되는 부분이 많아 통합을 고려해볼 수 있습니다)
const MERCENARY_SKILLS = {
    ChargeAttack: { name: 'Charge Attack', icon: '⚡', range: 2, manaCost: 2, multiplier: 1.5, dashRange: 4, cooldown: 3 },
    // ... (파일에 있던 모든 용병 스킬)
    ElementalWeakness: { name: '원소 취약', icon: '⬇️', statBuff: { elementResists: true, mult: -0.25, target: 'enemy' }, duration: 3, cooldown: 3 }
};

// 몬스터 전용 스킬 정의 (이 또한 통합 가능성이 있습니다)
const MONSTER_SKILLS = {
    RottingBite: { name: 'Rotting Bite', icon: '🧟', range: 1, damageDice: '1d6', melee: true, status: 'poison', manaCost: 2, cooldown: 2 },
    // ... (파일에 있던 모든 몬스터 스킬)
};

// 용병 타입별 스킬 세트
const MERCENARY_SKILL_SETS = {
    WARRIOR: ['ChargeAttack', 'DoubleStrike'],
    ARCHER: ['DoubleThrust', 'HawkEye'],
    HEALER: ['Heal'],
    WIZARD: ['Fireball', 'Iceball'],
    BARD: ['GuardianHymn', 'CourageHymn', 'Heal'],
    PALADIN: ['Berserk', 'Fortress', 'ArcaneBurst', 'Barrier', 'Divinity']
};

// 몬스터 타입별 스킬 세트
const MONSTER_SKILL_SETS = {
    ZOMBIE: ['RottingBite', 'PoisonCloud', 'PoisonStrike'],
    // ... (파일에 있던 모든 몬스터 스킬 세트)
    BOSS: ['ShadowBolt', 'FireBreath', 'BurnStrike']
};

// 디버프 스킬 목록
const DEBUFF_SKILLS = ['Weaken','Sunder','Regression','SpellWeakness','ElementalWeakness'];

// ***참고: 아래 코드는 속성/상태이상 기반으로 몬스터 스킬을 동적으로 생성하는 로직입니다.***
// 새 프로젝트에서도 유사한 로직을 사용하거나, 수동으로 모든 스킬을 정의할 수 있습니다.
(() => {
    const elems = ['fire','ice','wind','earth','light','dark'];
    const statuses = ['poison','freeze','burn','bleed','paralysis','nightmare','silence','petrify','debuff'];
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    elems.forEach(e => {
        MONSTER_SKILLS[cap(e)+'Strike'] = { name: `${cap(e)} Strike`, icon: ELEMENT_EMOJI[e], range: 1, damageDice: '1d6', melee: true, element: e, manaCost: 2, cooldown: 2 };
        MONSTER_SKILLS[cap(e)+'Shot'] = { name: `${cap(e)} Shot`, icon: ELEMENT_EMOJI[e], range: 3, damageDice: '1d6', element: e, manaCost: 2, cooldown: 2 };
        MONSTER_SKILLS[cap(e)+'Magic'] = { name: `${cap(e)} Magic`, icon: ELEMENT_EMOJI[e], range: 4, damageDice: '1d6', magic: true, element: e, manaCost: 2, cooldown: 2 };
    });
    statuses.forEach(s => {
        MONSTER_SKILLS[cap(s)+'Strike'] = { name: `${STATUS_NAMES[s]} Strike`, icon: STATUS_ICONS[s], range: 1, damageDice: '1d6', melee: true, status: s, manaCost: 2, cooldown: 2 };
        MONSTER_SKILLS[cap(s)+'Shot'] = { name: `${STATUS_NAMES[s]} Shot`, icon: STATUS_ICONS[s], range: 3, damageDice: '1d6', status: s, manaCost: 2, cooldown: 2 };
        MONSTER_SKILLS[cap(s)+'Magic'] = { name: `${STATUS_NAMES[s]} Magic`, icon: STATUS_ICONS[s], range: 4, damageDice: '1d6', magic: true, status: s, manaCost: 2, cooldown: 2 };
    });
})();
3. 캐릭터 및 몬스터 데이터
용병과 몬스터의 기본 스탯, 이름, 대사 등의 정보입니다.

JavaScript

// 용병 이름 목록
const MERCENARY_NAMES = [
    'Aldo', 'Borin', 'Cara', /* ... */ 'Tranquil'
];

// 용병 유휴 상태 대사
const MERCENARY_IDLE_QUOTES = {
    WARRIOR: [ "이 통로... 적들이 매복하기 좋은 곳이군.", /* ... */ ],
    ARCHER: [ "발걸음 소리를 최대한 줄여야 해. 적들에게 들키면 안 되거든.", /* ... */ ],
    HEALER: [ "이곳에 스며든 어둠의 기운... 정화가 필요할 것 같아.", /* ... */ ],
    WIZARD: [ "이 던전의 마력 흐름이 불안정해... 주문 시전에 주의해야겠어.", /* ... */ ],
    BARD: [ "이 던전의 메아리가 훌륭하네! 나중에 여기서 콘서트를 열어볼까?", /* ... */ ],
    PALADIN: [ "신의 가호가 함께하길.", /* ... */ ]
};

// 용병 타입별 기본 정보
const MERCENARY_TYPES = {
    WARRIOR: { name: '⚔️ 전사', icon: '🛡️', baseHealth: 15, baseAttack: 4, /* ... */ },
    ARCHER: { name: '🏹 궁수', icon: '🎯', baseHealth: 10, baseAttack: 5, /* ... */ },
    HEALER: { name: '✚ 힐러', icon: '💚', baseHealth: 8, baseAttack: 2, /* ... */ },
    WIZARD: { name: '🔮 마법사', icon: '🧙', baseHealth: 7, baseAttack: 3, /* ... */ },
    BARD: { name: '🎶 음유시인', icon: '🎶', baseHealth: 9, baseAttack: 3, /* ... */ },
    PALADIN: { name: '✝️ 성기사', icon: '⚔️', baseHealth: 14, baseAttack: 5, /* ... */ }
};

// 챔피언 타입 (용병 타입을 복사해서 사용)
// const CHAMPION_TYPES = JSON.parse(JSON.stringify(MERCENARY_TYPES));

// 몬스터 타입별 기본 정보
const MONSTER_TYPES = {
    ZOMBIE: { name: '🧟 좀비', icon: '🧟‍♂️', color: '#8B4513', baseHealth: 8, /* ... */ },
    GOBLIN: { name: '👹 고블린', icon: '', color: '#32CD32', baseHealth: 4, /* ... */ },
    // ... (파일에 있던 모든 몬스터 데이터)
    BOSS: { name: '👑 던전 보스', icon: '💀', color: '#FF4500', baseHealth: 30, /* ... */ }
};

// 몬스터 타입별 특성 세트
const MONSTER_TRAIT_SETS = {
    ZOMBIE: ['PoisonMelee'],
    GOBLIN: ['WindMelee'],
    // ... (파일에 있던 모든 몬스터 특성 세트)
    BOSS: ['BurnMelee']
};
4. 상태 및 속성 데이터
독, 화상 등의 상태 이상과 불, 얼음 등의 속성 관련 데이터입니다.

JavaScript

// 속성 이모지
const ELEMENT_EMOJI = {
    fire: '🔥',
    ice: '❄️',
    lightning: '⚡',
    wind: '💨',
    earth: '🌱',
    light: '✨',
    dark: '🌑'
};

// 상태 이상 한글 이름
const STATUS_NAMES = {
    poison: "독",
    burn: "화상",
    freeze: "빙결",
    // ... (모든 상태 이상 이름)
    debuff: "약화"
};

// 상태 이상 아이콘
const STATUS_ICONS = {
    poison: '☠️',
    burn: '🔥',
    freeze: '❄️',
    // ... (모든 상태 이상 아이콘)
    debuff: '⬇️'
};

// ***참고: 이 코드는 몬스터의 특성을 동적으로 생성하는 로직입니다.***
const MONSTER_TRAITS = (() => {
    const obj = {};
    const elems = ['fire','ice','wind','earth','light','dark'];
    const statuses = ['poison','freeze','burn','bleed','paralysis','nightmare','silence','petrify','debuff'];
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    elems.forEach(e => {
        ['Melee','Ranged','Magic'].forEach(t => {
            obj[cap(e)+t] = { name: `${cap(e)} ${t}`, icon: ELEMENT_EMOJI[e], element: e };
        });
    });
    statuses.forEach(s => {
        ['Melee','Ranged','Magic'].forEach(t => {
            obj[cap(s)+t] = { name: `${STATUS_NAMES[s]} ${t}`, icon: STATUS_ICONS[s], status: s };
        });
    });
    return obj;
})();
5. 기타 설정 및 상수
게임 전반에 사용되는 기타 설정값들입니다.

JavaScript

// 게임플레이 관련 상수
const SHOP_PRICE_MULTIPLIER = 3;
const PARTY_LEASH_RADIUS = 10;
const MAX_FULLNESS = 100;
const FULLNESS_LOSS_PER_TURN = 0.01;
const CORPSE_TURNS = 60;
const CORRIDOR_WIDTH = 7;
const HEAL_MANA_COST = 2;

// 맵 아이템 접두사
const MAP_PREFIXES = [
    { name: 'Populous', modifiers: { monsterMultiplier: 1.5 } },
    { name: 'Elite', modifiers: { eliteChanceBonus: 0.2 } },
    { name: 'Resistant', modifiers: { monsterDefenseBonus: 2 } },
    { name: 'Vicious', modifiers: { monsterAttackBonus: 2 } }
];

// 맵 아이템 접미사
const MAP_SUFFIXES = [
    { name: 'of Treasures', modifiers: { treasureMultiplier: 2.0 } },
    { name: 'of Riches', modifiers: { goldMultiplier: 1.5 } },
    { name: 'of Items', modifiers: { lootChanceBonus: 0.15 } },
    { name: 'of Haste', modifiers: { monsterSpeedBonus: 2 } }
];

// 맵 타일 타입 (이벤트 오브젝트)
const MAP_TILE_TYPES = [
    { name: 'Campfire', icon: '🔥' },
    { name: 'Fountain', icon: '⛲' },
    { name: 'Totem', icon: '🗿' }
];
```
