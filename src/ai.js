// src/ai.js

import { hasLineOfSight } from './utils/geometry.js';
import { SKILLS } from './data/skills.js';

// AI 내에서 직접 팝업을 호출하지 않고 이벤트만 발생시켜
// 시각 효과 로직과 분리한다.  실제 팝업 처리는 game.js가 담당한다.

// --- AI 유형(Archetype)의 기반이 될 부모 클래스 ---
export class AIArchetype {
    // action은 { type: 'move', target: {x, y} } 또는 { type: 'attack', target: entity } 같은 객체
    decideAction(self, context) {
        // 기본적으로는 아무것도 하지 않음 (자식 클래스에서 재정의)
        return { type: 'idle' };
    }

    // 플레이어 주변을 랜덤하게 배회하도록 목표 위치를 계산
    _getWanderPosition(self, player, allies, mapManager) {
        const reached = self.wanderTarget &&
            Math.hypot(self.wanderTarget.x - self.x, self.wanderTarget.y - self.y) < self.tileSize * 0.3;
        if (!self.wanderTarget || reached || self.wanderCooldown <= 0) {
            const base = mapManager ? mapManager.tileSize : self.tileSize;
            const angle = Math.random() * Math.PI * 2;
            const dist = base * (1 + Math.random() * 1.5);
            let x = player.x + Math.cos(angle) * dist;
            let y = player.y + Math.sin(angle) * dist;

            // 동료와 너무 가까우면 살짝 밀어내기
            for (const ally of allies) {
                if (ally === self) continue;
                const dx = x - ally.x;
                const dy = y - ally.y;
                const d = Math.hypot(dx, dy);
                if (d > 0 && d < base) {
                    x += (dx / d) * base;
                    y += (dy / d) * base;
                }
            }

            if (mapManager && mapManager.isWallAt(x, y, self.width, self.height)) {
                x = player.x;
                y = player.y;
            }

            self.wanderTarget = { x, y };
            self.wanderCooldown = 60 + Math.floor(Math.random() * 60);
        } else {
            self.wanderCooldown--;
        }

        return self.wanderTarget || player;
    }

    _filterVisibleEnemies(self, enemies, context) {
        if (context?.visionEngine) {
            return context.visionEngine.getVisibleTargets(self, enemies);
        }
        const range = self.stats?.get('visionRange') ?? self.visionRange;
        return (enemies || []).filter(e =>
            Math.hypot(e.x - self.x, e.y - self.y) < range);
    }
}

export class CompositeAI extends AIArchetype {
    constructor(...ais) {
        super();
        this.ais = ais;
    }

    decideAction(self, context) {
        for (const ai of this.ais) {
            const action = ai.decideAction(self, context);
            if (action && action.type !== 'idle') return action;
        }
        return { type: 'idle' };
    }
}

// --- 전사형 AI ---
export class MeleeAI extends AIArchetype {
    // MetaAIManager가 타겟을 지정해 주므로, 여기서는 그 타겟을 어떻게 추적할지만 판단한다.
    decideAction(self, target, context) {
        const { aiPathfindingEngine, player, allies, mapManager } = context;
        if (!target && self.isFriendly && !self.isPlayer && player) {
            const wander = this._getWanderPosition(
                self,
                player,
                allies || [],
                mapManager
            );
            if (
                Math.hypot(wander.x - self.x, wander.y - self.y) >
                self.tileSize * 0.3
            ) {
                return { type: 'move', target: wander };
            }
        }

        return aiPathfindingEngine
            ? aiPathfindingEngine.decideAction(self, target, context)
            : { type: 'idle' };
    }
}

