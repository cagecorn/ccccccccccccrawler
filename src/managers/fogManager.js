// src/fogManager.js

import { hasLineOfSight } from '../utils/geometry.js';

export const FOG_STATE = { UNSEEN: 0, SEEN: 1, VISIBLE: 2 };

export class FogManager {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // 모든 타일을 '본 적 없는' 상태로 초기화
        this.fogMap = Array.from({ length: height }, () => Array(width).fill(FOG_STATE.UNSEEN));
    }

    // 플레이어 시야에 따라 안개 업데이트 (구멍만 파기)
    update(player, mapManager) {
        // 1. 모든 '현재 보이는' 타일을 '과거에 본' 상태로 변경
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.fogMap[y][x] === FOG_STATE.VISIBLE) {
                    this.fogMap[y][x] = FOG_STATE.SEEN;
                }
            }
        }

        // 2. 플레이어 주변 시야 범위를 계산
        const centerX = Math.floor(player.x / mapManager.tileSize);
        const centerY = Math.floor(player.y / mapManager.tileSize);
        const range = Math.ceil(player.visionRange / mapManager.tileSize);

        for (let dy = -range; dy <= range; dy++) {
            for (let dx = -range; dx <= range; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;

                // 원형 범위를 적용하고 LOS 체크
                if (dx * dx + dy * dy <= range * range &&
                    hasLineOfSight(centerX, centerY, x, y, mapManager)) {
                    this.fogMap[y][x] = FOG_STATE.VISIBLE;
                }
            }
        }
    }

    // 포그 오브 워를 그리는 함수
    render(ctx, tileSize) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                switch (this.fogMap[y][x]) {
                    case FOG_STATE.UNSEEN:
                        ctx.fillStyle = 'black';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                        break;
                    case FOG_STATE.SEEN:
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                        break;
                    case FOG_STATE.VISIBLE:
                        // 아무것도 그리지 않아 아래 레이어가 그대로 보임
                        break;
                }
            }
        }
    }
}
