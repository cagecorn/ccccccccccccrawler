import { PETS } from '../data/pets.js';

export class PetManager {
    constructor(eventManager = null, factory = null, metaAI = null, auraManager = null, vfxManager = null) {
        this.eventManager = eventManager;
        this.factory = factory;
        this.metaAI = metaAI;
        this.auraManager = auraManager;
        this.vfxManager = vfxManager;
        this.pets = [];
        if (this.eventManager) {
            this.eventManager.subscribe('entity_death', ({ victim }) => {
                const idx = this.pets.indexOf(victim);
                if (idx !== -1) {
                    const pet = this.pets[idx];
                    this.pets.splice(idx, 1);
                    if (pet.linkItem) {
                        pet.linkItem.cooldownRemaining = pet.linkItem.cooldown || 600;
                        delete pet.linkItem.petInstance;
                    }
                    if (this.auraManager) {
                        this.auraManager.unregisterAura(pet);
                    }
                }
            });
            this.eventManager.subscribe('entity_removed', ({ victimId }) => {
                this.pets = this.pets.filter(p => p.id !== victimId);
            });
        }
    }

    equip(owner, item, petId = 'fox') {
        if (!this.factory || item.cooldownRemaining > 0) return null;
        const pet = this.factory.create('pet', {
            petId,
            owner,
            x: owner.x,
            y: owner.y,
            tileSize: owner.tileSize,
            groupId: owner.groupId,
        });
        pet.linkItem = item;
        if (!owner.pets) owner.pets = [];
        owner.pets.push(pet);
        this.pets.push(pet);
        if (this.metaAI?.groups[owner.groupId]) {
            this.metaAI.groups[owner.groupId].addMember(pet);
        }
        item.petInstance = pet;
        if (this.auraManager) {
            const petData = PETS[petId] || PETS.fox;
            const aura = item.aura || (petData.auraSkill ? { skillId: petData.auraSkill, range: 256, level: 1 } : null);
            if (aura) {
                this.auraManager.registerAura(pet, aura);
            }
        }
        return pet;
    }

    combinePets(entity, baseId) {
        const matches = entity.consumables?.filter(i => i.baseId === baseId) || [];
        if (matches.length < 3) return false;
        const target = matches[0];
        target.rank = (target.rank || 1) + 1;
        entity.consumables.splice(entity.consumables.indexOf(matches[1]), 1);
        entity.consumables.splice(entity.consumables.indexOf(matches[2]), 1);
        return true;
    }

    feedPet(pet, item) {
        if (!item.tags?.includes('pet_food')) return false;
        pet.stats.addExp(5);
        if (pet.stats.get('exp') >= pet.stats.get('expNeeded')) {
            pet.stats.levelUp();
        }
        return true;
    }

    update() {
        for (const pet of this.pets) {
            if (typeof pet.update === 'function') pet.update();
        }
    }

    render(ctx) {
        for (const pet of this.pets) {
            if (typeof pet.render === 'function') pet.render(ctx);
        }
    }
}
