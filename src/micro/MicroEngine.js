import { MicroTurnManager } from './MicroTurnManager.js';

// src/micro/MicroEngine.js

// MicroEngine handles the micro-world progression. It listens for combat events
// and updates weapon experience and proficiency accordingly.
export class MicroEngine {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.turnManager = new MicroTurnManager();

        if (this.eventManager) {
            this.eventManager.subscribe('attack_landed', data => this.handleAttackLanded(data));
        }
        console.log('[MicroEngine] Initialized and subscribed to events.');
    }

    handleAttackLanded(data) {
        const { attacker } = data;
        const weapon = attacker.equipment?.weapon;

        if (weapon && weapon.weaponStats) {
            // 1. Increase weapon experience
            weapon.weaponStats.gainExp(1);

            // 2. Increase wielder's proficiency for this weapon type
            const weaponType = this._getProficiencyType(weapon.baseId);
            if (weaponType && attacker.proficiency && attacker.proficiency[weaponType]) {
                const prof = attacker.proficiency[weaponType];
                prof.exp++;
                if (prof.exp >= prof.expNeeded) {
                    prof.level++;
                    prof.exp = 0;
                    prof.expNeeded = Math.floor(prof.expNeeded * 1.5);
                    this.eventManager.publish('log', {
                        message: `${attacker.constructor.name}의 ${weaponType} 숙련도가 ${prof.level}레벨이 되었습니다!`,
                        color: 'gold'
                    });
                }
            }
        }
    }

    _getProficiencyType(itemId) {
        if (!itemId) return null;
        if (itemId.includes('sword')) return 'sword';
        if (itemId.includes('dagger')) return 'dagger';
        if (itemId.includes('estoc')) return 'estoc';
        if (itemId.includes('saber')) return 'saber';
        if (itemId.includes('spear')) return 'spear';
        if (itemId.includes('violin_bow')) return 'violin_bow';
        if (itemId.includes('bow')) return 'bow';
        return null;
    }

    update(allItems) {
        // 게임 루프로부터 전달된 아이템 목록을 TurnManager에 위임한다
        this.turnManager.update(allItems);
        // Additional micro-world systems can be ticked here.
    }
}