// --- 힐러형 AI ---
export class HealerAI extends AIArchetype {
    decideAction(self, context) {
        const { player, allies, enemies, mapManager, eventManager } = context;
        const mbti = self.properties?.mbti || '';
        const healId = SKILLS.heal?.id;
        const healSkill = SKILLS[healId];
        if (!healId || !healSkill) return { type: 'idle' };
        // --- S/N 성향에 따라 힐 우선순위를 조정 ---
        // 실제 힐을 사용할 때 MBTI 알파벳을 표시하기 위해 먼저 우선순위만 결정한다.
        let healThreshold = 0.7;
        if (mbti.includes('S')) {
            healThreshold = 0.9;
        } else if (mbti.includes('N')) {
            healThreshold = 0.5;
        }

        // 체력이 일정 비율 이하로 떨어진 아군만 후보로 선정
        const candidates = allies.filter(
            a => a.hp < a.maxHp && a.hp / a.maxHp <= healThreshold
        );
        if (candidates.length === 0) {
            const visibles = this._filterVisibleEnemies(self, enemies, context);
            if (visibles.length > 0) {
                let potential = [...visibles];
                let targetCandidate = null;
                if (mbti.includes('T')) {
                    targetCandidate = potential.reduce((low, cur) => cur.hp < low.hp ? cur : low, potential[0]);
                } else if (mbti.includes('F')) {
                    const allyTargets = new Set();
                    allies.forEach(a => {
                        if (a.currentTarget) allyTargets.add(a.currentTarget.id);
                    });
                    const focused = potential.find(t => allyTargets.has(t.id));
                    if (focused) {
                        targetCandidate = focused;
                    }
                }
                const nearest = targetCandidate || potential.reduce(
                    (closest, cur) =>
                        Math.hypot(cur.x - self.x, cur.y - self.y) < Math.hypot(closest.x - self.x, closest.y - self.y)
                            ? cur
                            : closest,
                    potential[0]
                );
                const dist = Math.hypot(nearest.x - self.x, nearest.y - self.y);
                const hasLOS = hasLineOfSight(
                    Math.floor(self.x / mapManager.tileSize),
                    Math.floor(self.y / mapManager.tileSize),
                    Math.floor(nearest.x / mapManager.tileSize),
                    Math.floor(nearest.y / mapManager.tileSize),
                    mapManager,
                );
                self.currentTarget = nearest;
                if (hasLOS && dist <= self.attackRange) {
                    return { type: 'attack', target: nearest };
                }
                return { type: 'move', target: nearest };
            }

            if (self.isFriendly && !self.isPlayer && player) {
                const target = this._getWanderPosition(self, player, allies, mapManager);
                if (Math.hypot(target.x - self.x, target.y - self.y) > self.tileSize * 0.3) {
                    return { type: 'move', target };
                }
            }
            return { type: 'idle' };
        }

        // --- E/I 성향에 따라 힐 대상 선택 ---
        let target = null;
        if (mbti.includes('I')) {
            target = candidates.find(c => c === self) || candidates[0];
        } else if (mbti.includes('E')) {
            target = candidates.reduce(
                (lowest, cur) =>
                    cur.hp / cur.maxHp < lowest.hp / lowest.maxHp ? cur : lowest,
                candidates[0],
            );
        } else {
            target = candidates[0];
        }

        const skillReady =
            healId &&
            Array.isArray(self.skills) &&
            self.skills.includes(healId) &&
            self.mp >= healSkill.manaCost &&
            (self.skillCooldowns[healId] || 0) <= 0;

        const distance = Math.hypot(target.x - self.x, target.y - self.y);
        const hasLOS = hasLineOfSight(
            Math.floor(self.x / mapManager.tileSize),
            Math.floor(self.y / mapManager.tileSize),
            Math.floor(target.x / mapManager.tileSize),
            Math.floor(target.y / mapManager.tileSize),
            mapManager,
        );

        if (distance <= self.attackRange && hasLOS && skillReady) {
            // MBTI 성향에 따른 힐 사용 타이밍 기록

            return { type: 'skill', target, skillId: healId };
        }

        return { type: 'move', target };
    }
}


