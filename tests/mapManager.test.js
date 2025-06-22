import { MapManager } from '../src/map.js';
import { describe, test, assert } from './helpers.js';

describe('Managers', () => {
  test('맵 연결성 테스트', () => {
    const mapManager = new MapManager(12345);
    const { width, height, tileTypes, map } = mapManager;

    let startNode = null;
    let floorCount = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (map[y][x] !== tileTypes.WALL) {
          if (!startNode) startNode = { x, y };
          floorCount++;
        }
      }
    }

    assert.ok(startNode, '맵에 시작 지점을 찾을 수 없습니다.');

    const visited = new Set();
    const queue = [startNode];
    visited.add(`${startNode.x},${startNode.y}`);
    let connectedCount = 0;

    while (queue.length > 0) {
      const current = queue.shift();
      connectedCount++;
      const { x, y } = current;
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ];
      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (map[n.y] && map[n.y][n.x] !== tileTypes.WALL && !visited.has(key)) {
          visited.add(key);
          queue.push(n);
        }
      }
    }

    assert.strictEqual(connectedCount, floorCount, '맵이 고립된 공간을 포함합니다.');
  });

  test('용암 타일 생성 확인', () => {
    const mapManager = new MapManager(12345);
    const { tileTypes } = mapManager;
    const lavaCount = mapManager.countTiles(tileTypes.LAVA);
    assert.ok(lavaCount > 0, '용암 타일이 생성되지 않았습니다.');
  });
});
