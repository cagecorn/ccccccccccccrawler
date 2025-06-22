// src/aquariumMap.js
// Specialized map where new features can be placed and tested
import { MapManager } from './map.js';

export class AquariumMapManager extends MapManager {
    constructor(seed) {
        super(seed);
        this.name = 'aquarium';
        // wider passages help observe pathfinding for mercenaries and monsters
        this.corridorWidth = 8;
        // regenerate with the new corridor width
        this.map = this._generateMaze();
    }

    _generateMaze() {
        // use the base maze generation but with a larger corridor width
        return super._generateMaze();
    }
}
