// src/entities.js

import { MeleeAI, RangedAI } from './ai.js';
import { StatManager } from './stats.js';

class Entity {
    constructor(config) {
        const { x, y, tileSize, image, groupId, stats, properties } = config;
        this.id = Math.random().toString(36).substr(2, 9);
        this.groupId = groupId;
        this.x = x;
        this.y = y;
        this.image = image;
        this.tileSize = tileSize;
        this.properties = properties || {};
        // StatManager가 entity 자신을 참조하도록 첫 번째 인자로 전달
        this.stats = new StatManager(this, stats || {});
        this.width = this.stats.get('sizeInTiles_w') * tileSize;
        this.height = this.stats.get('sizeInTiles_h') * tileSize;
        this.hp = this.stats.get('maxHp');
        this.mp = this.stats.get('maxMp');
        this.skills = [];
        this.skillCooldowns = {};
        this.attackCooldown = 0;
        this.isPlayer = false;
        this.isFriendly = false;
        this.ai = null;
        this.roleAI = null;     // 힐러, 소환사 등 직업 역할 AI
        this.fallbackAI = null; // 무기가 없을 때 사용할 기본 전투 AI
        this.effects = []; // 적용중인 효과 목록 배열 추가
        this.unitType = 'generic'; // 기본 유닛 타입을 '일반'으로 설정
        this.possessedBy = null; // 빙의 상태를 저장할 속성

        // --- AI 상태 저장용 프로퍼티 ---
        this.aiState = null;      // 현재 AI의 상태 (예: 'retreating')
        this.aiStateTimer = 0;    // 상태 지속 시간(프레임)

        // --- 생존 관련 수치 ---
        this.maxFullness = config.maxFullness ?? 100;
        this.fullness = config.fullness ?? this.maxFullness;
        this.maxAffinity = config.maxAffinity ?? 200;
        if (config.affinity !== undefined) {
            this.affinity = config.affinity;
        }

        // --- 장비창(Equipment) 추가 ---
        this.equipment = {
            main_hand: null,    // 주무기
            off_hand: null,     // 보조장비
            armor: null,        // 갑옷
            helmet: null,       // 투구
            gloves: null,       // 장갑
            boots: null,        // 신발
            accessory1: null,   // 장신구 1
            accessory2: null,   // 장신구 2
        };
        // 기존 코드와의 호환성을 위해 weapon 속성을 main_hand에 매핑
        Object.defineProperty(this.equipment, 'weapon', {
            get: () => this.equipment.main_hand,
            set: (val) => { this.equipment.main_hand = val; },
            enumerable: false,
        });

        // 텔레포트 스킬 사용을 위한 위치 저장용 프로퍼티
        this.teleportSavedPos = null;
        this.teleportReturnPos = null;

        // --- 상태이상 및 버프 관련 수치 ---
        this.shield = 0;       // 보호막
        this.damageBonus = 0;  // 추가 공격력

        this.proficiency = {
            sword: { level: 1, exp: 0, expNeeded: 10 },
            axe: { level: 1, exp: 0, expNeeded: 10 },
            mace: { level: 1, exp: 0, expNeeded: 10 },
            dagger: { level: 1, exp: 0, expNeeded: 10 },
            bow: { level: 1, exp: 0, expNeeded: 10 },
            violin_bow: { level: 1, exp: 0, expNeeded: 10 },
            staff: { level: 1, exp: 0, expNeeded: 10 },
            spear: { level: 1, exp: 0, expNeeded: 10 },
            estoc: { level: 1, exp: 0, expNeeded: 10 },
            scythe: { level: 1, exp: 0, expNeeded: 10 },
            whip: { level: 1, exp: 0, expNeeded: 10 },
        };
    }

    get speed() { return this.stats.get('movementSpeed'); }
    get attackPower() {
        return this.stats.get('attackPower') + (this.damageBonus || 0);
    }
    get maxHp() { return this.stats.get('maxHp'); }
    get maxMp() { return this.stats.get('maxMp'); }
    get hpRegen() { return this.stats.get('hpRegen'); }
    get mpRegen() { return this.stats.get('mpRegen'); }
    get expValue() { return this.stats.get('expValue'); }
    get visionRange() { return this.stats.get('visionRange'); }
    get attackRange() { return this.stats.get('attackRange'); }
    get castingSpeed() { return this.stats.get('castingSpeed'); }
    get attackSpeed() { return this.stats.get('attackSpeed'); }

    // --- AI를 동적으로 변경하는 메서드 추가 ---
    updateAI() {
        if (!this.ai) return;

        const weapon = this.equipment.weapon;
        const tags = Array.isArray(weapon?.tags) ? weapon.tags : [];
        if (tags.includes('ranged')) {
            if (!(this.ai instanceof RangedAI)) this.ai = new RangedAI();
        } else {
            if (!(this.ai instanceof MeleeAI)) this.ai = new MeleeAI();
        }
    }

