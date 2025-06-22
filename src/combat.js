// src/combat.js

import { WEAPON_SKILLS } from './data/weapon-skills.js';

export class CombatCalculator {
    constructor(eventManager, tagManager) {
        this.eventManager = eventManager;
        this.tagManager = tagManager;
    }

    _calculateRuneDamage(weapon, skill) {
        if (!weapon || !weapon.sockets || weapon.sockets.length === 0) {
            return 0;
        }

        let totalRuneDamage = 0;
        for (const rune of weapon.sockets) {
            if (!rune || !rune.weaponDamage) continue;

            const skillElementTags = skill?.tags.filter(t => ['fire', 'ice', 'poison'].includes(t)) || [];

            // 1. 일반 공격 혹은 비속성 스킬: 1.0배
            if (skillElementTags.length === 0) {
                totalRuneDamage += rune.weaponDamage;
                continue;
            }

            // 2. 속성 스킬
            if (skillElementTags.includes(rune.elementType)) {
                totalRuneDamage += rune.weaponDamage * 1.5; // 속성 일치
            }
            // 속성 불일치 시 데미지 없음
        }
        return Math.floor(totalRuneDamage);
    }

    _isBehind(attacker, defender) {
        if (!attacker || !defender) return false;
        const dx = defender.x - attacker.x;
        const dy = defender.y - attacker.y;
        const facing = defender.direction || { x: 0, y: 1 };
        return (dx * facing.x + dy * facing.y) > 0;
    }

    handleAttack(data, context = {}) {
        const { attacker, defender, skill } = data;
        const attackingWeapon = attacker.equipment?.main_hand || attacker.equipment?.weapon;

        // --- 패링 로직 시작 ---
        const defendingWeapon = defender.equipment?.main_hand || defender.equipment?.weapon;

        const parryReadyIndex = defender.effects?.findIndex(e => e.id === 'parry_ready');
        if (parryReadyIndex >= 0 && defendingWeapon) {
            this.eventManager.publish('log', {
                message: `⚔️ ${defender.constructor.name}이 패링으로 공격을 막아냅니다!`,
                color: 'cyan'
            });
            this.eventManager.publish('parry_success', { attacker, defender });
            defender.effects.splice(parryReadyIndex, 1);
            const cooldown = WEAPON_SKILLS.parry.cooldown;
            defendingWeapon.weaponStats.setCooldown(cooldown);
            return;
        }

        if (defendingWeapon && defendingWeapon.weaponStats?.canUseSkill('parry')) {
            const parrySkillData = WEAPON_SKILLS.parry;
            if (Math.random() < parrySkillData.procChance) {
                this.eventManager.publish('log', {
                    message: `⚔️ ${defender.constructor.name}의 ${defendingWeapon.name}(이)가 ${attacker.constructor.name}의 공격을 쳐냈습니다! [패링]`,
                    color: 'cyan'
                });
                this.eventManager.publish('parry_success', { attacker, defender });
                defendingWeapon.weaponStats.setCooldown(parrySkillData.cooldown);
                return;
            }
        }
        // --- 패링 로직 끝 ---

        let finalDamage = 0;
        const details = { base: 0, fromSkill: 0, fromTags: 0, fromRunes: 0, defenseReduction: 0, isBackstab: false };

        const chargeEffect = attacker.effects?.find(e => e.id === 'charging_shot_effect');
        let damageMultiplier = 1.0;
        if (chargeEffect) {
            damageMultiplier = 1.5;
            attacker.effects = attacker.effects.filter(e => e.id !== 'charging_shot_effect');
            this.eventManager.publish('log', { message: `[충전된 사격]이 발동됩니다!`, color: 'magenta' });
            if (context.knockbackEngine) {
                context.knockbackEngine.apply(attacker, defender, 128);
            }
        }

        if (skill && skill.id === 'backstab' && this._isBehind(attacker, defender)) {
            details.isBackstab = true;
            damageMultiplier *= 1.5;
        }

        // 1. 기본 공격력
        details.base = attacker.attackPower;
        const weapon = attacker.equipment?.weapon;
        if (weapon?.tags?.includes('magic_weapon')) {
            const intBonus = attacker.stats?.get('intelligence') || 0;
            // 마법 무기는 지능의 절반을 추가 피해로 적용한다
            details.base += Math.floor(intBonus / 2);
        }
        finalDamage += details.base;

        // 2. 스킬 데미지
        if (skill) {
            if (this.tagManager.hasTag(skill, 'physical')) {
                details.fromSkill = (attacker.attackPower * (skill.damageMultiplier || 1)) - attacker.attackPower;
            } else if (this.tagManager.hasTag(skill, 'magic')) {
                details.fromSkill = skill.damage || 0;
            }
            finalDamage += details.fromSkill;

            const bonus = this.tagManager.calculateDamageBonus(attacker, skill);
            details.fromTags = bonus;
            finalDamage += bonus;
        }

        // 3. 룬 데미지
        details.fromRunes = this._calculateRuneDamage(attackingWeapon, skill);
        finalDamage += details.fromRunes;

        // 4. 방어력에 의한 감소
        details.defenseReduction = defender.stats.get('defense');
        finalDamage = Math.max(1, finalDamage - details.defenseReduction);
        finalDamage *= damageMultiplier;
        finalDamage = Math.floor(finalDamage);

        details.finalDamage = finalDamage;

        this.eventManager.publish('attack_landed', { attacker, defender, skill });
        this.eventManager.publish('damage_calculated', { ...data, damage: finalDamage, details });

        if (attackingWeapon && attackingWeapon.tags?.includes('sword')) {
            const chance = attackingWeapon.knockbackChance || 0;
            if (chance > 0 && Math.random() < chance) {
                this.eventManager.publish('knockback_success', {
                    attacker,
                    weapon: attackingWeapon
                });
                const strength = attackingWeapon.knockback || 32;
                if (context.knockbackEngine) {
                    context.knockbackEngine.apply(attacker, defender, strength);
                }
            }
        }
    }
}
