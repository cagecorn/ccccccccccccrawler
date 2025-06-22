// src/map.js

const TILE_TYPES = {
    FLOOR: 0,
    WALL: 1,
    LAVA: 2,
};

export class MapManager {
    constructor(seed = Math.floor(Math.random() * 2 ** 32)) {
        this._seed = seed >>> 0;
        this.width = 81;
        this.height = 61;
        this.tileSize = 192;
        this.tileTypes = TILE_TYPES;
        this.rooms = [];
        this.corridorWidth = 5; // 전역적으로 사용할 통로 너비
        this.map = this._generateMaze();
    }

    _random() {
        const a = 1664525;
        const c = 1013904223;
        this._seed = (a * this._seed + c) >>> 0;
        return this._seed / 2 ** 32;
    }

    _generateMaze() {
        // 전체 맵을 벽으로 초기화
        const map = Array.from({ length: this.height }, () => Array(this.width).fill(this.tileTypes.WALL));

        // 1. 방 생성 (기존과 동일)
        this._generateRooms(map);

        // 2. 넓은 통로로 미로 생성 (새로운 방식)
        this._generateWideMaze(map);

        // 3. 방과 미로 연결
        this._connectRoomsAndMazes(map);

        // 4. 막다른 길 일부 제거 (선택사항)
        this._removeDeadEnds(map, 0.2);

        // 5. 특수 지형 배치 (용암 등)
        this._addLavaPools(map, 0.02);

        return map;
    }

    _generateRooms(map) {
        const roomCount = 8;
        const minRoomSize = 3;
        const maxRoomSize = 7;
        
        for (let i = 0; i < roomCount; i++) {
            const roomW = Math.floor(this._random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            const roomH = Math.floor(this._random() * (maxRoomSize - minRoomSize + 1)) + minRoomSize;
            const roomX = Math.floor(this._random() * (this.width - roomW - 2)) + 1;
            const roomY = Math.floor(this._random() * (this.height - roomH - 2)) + 1;

            // 겹침 체크
            const overlaps = this.rooms.some(room =>
                roomX < room.x + room.width + this.corridorWidth && 
                roomX + roomW + this.corridorWidth > room.x &&
                roomY < room.y + room.height + this.corridorWidth && 
                roomY + roomH + this.corridorWidth > room.y
            );
            if (overlaps) continue;

            // 방 생성
            for (let y = roomY; y < roomY + roomH; y++) {
                for (let x = roomX; x < roomX + roomW; x++) {
                    map[y][x] = this.tileTypes.FLOOR;
                }
            }
            this.rooms.push({ x: roomX, y: roomY, width: roomW, height: roomH });
        }
    }

    _generateWideMaze(map) {
        // 넓은 통로를 위한 그리드 시스템
        // corridorWidth + 1 간격으로 점을 배치하여 넓은 통로 확보
        const step = this.corridorWidth + 1;
        const mazePoints = [];

        // 미로 시작점들을 수집 (방과 겹치지 않는 위치)
        for (let y = step; y < this.height - step; y += step) {
            for (let x = step; x < this.width - step; x += step) {
                if (!this._isInRoom(x, y)) {
                    mazePoints.push({ x, y });
                }
            }
        }

        // 각 점에서 넓은 미로 생성
        for (const point of mazePoints) {
            if (this._isAreaWall(map, point.x, point.y, this.corridorWidth)) {
                this._carveWideMazeFrom(point.x, point.y, map);
            }
        }
    }

    _carveWideMazeFrom(startX, startY, map) {
        const stack = [{ x: startX, y: startY }];
        const step = this.corridorWidth + 1;
        
        // 시작점을 넓은 통로로 뚫기
        this._carveWideArea(map, startX, startY, this.corridorWidth);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            
            // 4방향으로 이동 (넓은 통로 간격으로)
            const directions = [
                { x: 0, y: -step }, 
                { x: 0, y: step }, 
                { x: -step, y: 0 }, 
                { x: step, y: 0 }
            ];
            directions.sort(() => this._random() - 0.5);

            let moved = false;
            for (const dir of directions) {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;
                
                // 경계 체크 및 벽 여부 확인
                if (this._isValidMazePosition(nx, ny) && 
                    this._isAreaWall(map, nx, ny, this.corridorWidth)) {
                    
                    // 현재 위치에서 다음 위치까지 넓은 통로로 연결
                    this._carveWideCorridor(map, current.x, current.y, nx, ny, this.corridorWidth);
                    
                    // 다음 위치도 넓은 영역으로 뚫기
                    this._carveWideArea(map, nx, ny, this.corridorWidth);
                    
                    stack.push({ x: nx, y: ny });
                    moved = true;
                    break;
                }
            }
            
            if (!moved) {
                stack.pop();
            }
        }
    }

