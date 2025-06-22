// src/managers/possessionAIManager.js
import { SKILLS } from '../data/skills.js';
import { FearAI, ConfusionAI, BerserkAI, CharmAI } from '../ai.js';

export class PossessionAIManager {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.ghosts = [];
        this.possessedEntities = new Set();

        if (this.eventManager) {
            this.eventManager.subscribe('emblem_equipped', ({ entity, emblemItem }) => {
                if(emblemItem.possessionAI) this.addPossession(entity, emblemItem.possessionAI);
            });
            this.eventManager.subscribe('emblem_unequipped', ({ entity }) => {
                this.removePossession(entity);
            });
        }
        console.log("[PossessionAIManager] Initialized");
    }

    addGhost(ghost) {
        this.ghosts.push(ghost);
    }

    addPossession(entity, ghostAI) {
        if (entity.possessedBy) this.removePossession(entity);
        entity.possessedBy = ghostAI;
        this.possessedEntities.add(entity);
        this.eventManager.publish('log', { message: `👻 유령(${ghostAI.constructor.name.replace('AI','')})이 ${entity.constructor.name}에게 빙의했습니다!`, color: 'magenta' });
    }

    removePossession(entity) {
        if (!entity.possessedBy) return;
        this.eventManager.publish('log', { message: `👻 ${entity.constructor.name}에게서 유령이 빠져나왔습니다.`, color: 'magenta' });
        entity.possessedBy = null;
        this.possessedEntities.delete(entity);
    }
    
    update(context) {
        // --- 1. 몬스터 빙의 로직 ---
        const unpossessedMonsters = context.monsterManager.monsters.filter(m => !m.possessedBy && m.hp > 0);

        for (const ghost of this.ghosts) {
            if (ghost.host && ghost.host.hp <= 0) {
                this.removePossession(ghost.host);
                ghost.host = null;
                ghost.state = 'seeking';
            }

            if (ghost.state === 'seeking' && unpossessedMonsters.length > 0) {
                let foundHost = null;
                for (let i = unpossessedMonsters.length - 1; i >= 0; i--) {
                    const monster = unpossessedMonsters[i];
                    let isMatch = false;
                    switch (ghost.type) {
                        case 'tanker':
                            isMatch = monster.equipment?.off_hand?.tags.includes('shield');
                            break;
                        case 'ranged':
                            isMatch = monster.equipment?.main_hand?.tags.includes('ranged');
                            break;
                        case 'supporter':
                            isMatch = monster.skills.some(s => SKILLS[s]?.tags.includes('healing')) ||
                                monster.consumables.some(item => item.tags.includes('healing_item'));
                            break;
                        case 'cc':
                            const ccWeapons = ['spear', 'whip', 'estoc'];
                            isMatch = ccWeapons.some(w => monster.equipment?.main_hand?.name.toLowerCase().includes(w)) ||
                                monster.skills.some(s => SKILLS[s]?.tags.includes('debuff'));
                            break;
                    }
                    if (isMatch) {
                        foundHost = monster;
                        unpossessedMonsters.splice(i, 1);
                        break;
                    }
                }

                if (foundHost) {
                    ghost.host = foundHost;
                    ghost.state = 'possessing';
                    this.addPossession(foundHost, ghost.ai);
                }
            }
        }

        // --- 2. 모든 빙의된 유닛의 AI 실행 로직 ---
        const allPossessed = Array.from(this.possessedEntities).filter(e => e.hp > 0);

        // 2-1. 적군(몬스터) AI 실행
        const hostilePossessed = allPossessed.filter(e => !e.isFriendly);
        if (hostilePossessed.length > 0) {
            const hostileContext = {
                ...context,
                allies: hostilePossessed,
                enemies: context.playerGroup.members,
                possessedTankers: hostilePossessed.filter(e => e.possessedBy?.constructor.name === 'TankerGhostAI'),
                possessedRanged: hostilePossessed.filter(e => e.possessedBy?.constructor.name === 'RangedGhostAI'),
                possessedSupporters: hostilePossessed.filter(e => e.possessedBy?.constructor.name === 'SupporterGhostAI'),
                possessedCC: hostilePossessed.filter(e => e.possessedBy?.constructor.name === 'CCGhostAI'),
            };
            for (const entity of hostilePossessed) {
                if (entity.hp > 0) {
                    const overrideEffect = entity.effects.find(e => e.type === 'ai_override');
                    if (overrideEffect) {
                        let overrideAI;
                        switch (overrideEffect.id) {
                            case 'fear': overrideAI = new FearAI(); break;
                            case 'confusion': overrideAI = new ConfusionAI(); break;
                            case 'berserk': overrideAI = new BerserkAI(); break;
                            case 'charm': overrideAI = new CharmAI(); break;
                        }
                        if (overrideAI) {
                            const action = overrideAI.decideAction(entity, hostileContext);
                            context.metaAIManager.executeAction(entity, action, hostileContext);
                            continue;
                        }
                    }

                    if (entity.possessedBy) {
                        const action = entity.possessedBy.decideAction(entity, hostileContext);
                        context.metaAIManager.executeAction(entity, action, hostileContext);
                    }
                }
            }
        }

        // 2-2. 아군(플레이어 파티) AI 실행
        const friendlyPossessed = allPossessed.filter(e => e.isFriendly);
        if (friendlyPossessed.length > 0) {
            const friendlyContext = {
                ...context,
                allies: context.playerGroup.members,
                enemies: context.monsterManager.monsters,
                possessedTankers: friendlyPossessed.filter(e => e.possessedBy?.constructor.name === 'TankerGhostAI'),
                possessedRanged: friendlyPossessed.filter(e => e.possessedBy?.constructor.name === 'RangedGhostAI'),
                possessedSupporters: friendlyPossessed.filter(e => e.possessedBy?.constructor.name === 'SupporterGhostAI'),
                possessedCC: friendlyPossessed.filter(e => e.possessedBy?.constructor.name === 'CCGhostAI'),
            };
            for (const entity of friendlyPossessed) {
                if (entity.hp > 0) {
                    const overrideEffect = entity.effects.find(e => e.type === 'ai_override');
                    if (overrideEffect) {
                        let overrideAI;
                        switch (overrideEffect.id) {
                            case 'fear': overrideAI = new FearAI(); break;
                            case 'confusion': overrideAI = new ConfusionAI(); break;
                            case 'berserk': overrideAI = new BerserkAI(); break;
                            case 'charm': overrideAI = new CharmAI(); break;
                        }
                        if (overrideAI) {
                            const action = overrideAI.decideAction(entity, friendlyContext);
                            context.metaAIManager.executeAction(entity, action, friendlyContext);
                            continue;
                        }
                    }

                    if (entity.possessedBy) {
                        const action = entity.possessedBy.decideAction(entity, friendlyContext);
                        context.metaAIManager.executeAction(entity, action, friendlyContext);
                    }
                }
            }
        }
    }
}
