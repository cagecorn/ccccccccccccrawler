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

    _filterVisibleEnemies(self, enemies) {
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
    decideAction(self, context) {
        const { player, allies, enemies, mapManager, eventManager } = context;

        const currentVisionRange = self.stats?.get('visionRange') ?? self.visionRange;
        const visibleEnemies = enemies.filter(e => Math.hypot(e.x - self.x, e.y - self.y) < currentVisionRange);
        const targetList = visibleEnemies;

        if (targetList.length === 0) {
            if (self.isFriendly && !self.isPlayer) {
                const target = this._getWanderPosition(self, player, allies, mapManager);
                if (Math.hypot(target.x - self.x, target.y - self.y) > self.tileSize * 0.3) {
                    return { type: 'move', target };
                }
            }
            return { type: 'idle' };
        }

        // 1. 가장 가까운 적 찾기
        let nearestTarget = null;
        let minDistance = Infinity;

        // T/F 성향에 따른 타겟팅 로직
        const mbti = self.properties?.mbti || '';
        let potentialTargets = [...targetList];
        if (mbti.includes('T')) {
            potentialTargets.sort((a, b) => a.hp - b.hp);
        } else if (mbti.includes('F')) {
            const allyTargets = new Set();
            allies.forEach(ally => {
                if (ally.currentTarget) allyTargets.add(ally.currentTarget.id);
            });
            const focusedTarget = potentialTargets.find(t => allyTargets.has(t.id));
            if (focusedTarget) {
                potentialTargets = [focusedTarget];
            }
        }

        for (const target of potentialTargets) {
            const dx = target.x - self.x;
            const dy = target.y - self.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestTarget = target;
            }
        }

        self.currentTarget = nearestTarget;

        // 2. 행동 결정
        if (nearestTarget) {
            const hasLOS = hasLineOfSight(
                Math.floor(self.x / mapManager.tileSize),
                Math.floor(self.y / mapManager.tileSize),
                Math.floor(nearestTarget.x / mapManager.tileSize),
                Math.floor(nearestTarget.y / mapManager.tileSize),
                mapManager
            );

            if (!hasLOS && self.isFriendly && !self.isPlayer) {
                const playerDistance = Math.sqrt(Math.pow(player.x - self.x, 2) + Math.pow(player.y - self.y, 2));
                if (playerDistance > self.tileSize) {
                    return { type: 'move', target: player };
                }
            }
            // 돌진 스킬 확인 및 P 성향 표시
            const chargeSkill = Array.isArray(self.skills)
                ? self.skills.map(id => SKILLS[id]).find(s => s && s.tags && s.tags.includes('charge'))
                : null;
            if (mbti.includes('P')) {
                // P 성향은 돌진 성향을 강화합니다
            }

            if (
                !self.isPlayer &&
                chargeSkill &&
                minDistance > self.attackRange &&
                minDistance <= chargeSkill.chargeRange &&
                self.mp >= chargeSkill.manaCost &&
                (self.skillCooldowns[chargeSkill.id] || 0) <= 0
            ) {
                return { type: 'charge_attack', target: nearestTarget, skill: chargeSkill };
            }

            if (hasLOS && minDistance < self.attackRange) {
                // 사용할 수 있는 스킬이 있다면 스킬 사용
                const skillId = self.skills && self.skills[0];
                const skill = SKILLS[skillId];
                if (
                    skill &&
                    self.mp >= skill.manaCost &&
                    (self.skillCooldowns[skillId] || 0) <= 0
                ) {
                    if (mbti.includes('S')) {
                        // 감각형은 스킬 사용을 선호
                    } else if (mbti.includes('N') && self.hp / self.maxHp < 0.6) {
                        // 직관형은 체력이 낮을 때 스킬 사용
                    }
                    return { type: 'skill', target: nearestTarget, skillId };
                }

                // 공격 범위 안에 있으면 기본 공격
                return { type: 'attack', target: nearestTarget };
            }

            if (hasLOS && minDistance <= self.speed) {
                // 너무 가까우면 더 이상 다가가지 않음
                return { type: 'idle' };
            }

            // 목표 지점을 향해 이동 (시야가 가려져 있어도 탐색)
            return { type: 'move', target: nearestTarget };
        } else if (self.isFriendly && !self.isPlayer) {
            const target = this._getWanderPosition(self, player, allies, mapManager);
            if (Math.hypot(target.x - self.x, target.y - self.y) > self.tileSize * 0.3) {
                return { type: 'move', target };
            }
        }
        
        // 기본 상태는 대기
        return { type: 'idle' };
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
            const visibles = this._filterVisibleEnemies(self, enemies);
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

// ... PurifierAI, RangedAI, WizardAI, SummonerAI 클래스는 변경 없습니다 ...

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
    decideAction(self, context) {
        const { player, allies, enemies, mapManager, eventManager } = context;

        const currentVisionRange = self.stats?.get('visionRange') ?? self.visionRange;
        const visibleEnemies = enemies.filter(e => Math.hypot(e.x - self.x, e.y - self.y) < currentVisionRange);
        const targetList = visibleEnemies;

        if (targetList.length === 0) {
            if (self.isFriendly && !self.isPlayer) {
                const target = this._getWanderPosition(self, player, allies, mapManager);
                if (Math.hypot(target.x - self.x, target.y - self.y) > self.tileSize * 0.3) {
                    return { type: 'move', target };
                }
            }
            return { type: 'idle' };
        }

        // T/F 성향에 따른 타겟팅 우선순위 결정
        const mbti = self.properties?.mbti || '';
        let potentialTargets = [...targetList];
        if (mbti.includes('T')) {
            potentialTargets.sort((a, b) => a.hp - b.hp);
        } else if (mbti.includes('F')) {
            const allyTargets = new Set();
            allies.forEach(ally => {
                if (ally.currentTarget) allyTargets.add(ally.currentTarget.id);
            });
            const focusedTarget = potentialTargets.find(t => allyTargets.has(t.id));
            if (focusedTarget) {
                potentialTargets = [focusedTarget];
            }
        }

        let nearestTarget = null;
        let minDistance = Infinity;
        for (const target of potentialTargets) {
            const dx = target.x - self.x;
            const dy = target.y - self.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestTarget = target;
            }
        }

        if (nearestTarget) {
            const hasLOS = hasLineOfSight(
                Math.floor(self.x / mapManager.tileSize),
                Math.floor(self.y / mapManager.tileSize),
                Math.floor(nearestTarget.x / mapManager.tileSize),
                Math.floor(nearestTarget.y / mapManager.tileSize),
                mapManager
            );
            if (!hasLOS && self.isFriendly && !self.isPlayer) {
                const target = this._getWanderPosition(self, player, allies, mapManager);
                if (Math.hypot(target.x - self.x, target.y - self.y) > self.tileSize * 0.3) {
                    return { type: 'move', target };
                }
            }

            if (hasLOS) {
                if (minDistance <= self.attackRange && minDistance > self.attackRange * 0.5) {
                    // S/N 성향에 따른 스킬 사용 시점 표시
                    if (mbti.includes('S')) {
                        // 스킬 사용 선호
                    } else if (mbti.includes('N') && self.hp / self.maxHp < 0.6) {
                        // 위기 상황에서 스킬 사용
                    }

                    const skillId = self.skills && self.skills[0];
                    const skill = SKILLS[skillId];
                    if (
                        skill &&
                        self.mp >= skill.manaCost &&
                        (self.skillCooldowns[skillId] || 0) <= 0
                    ) {
                        return { type: 'skill', target: nearestTarget, skillId };
                    }
                    return { type: 'attack', target: nearestTarget };
                }

                if (minDistance <= self.attackRange * 0.5) {
                    // P 성향은 후퇴하지 않고 돌격
                    if (mbti.includes('P')) {
                        return { type: 'move', target: nearestTarget };
                    }
                    if (mbti.includes('J')) {
                        // 계획적인 움직임 표시
                    }
                    const dx = nearestTarget.x - self.x;
                    const dy = nearestTarget.y - self.y;
                    return { type: 'move', target: { x: self.x - dx, y: self.y - dy } };
                }
            }

            return { type: 'move', target: nearestTarget };
        } else if (self.isFriendly && !self.isPlayer) {
            const target = this._getWanderPosition(self, player, allies, mapManager);
            if (Math.hypot(target.x - self.x, target.y - self.y) > self.tileSize * 0.3) {
                return { type: 'move', target };
            }
        }

        return { type: 'idle' };
    }
}

