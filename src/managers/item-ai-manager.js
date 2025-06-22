export class ItemAIManager {
    constructor(eventManager = null, projectileManager = null, vfxManager = null, effectManager = null) {
        this.eventManager = eventManager;
        this.projectileManager = projectileManager;
        this.vfxManager = vfxManager;
        this.effectManager = effectManager;
    }

    setEffectManager(effectManager) {
        this.effectManager = effectManager;
    }

    update(context) {
        const { player, mercenaryManager, monsterManager } = context;
        const entities = Array.from(new Set([
            player,
            ...(mercenaryManager?.mercenaries || []),
            ...(monsterManager?.monsters || [])
        ]));

        let allEnemies = [];
        if (context.metaAIManager) {
            allEnemies = Object.values(context.metaAIManager.groups)
                .filter(g => g.id !== player.groupId)
                .flatMap(g => g.members);
        } else if (context.enemies) {
            allEnemies = context.enemies;
        }

        for (const ent of entities) {
            const nearbyEnemies = allEnemies.filter(e => Math.hypot(e.x - ent.x, e.y - ent.y) < ent.visionRange);

            this._handleHealingItems(ent, entities);
            this._handleArtifacts(ent);

            if (nearbyEnemies.length > 0) {
                this._handleBuffItems(ent, entities);
            }
        }
    }

    _handleHealingItems(self, allEntities) {
        const inventory = self.consumables || self.inventory;
        if (!Array.isArray(inventory) || inventory.length === 0) return;

        const item = inventory.find(i => (i.tags?.includes('healing_item') || i.tags?.includes('체력 회복 아이템')) && i.type !== 'artifact');
        if (!item) return;

        const mbti = self.properties?.mbti || '';
        const range = item.range || 64;

        // MBTI 로직 추가: 'I' (내향형)은 자신만 치유합니다.
        if (mbti.includes('I')) {
            if (self.hp / self.maxHp < 0.5) {
                this._useItem(self, item, self);
            }
            return;
        }

        // MBTI 로직 추가: 'E' (외향형)은 아군을 먼저 확인합니다.
        if (mbti.includes('E')) {
            const ally = allEntities.find(e => 
                e !== self &&
                e.isFriendly === self.isFriendly &&
                e.hp > 0 &&
                e.hp / e.maxHp < 0.5 &&
                Math.hypot(e.x - self.x, e.y - self.y) <= range
            );
            if (ally) {
                this._useItem(self, item, ally);
                return;
            }
        }
        
        // 기본 행동 또는 E타입이 아군을 찾지 못했을 경우: 자신을 치유
        if (self.hp / self.maxHp < 0.5) {
            this._useItem(self, item, self);
            return;
        }

        // 기본 행동: 자신은 괜찮고, 주변에 다친 아군이 있다면 치유
        const ally = allEntities.find(e => 
            e !== self &&
            e.isFriendly === self.isFriendly &&
            e.hp > 0 &&
            e.hp / e.maxHp < 0.5 &&
            Math.hypot(e.x - self.x, e.y - self.y) <= range
        );
        if (ally) {
            this._useItem(self, item, ally);
        }
    }

    _handleArtifacts(entity) {
        const inv = entity.consumables || entity.inventory;
        if (!Array.isArray(inv)) return;
        for (const item of inv) {
            if ((item.type === 'artifact' || item.tags?.includes('artifact')) && item.cooldownRemaining <= 0) {
                if (this.vfxManager && item.image) {
                    this.vfxManager.addItemUseEffect(entity, item.image, { scale: 0.33 });
                }
                if (item.healAmount) {
                    entity.hp = Math.min(entity.maxHp, entity.hp + item.healAmount);
                }
                if (item.effectId && this.effectManager) {
                    this.effectManager.addEffect(entity, item.effectId);
                }
                if (this.eventManager) {
                    this.eventManager.publish('log', { message: `${entity.constructor.name} activates ${item.name}` });
                }
                item.cooldownRemaining = item.cooldown || 60;
                break;
            }
        }
    }

    _handleBuffItems(self, allEntities) {
        const inventory = self.consumables || self.inventory;
        if (!Array.isArray(inventory) || inventory.length === 0) return;

        const item = inventory.find(i => i.tags?.includes('buff_item'));
        if (!item || !item.effectId) return;

        const mbti = self.properties?.mbti || '';

        if (mbti.includes('I')) {
            if (!self.effects.some(e => e.id === item.effectId)) {
                this._useItem(self, item, self);
            }
            return;
        }

        if (mbti.includes('E')) {
            const allyToBuff = allEntities.find(e =>
                e !== self &&
                e.isFriendly === self.isFriendly &&
                !e.effects.some(eff => eff.id === item.effectId)
            );
            if (allyToBuff) {
                this._useItem(self, item, allyToBuff);
                return;
            }
        }

        if (!self.effects.some(e => e.id === item.effectId)) {
            this._useItem(self, item, self);
        }
    }

    _useItem(user, item, target) {
        if (!item || (item.quantity && item.quantity <= 0)) return;

        if (item.healAmount) {
            const heal = item.healAmount;
            target.hp = Math.min(target.maxHp, target.hp + heal);
        }

        if (item.effectId && this.effectManager) {
            this.effectManager.addEffect(target, item.effectId);
        }

        if (this.vfxManager) {
            const scale = (item.type === 'artifact' || item.tags?.includes('artifact')) ? 0.33 : 1;
            this.vfxManager.addItemUseEffect(target, item.image, { scale });
        }

        if (this.projectileManager && user !== target) {
            this.projectileManager.throwItem(user, target, item);
        }

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            const inv = user.consumables || user.inventory;
            const idx = inv.indexOf(item);
            if (idx >= 0) inv.splice(idx, 1);
        }

        if (this.eventManager) {
            this.eventManager.publish('log', { message: `${user.constructor.name} uses ${item.name}` });
        }
    }
}
