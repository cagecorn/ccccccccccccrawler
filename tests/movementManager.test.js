import { MovementManager } from '../src/managers/movementManager.js';
import { describe, test, assert } from './helpers.js';

describe('Managers', () => {
  test('끼임 방지 로직 호출 (상세 테스트 필요)', () => {
    const mockMapManager = {
      tileSize: 10,
      isWallAt: (x, y) => x >= 50 && x < 60 && y >= 50 && y < 60,
    };
    const movementManager = new MovementManager(mockMapManager);
    const entity = { id: 'test', x: 45, y: 52, width: 10, height: 10, speed: 5 };
    const target = { x: 100, y: 52 };

    movementManager.moveEntityTowards(entity, target);

    assert.strictEqual(entity.x, 45);
    assert.strictEqual(entity.y, 52);
  });
});
