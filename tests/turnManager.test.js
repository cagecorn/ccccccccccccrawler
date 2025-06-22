import { TurnManager } from '../src/managers/turnManager.js';
import { describe, test, assert } from './helpers.js';

describe('Managers', () => {

test('턴 카운트 증가', () => {
    const turnManager = new TurnManager();
    turnManager.framesPerTurn = 10;
    for (let i = 0; i < 10; i++) {
        turnManager.update([], {});
    }
    assert.strictEqual(turnManager.turnCount, 1);
});

});
