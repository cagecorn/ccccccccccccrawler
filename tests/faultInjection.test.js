import * as AI from '../src/ai.js';
import { CharacterFactory } from '../src/factory.js';
import { describe, test, assert } from './helpers.js';

class FaultyFactory extends CharacterFactory {
    _rollMBTI() {
        return '????';
    }
}

const mapStub = { tileSize: 1, isWallAt: () => false };

describe('Fault Injection', () => {

    test('HealerAI handles invalid mbti string', () => {
        const ai = new AI.HealerAI();
        const self = {
            x: 0, y: 0, visionRange: 100, attackRange: 10, speed: 5, tileSize: 1,
            mp: 20, skills: ['heal'], skillCooldowns: {}, properties: { mbti: '????' }
        };
        const ally = { x: 5, y: 0, hp: 5, maxHp: 10 };
        const context = { player: {}, allies: [self, ally], enemies: [], mapManager: mapStub };
        const action = ai.decideAction(self, context);
        assert.ok(action && action.type);
    });

    test('HealerAI handles missing heal skill gracefully', () => {
        const ai = new AI.HealerAI();
        const self = {
            x: 0, y: 0, visionRange: 100, attackRange: 10, speed: 5, tileSize: 1,
            mp: 0, skills: [], skillCooldowns: {}, properties: { mbti: 'ENFP' }
        };
        const ally = { x: 5, y: 0, hp: 5, maxHp: 10 };
        const context = { player: {}, allies: [self, ally], enemies: [], mapManager: mapStub };
        const action = ai.decideAction(self, context);
        assert.ok(action && action.type);
    });

    test('Factory with corrupted MBTI still creates character', () => {
        const factory = new FaultyFactory({});
        const merc = factory.create('mercenary', { x:0, y:0, tileSize:1, groupId:'player_party' });
        assert.ok(merc && merc.properties.mbti === '????');
    });

    if (AI.BufferAI) {
        test('BufferAI exists and handles missing buff skill', () => {
            const ai = new AI.BufferAI();
            const self = { x:0, y:0, visionRange:50, attackRange:10, speed:5, tileSize:1,
                mp:0, skills:[], skillCooldowns:{}, properties:{} };
            const ally = { x:5, y:0, hp:10, maxHp:10 };
            const context = { player:{}, allies:[self, ally], enemies:[], mapManager: mapStub };
            const action = ai.decideAction(self, context);
            assert.ok(action && action.type);
        });
    }

    if (AI.DebufferAI) {
        test('DebufferAI exists and handles missing debuff skill', () => {
            const ai = new AI.DebufferAI();
            const self = { x:0, y:0, visionRange:50, attackRange:10, speed:5, tileSize:1,
                mp:0, skills:[], skillCooldowns:{}, properties:{} };
            const enemy = { x:5, y:0, hp:10, maxHp:10 };
            const context = { player:{}, allies:[self], enemies:[enemy], mapManager: mapStub };
            const action = ai.decideAction(self, context);
            assert.ok(action && action.type);
        });
    }

});
