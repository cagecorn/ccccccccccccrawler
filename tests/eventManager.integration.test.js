import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

describe('Integration', () => {

test('이벤트 매니저 통합 동작', () => {
    // 1. 테스트 환경 설정
    const eventManager = new EventManager();
    let combatLogReceived = false;
    let systemLogReceived = false;
    let statsChangeReceived = false;

    // 2. 가짜 매니저들의 이벤트 구독
    eventManager.subscribe('log', (data) => {
        if (data.message === 'Test Message') {
            combatLogReceived = true;
        }
    });

    eventManager.subscribe('debug', (data) => {
        if (data.message === 'Test Debug') {
            systemLogReceived = true;
        }
    });

    eventManager.subscribe('stats_changed', (data) => {
        if (data.entity === 'player') {
            statsChangeReceived = true;
        }
    });

    // 3. 이벤트 발행
    console.log('   Publishing events...');
    eventManager.publish('log', { message: 'Test Message' });
    eventManager.publish('debug', { tag: 'Test', message: 'Test Debug' });
    eventManager.publish('stats_changed', { entity: 'player' });

    // 4. 결과 확인
    assert.ok(combatLogReceived, "CombatLogManager가 'log' 이벤트를 수신하지 못했습니다.");
    assert.ok(systemLogReceived, "SystemLogManager가 'debug' 이벤트를 수신하지 못했습니다.");
    assert.ok(statsChangeReceived, '스탯 변경 이벤트가 정상적으로 수신되지 않았습니다.');
});

});
