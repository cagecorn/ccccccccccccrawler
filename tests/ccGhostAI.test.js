import { CCGhostAI } from '../src/ai.js';
import { describe, test, assert } from './helpers.js';

describe('CCGhostAI', () => {
  test('uses CC skill when multiple enemies lined up', () => {
    const ai = new CCGhostAI();
    const self = {
      x: 0,
      y: 0,
      attackRange: 20,
      mp: 20,
      tileSize: 1,
      visionRange: 50,
      skills: ['weaken'],
      skillCooldowns: {},
    };
    const context = {
      player: { x: 10, y: 0 },
      enemies: [ { id: 2, x: 15, y: 2 } ],
      possessedTankers: [],
      mapManager: { tileSize: 1 }
    };

    const action = ai.decideAction(self, context);

    assert.strictEqual(action.type, 'skill');
    assert.strictEqual(action.skillId, 'weaken');
  });
});