    render(ctx) {
        // 에어본 효과가 있는지 확인
        const airborneEffect = this.effects.find(e => e.id === 'airborne');
        const sleepEffect = this.effects.find(e => e.id === 'sleep');
        const statusEffect = this.effects.find(e => e.overlayColor);

        let yOffset = 0, shadowScale = 1, rotation = 0;

        if (airborneEffect) {
            // 에어본 지속시간에 따라 위아래로 움직이는 yOffset 계산 (sin 곡선 활용)
            const progress = 1 - (airborneEffect.remaining / airborneEffect.duration);
            yOffset = -Math.sin(progress * Math.PI) * (this.height * 0.5); // 키의 절반만큼 떠오름
            shadowScale = 1 - Math.sin(progress * Math.PI) * 0.4; // 공중에 뜨면 그림자 작아짐
        }

        if (sleepEffect) {
            rotation = Math.PI / 2; // 90도 회전하여 눕힘
            yOffset = this.height / 2; // 눕혔을 때 바닥에 맞춤
        }

        ctx.save();
        // 캔버스 원점을 유닛의 발 중앙으로 이동
        ctx.translate(this.x + this.width / 2, this.y + this.height);

        // 1. 그림자 먼저 그리기 (yOffset의 영향을 받지 않음)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 0, (this.width / 2) * shadowScale, (this.width / 4) * shadowScale, 0, 0, 2 * Math.PI);
        ctx.fill();

        // 2. 유닛 이미지 그리기 (yOffset 적용)
        ctx.translate(0, yOffset);
        ctx.rotate(rotation);
        ctx.scale(this.direction || 1, 1);
        if (this.image) {
            ctx.drawImage(this.image, -this.width / 2, -this.height, this.width, this.height);
        }

        if (statusEffect) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = statusEffect.overlayColor;
            ctx.fillRect(-this.width / 2, -this.height, this.width, this.height);
            ctx.globalCompositeOperation = 'source-over';
        }

        // 3. 장비 그리기 (본체와 동일한 변환 적용)
        if (this.equipmentRenderManager) {
            ctx.save();
            this.equipmentRenderManager.drawEquipment(ctx, this);
            ctx.restore();
        }

        ctx.restore();
    }

    getSaveState() {
        return {
            id: this.id,
            type: this.constructor.name,
            x: this.x,
            y: this.y,
            hp: this.hp,
            stats: this.stats.getSavableState(),
            properties: this.properties,
        };
    }

    update() {
        this.applyRegen();
        if (this.attackCooldown > 0) this.attackCooldown--;
        for (const skillId in this.skillCooldowns) {
            if (this.skillCooldowns[skillId] > 0) {
                this.skillCooldowns[skillId]--;
            }
        }
        // 아이템 쿨다운 감소는 MicroTurnManager가 전담한다
    }

    applyRegen() {
        const hpRegen = this.stats.get('hpRegen');
        if (hpRegen) {
            this.hp = Math.min(this.maxHp, this.hp + hpRegen);
        }
        const mpRegen = this.stats.get('mpRegen');
        if (mpRegen) {
            this.mp = Math.min(this.maxMp, this.mp + mpRegen);
        }
    }

    takeDamage(damage) {
        if (this.shield > 0) {
            const blocked = Math.min(this.shield, damage);
            this.shield -= blocked;
            damage -= blocked;
        }
        this.hp -= damage;
        if (this.hp < 0) this.hp = 0;
    }
}

export class Player extends Entity {
    constructor(config) {
        super(config);
        this.isPlayer = true;
        this.isFriendly = true;
        this.unitType = 'human'; // 플레이어의 타입은 '인간'
        this.fullness = this.maxFullness;
        this.consumables = [];
        this.consumableCapacity = 4;
    }

    render(ctx) {
        super.render(ctx);
        // 플레이어는 머리 위 MBTI 표기를 숨긴다
    }

    addConsumable(item) {
        if (this.consumables.length >= this.consumableCapacity) return false;
        item.quantity = 1;
        this.consumables.push(item);
        return true;
    }

}

export class Mercenary extends Entity {
    constructor(config) {
        super(config);
        this.isFriendly = true;
        this.unitType = 'human'; // 용병의 타입도 '인간'
        this.ai = new MeleeAI();
        this.fullness = this.maxFullness;
        this.affinity = this.maxAffinity;
        this.consumables = [];
        this.consumableCapacity = 4;


        // 플레이어 주변을 배회하기 위한 프로퍼티
        this.wanderCooldown = 0;
        this.wanderTarget = null;
    }

