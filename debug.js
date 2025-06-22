import { MapManager } from './src/map.js';

const canvas = document.getElementById('debug-canvas');
const ctx = canvas.getContext('2d');
const generateBtn = document.getElementById('generate-btn');

function drawMap() {
    const mapManager = new MapManager();
    const map = mapManager.map;
    const tileSize = 10; // 디버그 캔버스에서는 타일을 작게 그림

    canvas.width = mapManager.width * tileSize;
    canvas.height = mapManager.height * tileSize;

    for (let y = 0; y < mapManager.height; y++) {
        for (let x = 0; x < mapManager.width; x++) {
            ctx.fillStyle = (map[y][x] === mapManager.tileTypes.WALL) ? '#555' : 'white';
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

generateBtn.onclick = drawMap;
drawMap(); // 페이지 로드 시 첫 맵 생성
