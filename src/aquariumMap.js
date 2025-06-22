// src/aquariumMap.js
// Specialized map where new features can be placed and tested
import { MapManager } from './map.js';

export class AquariumMapManager extends MapManager {
    constructor(seed) {
        super(seed);
        this.name = 'aquarium';
        // narrower corridors make the aquarium feel more like a maze
        this.corridorWidth = 5;
        // regenerate with the new corridor width
        this.map = this._generateMaze();
    }

    _generateMaze() {
        // use the base maze generation but with a larger corridor width
        return super._generateMaze();
    }

    // keep more dead ends so walls are prominent
    _removeDeadEnds(map, chance) {
        return super._removeDeadEnds(map, 0.05);
    }
}
