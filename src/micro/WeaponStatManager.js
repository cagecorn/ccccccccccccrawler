import { SwordAI, DaggerAI, BowAI, SpearAI, ViolinBowAI, EstocAI, AxeAI, MaceAI, StaffAI, ScytheAI, WhipAI } from './WeaponAI.js';
import { WEAPON_SKILLS } from '../data/weapon-skills.js';

export class WeaponStatManager {
    constructor(itemId) {
        this.level = 1;
        this.exp = 0;
        this.expNeeded = 20; // 초기 필요 경험치
        this.skills = [];    // 이 무기가 현재 사용할 수 있는 스킬 목록
        this.cooldown = 0;   // 이 무기의 스킬 쿨다운
        this.ai = this._getAIByItemId(itemId);

        this._unlockSkills(); // 1레벨 스킬 즉시 해금
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.expNeeded) {
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.exp -= this.expNeeded;
        this.expNeeded = Math.floor(this.expNeeded * 1.8); // 레벨업 시 필요 경험치 증가
        console.log(`[Micro-World] 무기가 ${this.level}레벨로 성장했습니다!`);
        this._unlockSkills();
    }

    _unlockSkills() {
        for (const skillId in WEAPON_SKILLS) {
            const skill = WEAPON_SKILLS[skillId];
            if (!this.skills.includes(skillId) && this.level >= (skill.requiredLevel || 1)) {
                this.skills.push(skillId);
                console.log(`[Micro-World] 새로운 무기 스킬 [${skill.name}]을 배웠습니다!`);
            }
        }
    }

    getAI() {
        return this.ai;
    }

    canUseSkill(skillId) {
        return this.skills.includes(skillId) && this.cooldown <= 0;
    }

    setCooldown(duration) {
        this.cooldown = duration;
    }

    _getAIByItemId(itemId) {
        if (itemId.includes('sword')) return new SwordAI();
        if (itemId.includes('dagger')) return new DaggerAI();
        if (itemId.includes('bow')) {
            if (itemId.includes('violin')) return new ViolinBowAI();
            return new BowAI();
        }
        if (itemId.includes('spear')) return new SpearAI();
        if (itemId.includes('estoc')) return new EstocAI();
        // --- 신규 무기 AI 연결 ---
        if (itemId.includes('axe')) return new AxeAI();
        if (itemId.includes('mace')) return new MaceAI();
        if (itemId.includes('staff')) return new StaffAI();
        if (itemId.includes('scythe')) return new ScytheAI();
        if (itemId.includes('whip')) return new WhipAI();
        // -----------------------
        return new SwordAI(); // 기본값은 검 AI
    }
}
