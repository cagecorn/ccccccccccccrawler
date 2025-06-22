// src/micro/WeaponAI.js
import { WEAPON_SKILLS } from '../data/weapon-skills.js';

class BaseWeaponAI {
    decideAction(wielder, weapon, context) {
        return { type: 'idle' };
    }
}

export class SwordAI extends BaseWeaponAI {
    decideAction(wielder, weapon, context) {
        const { enemies } = context;
        if (!enemies || enemies.length === 0) return { type: 'idle' };

        let nearest = null;
        let minDist = Infinity;
        for (const enemy of enemies) {
            const d = Math.hypot(enemy.x - wielder.x, enemy.y - wielder.y);
            if (d < minDist) {
                minDist = d;
                nearest = enemy;
            }
        }

        if (!nearest) return { type: 'idle' };

        if (
            weapon?.weaponStats?.canUseSkill('parry_stance') &&
            minDist <= wielder.attackRange &&
            wielder.attackCooldown > 0
        ) {
            return { type: 'weapon_skill', skillId: 'parry_stance', target: wielder };
        }

        if (minDist <= wielder.attackRange) {
            return { type: 'attack', target: nearest };
        }

        return { type: 'move', target: nearest };
    }
}

export class DaggerAI extends BaseWeaponAI {
    decideAction(wielder, weapon, context) {
        const { enemies } = context;
        if (!enemies || enemies.length === 0) return { type: 'idle' };

        const nearest = enemies.sort((a,b)=>Math.hypot(a.x-wielder.x,a.y-wielder.y)-Math.hypot(b.x-wielder.x,b.y-wielder.y))[0];
        const distance = Math.hypot(nearest.x - wielder.x, nearest.y - wielder.y);

        if (distance <= wielder.attackRange) {
            return { type: 'attack', target: nearest };
        }

        if (nearest.direction === undefined && !nearest.facing) {
            return { type: 'move', target: { x: nearest.x, y: nearest.y } };
        }

        return { type: 'backstab_teleport', target: nearest };
    }
}

export class BowAI extends BaseWeaponAI {
    decideAction(wielder, weapon, context) {
        const { enemies } = context;
        if (!enemies || enemies.length === 0) return { type: 'idle' };

        const nearestTarget = enemies.sort((a,b)=>Math.hypot(a.x-wielder.x,a.y-wielder.y)-Math.hypot(b.x-wielder.x,b.y-wielder.y))[0];
        const distance = Math.hypot(nearestTarget.x-wielder.x, nearestTarget.y-wielder.y);

        const isCharging = wielder.effects?.some(e=>e.id==='charging_shot_effect');
        if (isCharging) {
            return { type: 'attack', target: nearestTarget };
        }

        const chargeSkillId = 'charge_shot';
        if (weapon.weaponStats?.canUseSkill(chargeSkillId) && distance <= wielder.attackRange && distance > wielder.attackRange*0.5) {
            return { type: 'weapon_skill', skillId: chargeSkillId, target: wielder };
        }

        if (distance <= wielder.attackRange*0.5) {
            return { type: 'move', target: { x: wielder.x - (nearestTarget.x - wielder.x), y: wielder.y - (nearestTarget.y - wielder.y) } };
        } else if (distance > wielder.attackRange) {
            return { type: 'move', target: nearestTarget };
        }

        return { type: 'attack', target: nearestTarget };
    }
}

export class SpearAI extends BaseWeaponAI {
    decideAction(wielder, weapon, context) {
        const { enemies, mapManager } = context;
        if (!enemies || enemies.length === 0) return { type: 'idle' };

        let nearestTarget = null;
        let minDistance = Infinity;
        for (const target of enemies) {
            const d = Math.hypot(target.x-wielder.x, target.y-wielder.y);
            if (d < minDistance) { minDistance = d; nearestTarget = target; }
        }

        if (nearestTarget) {
            const chargeSkillId = 'charge';
            const chargeData = WEAPON_SKILLS[chargeSkillId];
            const chargeRange = chargeData.range || 200;

            if (weapon.weaponStats?.canUseSkill(chargeSkillId) && minDistance > wielder.attackRange && minDistance <= chargeRange) {
                return { type: 'weapon_skill', skillId: chargeSkillId, target: nearestTarget };
            }

            if (minDistance <= wielder.attackRange) {
                return { type: 'attack', target: nearestTarget };
            }

            return { type: 'move', target: nearestTarget };
        }

        return { type: 'idle' };
    }
}

