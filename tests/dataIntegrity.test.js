import { SKILLS } from '../src/data/skills.js';
import { ITEMS } from '../src/data/items.js';
import { describe, test, assert } from './helpers.js';

describe('Data Integrity', () => {
    test('모든 스킬은 manaCost 속성을 가진다', () => {
        for (const skill of Object.values(SKILLS)) {
            assert.strictEqual(typeof skill.manaCost, 'number');
        }
    });

    test('모든 무기 아이템은 damageDice 속성을 포함한다', () => {
        for (const item of Object.values(ITEMS)) {
            if (item.type === 'weapon') {
                assert.ok(item.damageDice);
            }
        }
    });

    test('모든 스킬과 아이템은 tags 배열을 가진다', () => {
        for (const skill of Object.values(SKILLS)) {
            assert.ok(Array.isArray(skill.tags) && skill.tags.length > 0);
        }
        for (const item of Object.values(ITEMS)) {
            assert.ok(Array.isArray(item.tags) && item.tags.length > 0);
        }
    });
});