// --- 마법사형 AI (현재는 RangedAI와 동일하게 동작)
export class WizardAI extends RangedAI {
    // 추가적인 마법사 전용 로직이 들어갈 수 있습니다
}

// --- 빙의 AI 클래스 ---
export class TankerGhostAI extends AIArchetype {
    decideAction(self, context) {
        const { player, possessedRanged } = context;

        if (this._filterVisibleEnemies(self, [player]).length === 0) {
            return { type: 'idle' };
        }

        const nearestEnemy = player; // 플레이어를 주 타겟으로 삼음

        // 1. 보호할 원딜 아군 찾기
        let myRangedAlly = null;
        if (possessedRanged.length > 0) {
            // 가장 가까운 원딜을 보호
            myRangedAlly = possessedRanged.sort(
                (a, b) =>
                    Math.hypot(a.x - self.x, a.y - self.y) -
                    Math.hypot(b.x - self.x, b.y - self.y)
            )[0];
        }

        // 2. 보호할 원딜이 있을 경우, 수호 위치로 이동
        if (myRangedAlly) {
            const dx = nearestEnemy.x - myRangedAlly.x;
            const dy = nearestEnemy.y - myRangedAlly.y;
            const dist = Math.hypot(dx, dy) || 1;

            // 수호 위치: 원딜과 적 사이 (원딜에게서 64픽셀 앞)
            const guardX = myRangedAlly.x + (dx / dist) * 64;
            const guardY = myRangedAlly.y + (dy / dist) * 64;
            const guardPosition = { x: guardX, y: guardY };

            // 수호 위치에서 너무 멀면 이동
            if (Math.hypot(guardX - self.x, guardY - self.y) > self.tileSize * 0.5) {
                return { type: 'move', target: guardPosition };
            }
        }

        // 3. 수호 위치에 있거나, 보호할 원딜이 없으면, 가까운 적을 공격
        if (Math.hypot(nearestEnemy.x - self.x, nearestEnemy.y - self.y) < self.attackRange) {
            return { type: 'attack', target: nearestEnemy };
        }

        // 4. 공격할 적이 사거리 밖에 있으면, (원딜이 없을 경우) 적에게 이동
        if (!myRangedAlly) {
            return { type: 'move', target: nearestEnemy };
        }

        return { type: 'idle' }; // 위치 사수
    }
}