export class ViolinBowAI extends BowAI {
    decideAction(wielder, weapon, context) {
        // 음파 화살은 패시브 스킬이므로, 기본 활 AI의 행동을 그대로 따릅니다.
        // 실제 범위 피해 로직은 ProjectileManager에서 처리됩니다.
        return super.decideAction(wielder, weapon, context);
    }
}

export class EstocAI extends BaseWeaponAI {
    decideAction(wielder, weapon, context) {
        const { enemies } = context;
        if (!enemies || enemies.length === 0) {
            wielder.aiState = null;
            return { type: 'idle' };
        }

        const nearestTarget = enemies.sort((a, b) => Math.hypot(a.x - wielder.x, a.y - wielder.y) - Math.hypot(b.x - wielder.x, b.y - wielder.y))[0];
        const distance = Math.hypot(nearestTarget.x - wielder.x, nearestTarget.y - wielder.y);

        if (wielder.aiState === 'retreating') {
            if (wielder.aiStateTimer > 0) {
                wielder.aiStateTimer--;
                const retreatTarget = {
                    x: wielder.x - (nearestTarget.x - wielder.x),
                    y: wielder.y - (nearestTarget.y - wielder.y)
                };
                return { type: 'move', target: retreatTarget };
            }
            wielder.aiState = null;
        }

        if (distance <= wielder.attackRange) {
            wielder.aiState = 'retreating';
            wielder.aiStateTimer = 30;
            return { type: 'attack', target: nearestTarget };
        }

        return { type: 'move', target: nearestTarget };
    }
}

export class SaberAI extends EstocAI {}

// --- 신규 무기 AI 클래스 ---
export class AxeAI extends SwordAI {}
export class MaceAI extends SwordAI {}

export class StaffAI extends BowAI {
    // 지능 수치가 높을수록 기본 공격 피해가 증가합니다.
    // 실제 피해 계산은 CombatCalculator에서 처리됩니다.
}

export class ScytheAI extends SpearAI {}
export class WhipAI extends SpearAI {
    decideAction(wielder, weapon, context) {
        const { enemies } = context;
        if (!enemies || enemies.length === 0) return { type: 'idle' };

        const nearestTarget = [...enemies]
            .sort((a, b) => Math.hypot(a.x - wielder.x, a.y - wielder.y) - Math.hypot(b.x - wielder.x, b.y - wielder.y))[0];
        const distance = Math.hypot(nearestTarget.x - wielder.x, nearestTarget.y - wielder.y);

        const pullSkillId = 'pull';
        const pullSkillData = WEAPON_SKILLS[pullSkillId];

        if (
            weapon.weaponStats.canUseSkill(pullSkillId) &&
            distance > wielder.attackRange &&
            distance <= pullSkillData.range
        ) {
            if (wielder.properties?.mbti?.includes('T')) {
                const weakestTarget = enemies
                    .filter(e => Math.hypot(e.x - wielder.x, e.y - wielder.y) <= pullSkillData.range)
                    .sort((a, b) => a.hp - b.hp)[0];
                if (weakestTarget) {
                    return { type: 'weapon_skill', skillId: pullSkillId, target: weakestTarget };
                }
            }
            return { type: 'weapon_skill', skillId: pullSkillId, target: nearestTarget };
        }

        return super.decideAction(wielder, weapon, context);
    }
}
// --- 여기까지 ---

export { BaseWeaponAI };