// --- 정화 전용 AI ---
export class PurifierAI extends AIArchetype {
    decideAction(self, context) {
        const { player, allies, mapManager } = context;
        const purifyId = SKILLS.purify?.id;
        const skill = SKILLS[purifyId];
        const ready =
            purifyId &&
            Array.isArray(self.skills) &&
            self.skills.includes(purifyId) &&
            self.mp >= skill.manaCost &&
            (self.skillCooldowns[purifyId] || 0) <= 0;

        const mbti = self.properties?.mbti || '';
        let candidates = allies.filter(a =>
            (a.effects || []).some(e => e.tags?.includes('status_ailment'))
        );
        if (candidates.length === 0) {
            if (self.isFriendly && !self.isPlayer && player) {
                const t = this._getWanderPosition(self, player, allies, mapManager);
                if (Math.hypot(t.x - self.x, t.y - self.y) > self.tileSize * 0.3) {
                    return { type: 'move', target: t };
                }
            }
            return { type: 'idle' };
        }

        let target = null;
        if (mbti.includes('I')) {
            target = candidates.find(c => c === self) || candidates[0];
        } else {
            target = candidates[0];
        }


        // Purifiers used to occasionally idle based on 'P' MBTI, which made
        // their behavior unpredictable during tests. That randomness has been
        // removed so that allies afflicted with a status ailment are always
        // cleansed when possible.

        const dist = Math.hypot(target.x - self.x, target.y - self.y);
        const hasLOS = hasLineOfSight(
            Math.floor(self.x / mapManager.tileSize),
            Math.floor(self.y / mapManager.tileSize),
            Math.floor(target.x / mapManager.tileSize),
            Math.floor(target.y / mapManager.tileSize),
            mapManager,
        );

        if (dist <= self.attackRange && hasLOS && ready) {
            return { type: 'skill', target, skillId: purifyId };
        }

        return { type: 'move', target };
    }
}

// --- 원거리형 AI ---
export class RangedAI extends AIArchetype {
    decideAction(self, target, context) {
        if (!target) {
            return context.aiPathfindingEngine
                ? context.aiPathfindingEngine.decideAction(self, null, context)
                : { type: 'idle' };
        }

        const distance = Math.hypot(target.x - self.x, target.y - self.y);
        const optimalRange = self.attackRange * 0.8;

        if (distance <= self.attackRange && distance > self.attackRange * 0.3) {
            return { type: 'attack', target };
        } else if (distance <= self.attackRange * 0.3) {
            const fleeVector = { x: self.x - target.x, y: self.y - target.y };
            return { type: 'flee', vector: fleeVector };
        } else {
            const { pathfindingManager } = context;
            const approachPoint = { x: target.x, y: target.y };
            const path = pathfindingManager?.findPath({ x: self.x, y: self.y }, approachPoint);
            if (path && path.length > 0) {
                return { type: 'follow_path', path, target };
            }
        }
        return { type: 'idle' };
    }
}

// --- 마법사형 AI (현재는 RangedAI와 동일하게 동작)
export class WizardAI extends RangedAI {
    // 추가적인 마법사 전용 로직이 들어갈 수 있습니다
}

// --- 소환사형 AI ---
export class SummonerAI extends RangedAI {
    decideAction(self, target, context) {
        const summonId = SKILLS.summon_skeleton?.id;
        const skill = SKILLS[summonId];
        const maxMinions = self.properties?.maxMinions ?? 1;
        const activeMinions = context.allies.filter(
            a => a !== self && a.properties?.summonedBy === self.id
        );
        if (
            summonId &&
            skill &&
            Array.isArray(self.skills) &&
            self.skills.includes(summonId) &&
            self.mp >= skill.manaCost &&
            (self.skillCooldowns[summonId] || 0) <= 0 &&
            activeMinions.length < maxMinions
        ) {
            return { type: 'skill', target: self, skillId: summonId };
        }

        return super.decideAction(self, target, context);
    }
}