export class RangedGhostAI extends AIArchetype {
    decideAction(self, context) {
        const { player, possessedTankers, possessedSupporters } = context;
        if (this._filterVisibleEnemies(self, [player]).length === 0) {
            return { type: 'idle' };
        }
        const nearestEnemy = player;

        // 1. 의지할 탱커 아군 찾기
        let myTanker = null;
        if (possessedTankers.length > 0) {
            myTanker = possessedTankers.sort(
                (a, b) =>
                    Math.hypot(a.x - self.x, a.y - self.y) -
                    Math.hypot(b.x - self.x, b.y - self.y)
            )[0];
        }

        // Supporter는 탱커가 없을 때 후퇴 지점으로 사용
        let mySupport = null;
        if (!myTanker && possessedSupporters.length > 0) {
            mySupport = possessedSupporters.sort(
                (a, b) =>
                    Math.hypot(a.x - self.x, a.y - self.y) -
                    Math.hypot(b.x - self.x, b.y - self.y)
            )[0];
        }

        // 2. 탱커도 서포터도 없으면 도망
        if (!myTanker && !mySupport) {
            const fleeDx = self.x - nearestEnemy.x;
            const fleeDy = self.y - nearestEnemy.y;
            const fleeTarget = { x: self.x + fleeDx, y: self.y + fleeDy };
            return { type: 'move', target: fleeTarget };
        }

        const anchor = myTanker || mySupport;

        // 3. 탱커(또는 서포터) 뒤 안전한 위치 계산
        const safeDx = anchor.x - nearestEnemy.x;
        const safeDy = anchor.y - nearestEnemy.y;
        const safeDist = Math.hypot(safeDx, safeDy) || 1;
        const safePosition = {
            x: anchor.x + (safeDx / safeDist) * 96,
            y: anchor.y + (safeDy / safeDist) * 96
        };

        // 4. 안전 위치와 멀면 이동
        if (Math.hypot(safePosition.x - self.x, safePosition.y - self.y) > self.tileSize) {
            return { type: 'move', target: safePosition };
        }

        // 5. 안전하고, 적이 사거리 내에 있으면 공격
        const distToEnemy = Math.hypot(nearestEnemy.x - self.x, nearestEnemy.y - self.y);
        if (distToEnemy < self.attackRange) {
            // 적이 너무 가까우면 살짝 뒤로 빠짐 (카이팅)
            if (distToEnemy < self.attackRange * 0.4) {
                const kiteDx = self.x - nearestEnemy.x;
                const kiteDy = self.y - nearestEnemy.y;
                return { type: 'move', target: { x: self.x + kiteDx, y: self.y + kiteDy } };
            }
            return { type: 'attack', target: nearestEnemy };
        }

        return { type: 'idle' };
    }
}

