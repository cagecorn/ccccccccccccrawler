// src/turnManager.js
// 턴 기반의 상태 변화를 관리할 매니저 (구멍만 파기)
export class TurnManager {
    constructor() {
        this.turnCount = 0;
        this.framesPerTurn = 100; // 100프레임을 1턴으로 간주
        this.currentFrame = 0;
    }

    update(entities, { eventManager = null, player = null, parasiteManager = null } = {}) {
        this.currentFrame++;
        if (this.currentFrame >= this.framesPerTurn) {
            this.currentFrame = 0;
            this.turnCount++;

            for (const e of entities) {
                if (e.fullness !== undefined) {
                    let loss = 0;
                    if ((e.isFriendly || e.isPlayer) && e.prevTurnPos) {
                        if (e.x !== e.prevTurnPos.x || e.y !== e.prevTurnPos.y) {
                            loss = 0.1;
                        }
                    } else if (parasiteManager?.hasParasite(e)) {
                        loss = 0.1; // 몬스터는 이동 여부와 상관없이 기본 소모
                    }
                    if (parasiteManager?.hasParasite(e)) {
                        loss = +(loss * 2).toFixed(2);
                    }
                    if (loss > 0) {
                        e.fullness = Math.max(0, +(e.fullness - loss).toFixed(2));
                    }
                    e.prevTurnPos = { x: e.x, y: e.y };
                    if (e.fullness <= 0) {
                        eventManager?.publish('log', { message: `${e.constructor.name}이(가) 굶주림으로 쓰러졌습니다.` });
                        if (e.isPlayer) {
                            eventManager?.publish('game_over', {});
                        } else {
                            eventManager?.publish('entity_death', { attacker: null, victim: e });
                        }
                        continue;
                    } else if (e.fullness < 20) {
                        eventManager?.publish('log', { message: `${e.constructor.name}의 배부름이 위험합니다!`, color: 'orange' });
                    }
                }

                if (e.affinity !== undefined && e !== player && e.isFriendly) {
                    let gain = 0.1;
                    if (parasiteManager?.hasParasite(e)) gain *= 0.5;
                    e.affinity = Math.min(e.maxAffinity, +(e.affinity + gain).toFixed(2));
                    if (e.affinity <= 0) {
                        eventManager?.publish('log', { message: `${e.constructor.name}의 호감도가 바닥나 파티를 떠났습니다.` });
                    } else if (e.affinity < 20) {
                        eventManager?.publish('log', { message: `${e.constructor.name}의 호감도가 위험합니다!`, color: 'orange' });
                    }
                }
            }
        }
    }
}
