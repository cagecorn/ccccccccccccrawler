// src/narrativeManager.js
// 게임의 서사, 스토리라인, 도감 등을 관리할 매니저 (구멍만 파기)
export class NarrativeManager {
    constructor() {
        this.storyFlags = {};
        this.monsterCodex = new Set();
    }
    setFlag(key, value) {
        this.storyFlags[key] = value;
    }
    getFlag(key) {
        return this.storyFlags[key];
    }
}