    render(ctx) {
        super.render(ctx);
    }



    addConsumable(item) {
        if (this.consumables.length >= this.consumableCapacity) return false;
        item.quantity = 1;
        this.consumables.push(item);
        return true;
    }
}

export class Monster extends Entity {
    constructor(config) {
        super(config);
        this.isFriendly = false;
        // 나중에 몬스터 종류에 따라 'undead', 'beast' 등으로 설정 가능
        this.unitType = 'monster';
        this.ai = new MeleeAI();
        this.fullness = this.maxFullness;
        if (this.isFriendly) this.affinity = this.maxAffinity;
        this.consumables = [];
        this.consumableCapacity = 4;
        if (Array.isArray(config.skills)) {
            this.skills.push(...config.skills);
        }
    }

    render(ctx) {
        super.render(ctx);
    }

    addConsumable(item) {
        if (this.consumables.length >= this.consumableCapacity) return false;
        item.quantity = 1;
        this.consumables.push(item);
        return true;
    }
}

export class Pet extends Entity {
    constructor(config) {
        super(config);
        this.owner = config.owner;
        this.isFriendly = true;
        this.unitType = 'pet';
        this.ai = new MeleeAI();
        if (config.auraSkill) {
            this.skills.push(config.auraSkill);
        }
        this.consumables = [];
        this.consumableCapacity = 0;
    }

    addConsumable() { return false; }
}

export class Item {
    constructor(x, y, tileSize, name, image) {
        this.x = x; this.y = y; this.width = tileSize; this.height = tileSize;
        this.name = name; this.image = image;
        this.quantity = 1;
        this.baseId = '';
        this.tags = [];
        this.range = 0;
        this.rank = 1;
        this.cooldown = 0;
        this.cooldownRemaining = 0;
        this.healAmount = 0;

        // micro combat properties
        this.tier = 'normal';
        this.durability = 0;
        this.weight = 0;
        this.toughness = 0;
        this.synergies = []; // 아이템이 가진 시너지 목록
        const statsMap = new Map();
        statsMap.add = function(statObj) {
            for (const key in statObj) {
                this.set(key, (this.get(key) || 0) + statObj[key]);
            }
        };
        this.stats = statsMap;
        this.sockets = [];
        this.weaponStats = null;

        // Animation properties
        this.baseY = y;
        this.bobbingAngle = Math.random() * Math.PI * 2;
        this.bobbingSpeed = 0.05;
        this.bobbingAmount = 4;
    }

    update() {
        this.bobbingAngle += this.bobbingSpeed;
        if (this.bobbingAngle > Math.PI * 2) {
            this.bobbingAngle -= Math.PI * 2;
        }
        this.y = this.baseY + Math.sin(this.bobbingAngle) * this.bobbingAmount;
        // 아이템 쿨다운 감소는 MicroTurnManager가 관리한다
    }

    render(ctx) {
        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    getSaveState() {
        return {
            name: this.name,
            quantity: this.quantity,
            rank: this.rank,
            x: this.x,
            y: this.y,
        };
    }
}

export class Projectile {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        // 처음 생성된 위치를 저장해 궤적을 그릴 때 사용한다
        this.startX = config.x;
        this.startY = config.y;
        this.target = config.target;
        this.speed = config.speed || 10;
        this.acceleration = config.acceleration || 0;
        this.image = config.image;
        this.width = config.width || 32;
        this.height = config.height || 32;
        this.damage = config.damage;
        this.knockbackStrength = config.knockbackStrength || 0;
        this.caster = config.caster;
        // 밝게 그려야 하는 마법 투사체의 경우 blendMode를 'lighter'로 설정할 수 있다
        this.blendMode = config.blendMode || null;

        this.rotation = 0;

        this.vfxManager = config.vfxManager || null;
        this.enableGlow = config.enableGlow || false;
        this.isDead = false;
    }

    update() {
        // 주기적으로 파티클을 생성하여 이동 경로에 잔상을 남김
        if (this.enableGlow && this.vfxManager) {
            this.vfxManager.addGlow(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        }

        // 가속도 적용
        this.speed += this.acceleration;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.hypot(dx, dy);

        this.rotation = Math.atan2(dy, dx);

        if (distance < this.speed) {
            this.isDead = true;
            return { collided: true, target: this.target };
        }

        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;

        return { collided: false };
    }

    render(ctx) {
        ctx.save();

        if (this.blendMode) {
            ctx.globalCompositeOperation = this.blendMode;
        }

        if (this.image) {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height);
        }

        ctx.restore();
    }

}

export class Ghost {
    constructor(ghostType, ai) {
        this.type = ghostType;
        this.ai = ai;
        this.host = null;
        this.state = 'seeking'; // 'seeking', 'possessing', 'wandering'
    }
}
