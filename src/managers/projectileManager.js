import { Projectile } from "../entities.js";
import { findEntitiesInRadius } from '../utils/entityUtils.js';

export class ProjectileManager {
    constructor(eventManager, assets, vfxManager = null, knockbackEngine = null) {
        this.projectiles = [];
        this.eventManager = eventManager;
        this.assets = assets;
        this.vfxManager = vfxManager;
        this.knockbackEngine = knockbackEngine;
        console.log("[ProjectileManager] Initialized");
    }

    create(caster, target, skill) {
        const keyMap = {
            fireball: 'fire-ball',
            iceball: 'ice-ball',
            arrow: 'arrow'
        };
        const imageKey = keyMap[skill.projectile] || skill.projectile;

        const isArrow = skill.projectile === 'arrow';

        const config = {
            x: caster.x + caster.width / 2,
            y: caster.y + caster.height / 2,
            target: target,
            caster: caster,
            damage: skill.damage,
            knockbackStrength: skill.knockbackStrength || skill.knockback || 0,
            image: this.assets[imageKey],
            width: isArrow ? 32 : 64,
            height: isArrow ? 32 : 64,
            blendMode: isArrow ? null : 'screen',
            enableGlow: !isArrow,
            vfxManager: this.vfxManager,
        };
        const projectile = new Projectile(config);
        this.projectiles.push(projectile);
        if (isArrow && this.vfxManager) {
            this.vfxManager.addArrowTrail(projectile);
        }
    }

    throwItem(caster, target, item) {
        const config = {
            x: caster.x + caster.width / 2,
            y: caster.y + caster.height / 2,
            target,
            caster,
            damage: 0,
            knockbackStrength: 0,
            image: item.image,
            width: item.width,
            height: item.height,
            blendMode: null,
            enableGlow: false,
            vfxManager: this.vfxManager,
        };
        const projectile = new Projectile(config);
        this.projectiles.push(projectile);
    }

    update(allEntities = []) {
        this.projectiles.forEach((proj, index) => {
            if (!proj.target || proj.target.hp <= 0 || proj.target.isDying) {
                proj.isDead = true;
                this.projectiles.splice(index, 1);
                return;
            }

            const result = proj.update();
            if (result.collided) {
                this.eventManager.publish('entity_attack', {
                    attacker: proj.caster,
                    defender: result.target,
                    damage: proj.damage,
                });

                if (this.knockbackEngine && proj.knockbackStrength > 0) {
                    this.knockbackEngine.apply(proj.caster, result.target, proj.knockbackStrength);
                    this.eventManager.publish('knockback_success', {
                        attacker: proj.caster,
                        projectile: proj
                    });
                }

                const weapon = proj.caster.equipment.weapon;
                if (weapon && weapon.weaponStats?.skills.includes('sonic_arrow')) {
                    const radius = 128;
                    const impactPos = { x: result.target.x + result.target.width/2, y: result.target.y + result.target.height/2 };

                    if (this.vfxManager) {
                        this.vfxManager.addShockwave(impactPos.x, impactPos.y, { maxRadius: radius });
                    }

                    const aoeTargets = findEntitiesInRadius(impactPos.x, impactPos.y, radius, allEntities, result.target);
                    for (const aoeTarget of aoeTargets) {
                        if (aoeTarget.isFriendly !== proj.caster.isFriendly) {
                            this.eventManager.publish('log', { message: `[음파 화살]이 ${aoeTarget.constructor.name}에게 피해를 입힙니다!`, color: '#add8e6' });
                            this.eventManager.publish('entity_attack', { attacker: proj.caster, defender: aoeTarget, damage: proj.damage * 0.5 });
                        }
                    }
                }

                this.projectiles.splice(index, 1);
            }
        });
    }

    render(ctx) {
        for (const proj of this.projectiles) {
            proj.render(ctx);
        }
    }
}
