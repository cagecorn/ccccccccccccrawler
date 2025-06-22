import { MbtiEngine } from '../src/managers/ai/MbtiEngine.js';
import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

describe('MbtiEngine', () => {
    test('triggers trait event based on action', () => {
        const eventManager = new EventManager();
        const engine = new MbtiEngine(eventManager);
        const entity = { properties: { mbti: 'ISTJ' } };
        let fired = null;
        eventManager.subscribe('ai_mbti_trait_triggered', data => { fired = data; });
        const action = { type: 'move', target: {}, context: { allies: [] } };
        engine.process(entity, action);
        assert.ok(fired, 'Event did not fire');
        assert.strictEqual(fired.trait, 'J');
        assert.strictEqual(fired.entity, entity);
    });

    test('cooldown prevents rapid fire', () => {
        const eventManager = new EventManager();
        const engine = new MbtiEngine(eventManager);
        const entity = { properties: { mbti: 'ESTJ' } };
        let count = 0;
        eventManager.subscribe('ai_mbti_trait_triggered', () => { count++; });
        const action = { type: 'move', target: {}, context: { allies: [] } };
        engine.process(entity, action);
        engine.process(entity, action); // cooldown should block this
        assert.strictEqual(count, 1);
    });
});