    _carveWideArea(map, centerX, centerY, width) {
        const halfWidth = Math.floor(width / 2);
        
        for (let y = centerY - halfWidth; y <= centerY + halfWidth; y++) {
            for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    map[y][x] = this.tileTypes.FLOOR;
                }
            }
        }
    }

    _carveWideCorridor(map, x1, y1, x2, y2, width) {
        const halfWidth = Math.floor(width / 2);
        
        // 수직 통로
        if (x1 === x2) {
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            for (let y = minY; y <= maxY; y++) {
                for (let x = x1 - halfWidth; x <= x1 + halfWidth; x++) {
                    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                        map[y][x] = this.tileTypes.FLOOR;
                    }
                }
            }
        }
        // 수평 통로
        else if (y1 === y2) {
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            
            for (let x = minX; x <= maxX; x++) {
                for (let y = y1 - halfWidth; y <= y1 + halfWidth; y++) {
                    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                        map[y][x] = this.tileTypes.FLOOR;
                    }
                }
            }
        }
    }

    _isValidMazePosition(x, y) {
        const margin = Math.ceil(this.corridorWidth / 2);
        return x >= margin && x < this.width - margin && 
               y >= margin && y < this.height - margin;
    }

    _isAreaWall(map, centerX, centerY, size) {
        const halfSize = Math.floor(size / 2);
        
        for (let y = centerY - halfSize; y <= centerY + halfSize; y++) {
            for (let x = centerX - halfSize; x <= centerX + halfSize; x++) {
                if (y >= 0 && y < this.height && x >= 0 && x < this.width) {
                    if (map[y][x] === this.tileTypes.FLOOR) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    _isInRoom(x, y) {
        const buffer = Math.ceil(this.corridorWidth / 2);
        return this.rooms.some(room => 
            x >= room.x - buffer && x < room.x + room.width + buffer &&
            y >= room.y - buffer && y < room.y + room.height + buffer
        );
    }

    _connectRoomsAndMazes(map) {
        // 각 방을 가장 가까운 통로나 다른 방과 연결
        for (const room of this.rooms) {
            const roomCenterX = Math.floor(room.x + room.width / 2);
            const roomCenterY = Math.floor(room.y + room.height / 2);
            
            // 방에서 가장 가까운 통로 찾기
            const nearestFloor = this._findNearestFloor(map, roomCenterX, roomCenterY, room);
            
            if (nearestFloor) {
                // L자 형태로 넓은 통로 연결
                this._carveWideCorridor(map, roomCenterX, roomCenterY, nearestFloor.x, roomCenterY, this.corridorWidth);
                this._carveWideCorridor(map, nearestFloor.x, roomCenterY, nearestFloor.x, nearestFloor.y, this.corridorWidth);
            }
        }
    }

    _findNearestFloor(map, startX, startY, excludeRoom) {
        let nearestFloor = null;
        let minDistance = Infinity;
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (map[y][x] === this.tileTypes.FLOOR) {
                    // 현재 방 영역은 제외
                    if (x >= excludeRoom.x && x < excludeRoom.x + excludeRoom.width &&
                        y >= excludeRoom.y && y < excludeRoom.y + excludeRoom.height) {
                        continue;
                    }
                    
                    const distance = Math.abs(x - startX) + Math.abs(y - startY);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestFloor = { x, y };
                    }
                }
            }
        }
        
        return nearestFloor;
    }

    _removeDeadEnds(map, chance) {
        // 기존 코드와 동일하지만, 넓은 통로를 고려하여 수정
        for (let y = this.corridorWidth; y < this.height - this.corridorWidth; y++) {
            for (let x = this.corridorWidth; x < this.width - this.corridorWidth; x++) {
                if (map[y][x] === this.tileTypes.FLOOR) {
                    let openDirections = 0;
                    const directions = [{x:0,y:-1}, {x:0,y:1}, {x:-1,y:0}, {x:1,y:0}];
                    
                    for (const dir of directions) {
                        if (map[y + dir.y][x + dir.x] === this.tileTypes.FLOOR) {
                            openDirections++;
                        }
                    }
                    
                    // 막다른 길인 경우 (1개 방향으로만 열림)
                    if (openDirections === 1 && this._random() < chance) {
                        const availableDirections = directions.filter(dir => 
                            map[y + dir.y] && map[y + dir.y][x + dir.x] === this.tileTypes.WALL
                        );
                        
                        if (availableDirections.length > 0) {
                            const randomDir = availableDirections[Math.floor(this._random() * availableDirections.length)];
                            this._carveWideCorridor(map, x, y, x + randomDir.x * this.corridorWidth, y + randomDir.y * this.corridorWidth, this.corridorWidth);
                        }
                    }
                }
            }
        }
    }

    _addLavaPools(map, chance = 0.02, size = 3) {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (map[y][x] === this.tileTypes.FLOOR && this._random() < chance) {
                    for (let py = y; py < y + size && py < this.height - 1; py++) {
                        for (let px = x; px < x + size && px < this.width - 1; px++) {
                            if (map[py][px] === this.tileTypes.FLOOR) {
                                map[py][px] = this.tileTypes.LAVA;
                            }
                        }
                    }
                }
            }
        }
    }

    countTiles(type) {
        let count = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.map[y][x] === type) count++;
            }
        }
        return count;
    }

    // 나머지 메서드들은 기존과 동일
    getRandomFloorPosition(sizeInTiles = {w: 1, h: 1}) {
        let attempts = 0;
        while (attempts < 50) {
            const x = Math.floor(this._random() * (this.width - sizeInTiles.w));
            const y = Math.floor(this._random() * (this.height - sizeInTiles.h));
            let canPlace = true;
            for (let i = 0; i < sizeInTiles.w; i++) {
                for (let j = 0; j < sizeInTiles.h; j++) {
                    if (this.map[y + j][x + i] !== this.tileTypes.FLOOR) {
                        canPlace = false;
                        break;
                    }
                }
                if (!canPlace) break;
            }
            if (canPlace) {
                return {
                    x: x * this.tileSize,
                    y: y * this.tileSize
                };
            }
            attempts++;
        }
        return null;
    }

    isWallAt(worldX, worldY, entityWidth = 0, entityHeight = 0) {
        const checkPoints = [
            {x: worldX, y: worldY}, {x: worldX + entityWidth, y: worldY},
            {x: worldX, y: worldY + entityHeight}, {x: worldX + entityWidth, y: worldY + entityHeight},
        ];
        for (const point of checkPoints) {
            const mapX = Math.floor(point.x / this.tileSize);
            const mapY = Math.floor(point.y / this.tileSize);
            if (mapX < 0 || mapX >= this.width || mapY < 0 || mapY >= this.height) return true;
            if (this.map[mapY][mapX] === this.tileTypes.WALL) return true;
        }
        return false;
    }

    render(ctxBase, ctxDecor, assets) {
        const wallImage = assets.wall;
        const floorImage = assets.floor;
        const lavaImage = assets.lava || floorImage;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let imageToDraw = floorImage;
                if (this.map[y][x] === this.tileTypes.WALL) {
                    imageToDraw = wallImage;
                } else if (this.map[y][x] === this.tileTypes.LAVA) {
                    imageToDraw = lavaImage;
                }
                if (imageToDraw) {
                    ctxBase.drawImage(imageToDraw, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }
}