export class BardAI extends AIArchetype {
    decideAction(self, context) {
        const { player, allies, enemies, mapManager, eventManager } = context;
        const mbti = self.properties?.mbti || '';
        const songs = [SKILLS.guardian_hymn.id, SKILLS.courage_hymn.id];
        for (const skillId of songs) {
            const skill = SKILLS[skillId];
            if (
                self.skills.includes(skillId) &&
                self.mp >= skill.manaCost &&
                (self.skillCooldowns[skillId] || 0) <= 0 &&
                self.equipment.weapon && self.equipment.weapon.tags.includes('song')
            ) {
                let target = player; // 기본 대상은 플레이어

                // --- E/I 성향에 따라 노래 대상 선택 ---
                if (mbti.includes('E')) {
                    const woundedAlly = allies
                        .filter(a => a !== self)
                        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
                    if (woundedAlly) target = woundedAlly;
                } else if (mbti.includes('I')) {
                    target = self;
                }

                const distance = Math.hypot(target.x - self.x, target.y - self.y);
                if (distance <= self.attackRange) {
                    // E/I 성향을 실제 노래 시점에 표시
                    if (mbti.includes('E')) {
                        // 외향형은 크게 노래함
                    } else if (mbti.includes('I')) {
                        // 내향형은 조용히 노래한다
                    }
                    return { type: 'skill', target, skillId };
                }
                return { type: 'move', target };
            }
        }

        const visible = this._filterVisibleEnemies(self, enemies, context);
        if (visible.length > 0) {
            let potential = [...visible];
            let targetCandidate = null;
            if (mbti.includes('T')) {
                targetCandidate = potential.reduce((low, cur) => cur.hp < low.hp ? cur : low, potential[0]);
            } else if (mbti.includes('F')) {
                const allyTargets = new Set();
                allies.forEach(a => {
                    if (a.currentTarget) allyTargets.add(a.currentTarget.id);
                });
                const focused = potential.find(t => allyTargets.has(t.id));
                if (focused) {
                    targetCandidate = focused;
                }
            }
            const nearest = targetCandidate || potential.reduce(
                (closest, cur) =>
                    Math.hypot(cur.x - self.x, cur.y - self.y) < Math.hypot(closest.x - self.x, closest.y - self.y)
                        ? cur
                        : closest,
                potential[0]
            );
            const dist = Math.hypot(nearest.x - self.x, nearest.y - self.y);
            const hasLOS = hasLineOfSight(
                Math.floor(self.x / mapManager.tileSize),
                Math.floor(self.y / mapManager.tileSize),
                Math.floor(nearest.x / mapManager.tileSize),
                Math.floor(nearest.y / mapManager.tileSize),
                mapManager,
            );
            self.currentTarget = nearest;
            if (hasLOS && dist <= self.attackRange) {
                return { type: 'attack', target: nearest };
            }
            return { type: 'move', target: nearest };
        }

        if (self.isFriendly && !self.isPlayer) {
            const target = this._getWanderPosition(self, player, allies, mapManager);
            if (Math.hypot(target.x - self.x, target.y - self.y) > self.tileSize * 0.3) {
                return { type: 'move', target };
            }
        }

        return { type: 'idle' };
    }
}

// --- 상태이상 전용 AI들 ---
export class FearAI extends AIArchetype {
    decideAction(self, context) {
        const nearestEnemy = context.enemies.sort(
            (a, b) =>
                Math.hypot(a.x - self.x, a.y - self.y) -
                Math.hypot(b.x - self.x, b.y - self.y)
        )[0];
        if (!nearestEnemy) return { type: 'idle' };

        const fleeTarget = {
            x: self.x + (self.x - nearestEnemy.x),
            y: self.y + (self.y - nearestEnemy.y)
        };
        return { type: 'move', target: fleeTarget };
    }
}

export class ConfusionAI extends AIArchetype {
    decideAction(self, context) {
        const nearestAlly = context.allies
            .filter(a => a !== self)
            .sort(
                (a, b) =>
                    Math.hypot(a.x - self.x, a.y - self.y) -
                    Math.hypot(b.x - self.x, b.y - self.y)
            )[0];
        if (!nearestAlly) return { type: 'idle' };

        if (Math.hypot(nearestAlly.x - self.x, nearestAlly.y - self.y) < self.attackRange) {
            return { type: 'attack', target: nearestAlly };
        }
        return { type: 'move', target: nearestAlly };
    }
}

export class BerserkAI extends AIArchetype {
    decideAction(self, context) {
        const allUnits = [...context.allies, ...context.enemies].filter(u => u !== self);
        const nearest = allUnits.sort(
            (a, b) =>
                Math.hypot(a.x - self.x, a.y - self.y) -
                Math.hypot(b.x - self.x, b.y - self.y)
        )[0];
        if (!nearest) return { type: 'idle' };

        if (Math.hypot(nearest.x - self.x, nearest.y - self.y) < self.attackRange) {
            return { type: 'attack', target: nearest };
        }
        return { type: 'move', target: nearest };
    }
}

export class CharmAI extends AIArchetype {
    decideAction(self, context) {
        const charmEffect = self.effects.find(e => e.id === 'charm');
        const caster = charmEffect?.caster;
        if (!caster) return { type: 'idle' };
        return { type: 'move', target: caster };
    }
}
