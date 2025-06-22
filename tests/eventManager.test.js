import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

describe('Managers', () => {

test('publish가 구독자 호출', () => {
    const em = new EventManager();
    let called = false;
    em.subscribe('test', () => { called = true; });
    em.publish('test', {});
    assert.ok(called);
});

});
