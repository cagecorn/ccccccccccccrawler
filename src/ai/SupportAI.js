import { AIArchetype } from '../ai.js';
import { SKILLS } from '../data/skills.js';

export class SupportAI extends AIArchetype {
    /**
     * @param {object} supportEngine - SupportEngine 인스턴스
     * @param {object} config - { priorities: ['heal','purify','buff'], buffId: 'effect_id', skillIds?: { heal, purify, buff } }
     */
    constructor(supportEngine, config = {}) {
        super();
        if (!supportEngine) throw new Error('SupportAI requires a SupportEngine.');
        this.engine = supportEngine;
        this.priorities = config.priorities || [];
        this.buffId = config.buffId || null;
        const defaults = {
            heal: SKILLS.heal.id,
            purify: SKILLS.purify.id,
            buff: config.buffSkillId || 'buff'
        };
        this.skillIds = { ...defaults, ...(config.skillIds || {}) };
    }

    decideAction(self, context) {
        const { allies } = context;
        for (const priority of this.priorities) {
            let target = null;
            if (priority === 'heal') {
                target = this.engine.findHealTarget(self, allies);
            } else if (priority === 'purify') {
                target = this.engine.findPurifyTarget(self, allies);
            } else if (priority === 'buff') {
                target = this.engine.findBuffTarget(self, allies, this.buffId);
            }
            if (target) {
                return { type: 'skill', target, skillId: this.skillIds[priority] };
            }
        }
        return { type: 'idle' };
    }
}