export class SupporterGhostAI extends AIArchetype {
    decideAction(self, context) {
        const { player, possessedRanged, possessedTankers } = context;
        if (this._filterVisibleEnemies(self, [player]).length === 0) {
            return { type: 'idle' };
        }
        const nearestEnemy = player;

        // 1. 지원할 원딜 찾기
        let myRangedAlly = null;
        if (possessedRanged.length > 0) {
            myRangedAlly = possessedRanged.sort(
                (a, b) => a.hp / a.maxHp - b.hp / b.maxHp
            )[0]; // 가장 체력이 낮은 원딜 우선
        }

        // 원딜이 없으면 체력이 가장 낮은 탱커 지원
        let myTankerAlly = null;
        if (!myRangedAlly && possessedTankers.length > 0) {
            myTankerAlly = possessedTankers.sort(
                (a, b) => a.hp / a.maxHp - b.hp / b.maxHp
            )[0];
        }

        if (!myRangedAlly && !myTankerAlly) {
            // 특별히 도울 대상이 없으면 플레이어 주변을 배회
            return this._getWanderPosition
                ? {
                      type: 'move',
                      target: this._getWanderPosition(
                          self,
                          player,
                          context.allies,
                          context.mapManager
                      )
                  }
                : { type: 'idle' };
        }

        // 2. 원딜 체력이 낮으면 힐 시도
        const healSkill = self.skills.map(id => SKILLS[id]).find(s => s?.tags.includes('healing'));
        const priorityTarget = myRangedAlly || myTankerAlly;
        if (
            priorityTarget &&
            priorityTarget.hp / priorityTarget.maxHp < 0.7 &&
            healSkill &&
            self.mp >= healSkill.manaCost &&
            (self.skillCooldowns[healSkill.id] || 0) <= 0
        ) {
            if (Math.hypot(priorityTarget.x - self.x, priorityTarget.y - self.y) < self.attackRange) {
                return { type: 'skill', skillId: healSkill.id, target: priorityTarget };
            } else {
                return { type: 'move', target: priorityTarget };
            }
        }

        const protectTarget = myRangedAlly || myTankerAlly;
        // 3. 적이 아군에게 너무 가까우면 몸으로 막기 (가로채기)
        if (protectTarget && Math.hypot(nearestEnemy.x - protectTarget.x, nearestEnemy.y - protectTarget.y) < 128) {
            const interceptX = protectTarget.x + (nearestEnemy.x - protectTarget.x) / 2;
            const interceptY = protectTarget.y + (nearestEnemy.y - protectTarget.y) / 2;
            return { type: 'move', target: { x: interceptX, y: interceptY } };
        }

        // 4. 평소에는 대상 바로 뒤를 따라다님
        const followTarget = protectTarget || player;
        const followPosition = { x: followTarget.x - 64, y: followTarget.y };
        if (Math.hypot(followPosition.x - self.x, followPosition.y - self.y) > self.tileSize * 0.5) {
            return { type: 'move', target: followPosition };
        }

        return { type: 'idle' };
    }
}

