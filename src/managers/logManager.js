// src/logManager.js

// === LogManager를 CombatLogManager로 이름 변경 ===
export class CombatLogManager {
    constructor(eventManager) {
        this.logElement = document.getElementById('combat-log-content');
        this.logs = [];

        eventManager.subscribe('log', (data) => this.add(data.message));

        // 'damage_calculated' 이벤트를 구독하여 전투 로그를 남긴다.
        eventManager.subscribe('damage_calculated', (data) => {
            const { attacker, defender, damage, details } = data;
            this.add(
                `${attacker.constructor.name}가 ${defender.constructor.name}을(를) 공격하여 <span class="damage" title="클릭하여 상세 정보 보기">${damage}</span>의 피해를 입혔습니다.`,
                'combat',
                details
            );
        });

        eventManager.subscribe('entity_death', (data) => {
            const { victim } = data;
            this.add(`%c${victim.constructor.name} (이)가 쓰러졌습니다.`);
        });

        eventManager.subscribe('exp_gained', (data) => {
            this.add(`%c${data.exp}의 경험치를 획득했습니다.`);
        });

        eventManager.subscribe('level_up', (data) => {
            this.add(`%c레벨 업! LV ${data.level} 달성!`);
        });
    }

    add(message, type = 'combat', details = null) {
        this.logs.push({ message, type, details });
        if (this.logs.length > 20) this.logs.shift();
        this.render();
    }

    render() {
        const isAtBottom = Math.abs(this.logElement.scrollHeight - this.logElement.clientHeight - this.logElement.scrollTop) < 5;
        this.logElement.innerHTML = this.logs.map(log => {
            if (log.type === 'combat' && log.details) {
                const detailString = `계산 내역:\n- 주사위 (${log.details.diceRoll}) + 스탯 보너스 (+${log.details.statBonus}) - 방어력 (${log.details.defenseReduction}) = 최종 피해량: ${log.details.finalDamage}`;
                return `<span class="clickable" onclick="alert('${detailString}')">${log.message}</span>`;
            }
            return `<span>${log.message}</span>`;
        }).join('<br>');
        if (isAtBottom) {
            setTimeout(() => {
                this.logElement.scrollTop = this.logElement.scrollHeight;
            }, 0);
        }
    }
}

// === SystemLogManager 클래스 새로 추가 ===
export class SystemLogManager {
    constructor(eventManager) {
        this.logElement = document.getElementById('system-log-content');
        this.logs = [];
        this.frameCount = 0; // 프레임 카운터 추가

        eventManager.subscribe('debug', (data) => {
            // 특정 태그는 조건을 걸어서 너무 자주 찍히지 않도록 함
            if (data.tag === 'Frame') {
                this.frameCount++;
                if (this.frameCount % 60 === 0) { // 60프레임(약 1초)에 한 번만
                    this.add(data.tag, data.message);
                }
            } else {
                this.add(data.tag, data.message);
            }
        });
    }
    add(tag, message) {
        const timestamp = new Date().toLocaleTimeString();

        const last = this.logs[this.logs.length - 1];
        if (last && last.tag === tag && last.message === message) {
            last.count = (last.count || 1) + 1;
        } else {
            this.logs.push({ timestamp, tag, message, count: 1 });
            if (this.logs.length > 50) this.logs.shift();
        }
        this.render();
    }
    render() {
        if (this.logElement) {
            const isAtBottom = Math.abs(this.logElement.scrollHeight - this.logElement.clientHeight - this.logElement.scrollTop) < 5;
            const text = this.logs.map(log => {
                const countText = log.count > 1 ? ` (x${log.count})` : '';
                return `[${log.timestamp}] [${log.tag}] ${log.message}${countText}`;
            }).join('\n');
            this.logElement.innerText = text;
            if (isAtBottom) {
                setTimeout(() => {
                    this.logElement.scrollTop = this.logElement.scrollHeight;
                }, 0);
            }
        }
    }
}
