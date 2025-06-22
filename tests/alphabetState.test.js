import { StatManager } from '../src/stats.js';
import { EFFECTS } from '../src/data/effects.js';
import { describe, test, assert } from './helpers.js';

describe('Alphabet State Effects', () => {
    test('P 상태가 이동력을 증가시킨다', () => {
        const entity = { effects: [] };
        entity.stats = new StatManager(entity, { movement: 2 });
        entity.effects.push({ id: 'state_P', ...EFFECTS.state_P, remaining: 100 });
        entity.stats.recalculate();
        assert.strictEqual(entity.stats.get('movement'), 3);
    });
});
