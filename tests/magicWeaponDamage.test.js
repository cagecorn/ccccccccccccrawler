import { CombatCalculator } from '../src/combat.js';
import { EventManager } from '../src/managers/eventManager.js';
import { TagManager } from '../src/managers/tagManager.js';
import { describe, test, assert } from './helpers.js';

describe('Magic Weapon Damage', () => {
  test('staff attack includes intelligence bonus', () => {
    const em = new EventManager();
    const tm = new TagManager();
    const calc = new CombatCalculator(em, tm);
    let dmg = null;
    em.subscribe('damage_calculated', d => { dmg = d.damage; });

    const attacker = {
      attackPower: 3,
      equipment: { weapon: { tags: ['magic_weapon'] } },
      stats: { get: (s) => (s === 'intelligence' ? 4 : 0) }
    };
    const defender = { stats: { get: () => 0 } };

    const orig = Math.random; Math.random = () => 0;
    calc.handleAttack({ attacker, defender, skill: null });
    Math.random = orig;

    assert.strictEqual(dmg, 5);
  });
});
