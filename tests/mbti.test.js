import { CharacterFactory } from '../src/factory.js';
import { MBTI_TYPES } from '../src/data/mbti.js';
import { describe, test, assert } from './helpers.js';

describe('CharacterFactory', () => {

    test('_rollMBTI returns valid type', () => {
        const factory = new CharacterFactory({});
        const mbti = factory._rollMBTI();
        assert.ok(MBTI_TYPES.includes(mbti));
    });

});
