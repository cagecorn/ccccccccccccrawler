import { rollOnTable, rollDiceNotation } from '../src/utils/random.js';
import { describe, test, assert } from './helpers.js';

describe('Utility', () => {

test('가중치 기반 롤링', () => {
    const testTable = [
        { id: 'success', weight: 100 },
        { id: 'fail', weight: 0 },
    ];
    const result = rollOnTable(testTable);
    assert.strictEqual(result, 'success');
});

test('주사위 표기법 굴리기', () => {
    const originalRandom = Math.random;
    Math.random = () => 0; // 항상 최소값
    const result = rollDiceNotation('2d6+3');
    Math.random = originalRandom;
    // 2d6 with roll 1 each -> 2 + 3 = 5
    assert.strictEqual(result, 5);
});

});