export class CCGhostAI extends AIArchetype {
    decideAction(self, context) {
        const { player, possessedTankers } = context;
        if (this._filterVisibleEnemies(self, [player]).length === 0) {
            return { type: 'idle' };
        }
        let nearestEnemy = player;

        // 1. 협력할 탱커 찾기
        let myTanker = null;
        if (possessedTankers.length > 0) {
            myTanker = possessedTankers[0];
        }

        // 2. 탱커가 있으면 그 주변에 위치
        if (myTanker) {
            const flankPosition = { x: myTanker.x, y: myTanker.y + 96 };
            if (Math.hypot(flankPosition.x - self.x, flankPosition.y - self.y) > self.tileSize) {
                return { type: 'move', target: flankPosition };
            }
            // 탱커 주변의 가장 가까운 적을 타겟으로 재설정
            const enemiesNearTanker = context.enemies.filter(
                e => Math.hypot(e.x - myTanker.x, e.y - myTanker.y) < 256
            );
            if (enemiesNearTanker.length > 0) {
                nearestEnemy = enemiesNearTanker.sort(
                    (a, b) =>
                        Math.hypot(a.x - self.x, a.y - self.y) -
                        Math.hypot(b.x - self.x, b.y - self.y)
                )[0];
            }
        }

        // 3. CC 스킬 사용 시도
        const ccSkill = self.skills
            .map(id => SKILLS[id])
            .find(s => s?.tags.includes('debuff') || s?.tags.includes('cc'));
        if (
            ccSkill &&
            self.mp >= ccSkill.manaCost &&
            (self.skillCooldowns[ccSkill.id] || 0) <= 0
        ) {
            const distToNearest = Math.hypot(nearestEnemy.x - self.x, nearestEnemy.y - self.y);
            if (distToNearest < self.attackRange) {
                const mainAngle = Math.atan2(nearestEnemy.y - self.y, nearestEnemy.x - self.x);
                const cone = Math.PI / 6; // 30도 범위
                const othersInCone = context.enemies.filter(e => {
                    if (e === nearestEnemy) return false;
                    const dx = e.x - self.x;
                    const dy = e.y - self.y;
                    const d = Math.hypot(dx, dy);
                    if (d > self.attackRange) return false;
                    const angle = Math.atan2(dy, dx);
                    const diff = Math.atan2(Math.sin(angle - mainAngle), Math.cos(angle - mainAngle));
                    return Math.abs(diff) <= cone;
                });
                if (othersInCone.length > 0) {
                    return { type: 'skill', skillId: ccSkill.id, target: nearestEnemy };
                }
            }
        }

        // 4. 기본 공격 또는 이동
        if (Math.hypot(nearestEnemy.x - self.x, nearestEnemy.y - self.y) < self.attackRange) {
            return { type: 'attack', target: nearestEnemy };
        } else {
            return { type: 'move', target: nearestEnemy };
        }
    }
}

// --- 소환사형 AI ---
export class SummonerAI extends RangedAI {
    decideAction(self, context) {
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

        return super.decideAction(self, context);
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

        const visible = this._filterVisibleEnemies(self, enemies);
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
