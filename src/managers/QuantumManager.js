import { QuantumEngine } from '../systems/QuantumEngine.js';

export class QuantumManager {
    constructor(factory, monsterManager, metaAIManager, equipmentManager = null, parasiteManager = null, traitManager = null, mapManager = null) {
        this.potentialMonsters = [];
        this.engine = new QuantumEngine(
            factory,
            monsterManager,
            metaAIManager,
            equipmentManager,
            parasiteManager,
            traitManager,
            mapManager
        );
        this.mapManager = mapManager;
        console.log('[QuantumManager] Initialized with internal QuantumEngine.');
    }

    /**
     * 잠재적 몬스터 정보를 등록합니다.
     * @param {object} monsterData
     */
    registerPotentialMonster(monsterData) {
        this.potentialMonsters.push(monsterData);
    }

    /**
     * 매 프레임 호출될 업데이트 함수. 활성화 처리를 엔진에 위임합니다.
     * @param {object} fogManager
     */
    update(fogManager) {
        if (this.potentialMonsters.length === 0) return;

        const result = this.engine.processActivations(this.potentialMonsters, fogManager);

        if (result.activatedIndexes.length > 0) {
            for (let i = result.activatedIndexes.length - 1; i >= 0; i--) {
                const indexToRemove = result.activatedIndexes[i];
                this.potentialMonsters.splice(indexToRemove, 1);
            }
            console.log(`[QuantumManager] Activated ${result.newlyActivated.length} monsters via engine.`);
        }
    }
}
