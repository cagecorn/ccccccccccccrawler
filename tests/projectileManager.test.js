import { ProjectileManager } from '../src/managers/projectileManager.js';
import { EventManager } from '../src/managers/eventManager.js';
import { describe, test, assert } from './helpers.js';

const assets = { arrow: {} };

describe('ProjectileManager', () => {
    test('knockback_success event fires on hit', () => {
        const eventManager = new EventManager();
        const kbEngine = { calls: [], apply(a, t, s) { this.calls.push({ a, t, s }); } };
        const pm = new ProjectileManager(eventManager, assets, null, kbEngine);
        const caster = { x: 0, y: 0, width: 1, height: 1, equipment: { weapon: {} } };
        const target = { x: 5, y: 0, width: 1, height: 1, hp: 10 };
        const skill = { projectile: 'arrow', damage: 0, knockbackStrength: 8 };
        pm.create(caster, target, skill);
        let payload = null;
        eventManager.subscribe('knockback_success', d => { payload = d; });
        pm.update([target]);
        assert.strictEqual(kbEngine.calls.length, 1);
        assert.ok(payload && payload.attacker === caster);
    });
});
