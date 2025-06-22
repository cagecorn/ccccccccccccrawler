import { ParticleEngine } from './vfx/ParticleEngine.js';
import { TextPopupEngine } from './vfx/TextPopupEngine.js';

export class VFXManager {
    constructor(eventManager = null, itemManager = null) {
        this.effects = [];

        this.particleEngine = new ParticleEngine();
        this.textPopupEngine = new TextPopupEngine();

        this.emitters = this.particleEngine.emitters;
        this.particles = this.particleEngine.particles;
        this.eventManager = eventManager;
        this.itemManager = itemManager;
        this.knockbackEffectDuration = 15;
        console.log("[VFXManager] Initialized with Internal Engines");
    }

    /**
     * 대상을 끌어당기는 애니메이션과 잔상 효과를 추가합니다.
     * @param {Entity} targetEntity - 끌려갈 유닛
     * @param {{x, y}} fromPos - 시작 위치
     * @param {{x, y}} toPos - 종료 위치
     * @param {number} [duration=15] - 애니메이션 지속 시간 (프레임)
     */
    addPullAnimation(targetEntity, fromPos, toPos, duration = 15) {
        const effect = {
            type: 'pull_animation',
            targetEntity,
            fromPos,
            toPos,
            duration,
            life: duration,
        };
        this.effects.push(effect);
    }

    /**
     * 대상을 뒤로 밀어내는 넉백 애니메이션을 추가합니다.
     * @param {Entity} targetEntity - 밀려날 유닛
     * @param {{x:number, y:number}} fromPos - 시작 위치
     * @param {{x:number, y:number}} toPos - 도착 위치
     * @param {number} [duration=15] - 애니메이션 지속 시간 (프레임)
     */
    addKnockbackAnimation(targetEntity, fromPos, toPos, duration = 15) {
        const effect = {
            type: 'knockback_animation',
            targetEntity,
            fromPos,
            toPos,
            duration,
            life: duration,
        };
        this.effects.push(effect);
    }

    /**
     * 화면에 퍼져나가는 충격파 효과를 추가합니다.
     * @param {number} x 중심 x
     * @param {number} y 중심 y
     * @param {object} [options]
     */
    addShockwave(x, y, options = {}) {
        const effect = {
            type: 'shockwave',
            x,
            y,
            radius: 0,
            maxRadius: options.maxRadius || 128,
            life: options.duration || 30,
            duration: options.duration || 30,
            color: options.color || 'rgba(200, 200, 255, 0.7)',
            lineWidth: options.lineWidth || 3,
        };
        this.effects.push(effect);
    }

    /**
     * 유닛이 사라지고 나타나는 순간이동 효과를 연출합니다.
     * @param {Entity} entity 대상 유닛
     * @param {{x, y}} fromPos 시작 위치
     * @param {{x, y}} toPos 종료 위치
     * @param {function} onComplete 애니메이션 종료 후 실행될 콜백
     */
    addTeleportEffect(entity, fromPos, toPos, onComplete) {
        this.addParticleBurst(fromPos.x + entity.width / 2, fromPos.y + entity.height / 2, {
            count: 20,
            color: '#aaa',
            speed: 3,
        });
        entity.isHidden = true;

        setTimeout(() => {
            entity.x = toPos.x;
            entity.y = toPos.y;
            entity.isHidden = false;
            this.addParticleBurst(toPos.x + entity.width / 2, toPos.y + entity.height / 2, {
                count: 20,
                color: 'white',
                speed: 2,
            });
            if (onComplete) onComplete();
        }, 150);
    }

    /**
     * 화살이 날아갈 때 그 궤적을 선으로 그려주는 효과를 추가한다.
     * @param {object} projectile Projectile instance
     * @param {object} [options]
     */
    addArrowTrail(projectile, options = {}) {
        const duration = options.duration || 60;
        const effect = {
            type: 'arrow_trail',
            projectile,
            duration,
            life: duration,
        };
        this.effects.push(effect);
    }

    /**
     * 간단한 빛나는 파티클을 추가합니다.
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     */
    addGlow(x, y, options = {}) {
        const effect = {
            type: 'glow',
            x,
            y,
            radius: options.radius || 20,
            alpha: options.alpha || 1.0,
            decay: options.decay || 0.05,
            colorInner: options.colorInner || 'rgba(255, 200, 100, ALPHA)',
            colorOuter: options.colorOuter || 'rgba(255, 100, 0, 0)',
            blendMode: 'lighter',
        };
        this.effects.push(effect);
    }

    /**
     * 작은 사각형 파티클 여러 개를 한 번에 생성합니다.
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     */
    addParticleBurst(x, y, options = {}) {
        this.particleEngine.addParticleBurst(x, y, options);
    }

    /**
     * 지속적으로 파티클을 생성하는 이미터를 추가합니다.
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     * @returns {object} emitter handle
     */
    addEmitter(x, y, options = {}) {
        return this.particleEngine.addEmitter(x, y, options);
    }

    /**
     * 이동체의 위치를 따라가는 궤적 이미터를 생성합니다.
     * @param {object} target Entity or object with x,y properties
     * @param {object} [options]
     */
    createTrail(target, options = {}) {
        return this.particleEngine.createTrail(target, options);
    }

    /**
     * 목표 지점을 향해 수집되는 파티클들을 생성합니다.
     * @param {number} x
     * @param {number} y
     * @param {object} target Object with x,y
     * @param {object} [options]
     */
    addHomingBurst(x, y, target, options = {}) {
        this.particleEngine.addHomingBurst(x, y, target, options);
    }

    createDashTrail(fromX, fromY, toX, toY, options = {}) {
        this.particleEngine.createDashTrail(fromX, fromY, toX, toY, options);
    }

    createWhipTrail(fromX, fromY, toX, toY) {
        this.particleEngine.createWhipTrail(fromX, fromY, toX, toY);
    }

    /**
     * 아이템이 시체 위치에서 포물선을 그리며 튀어나오는 애니메이션을 추가합니다.
     * 애니메이션이 종료되면 ItemManager에 아이템을 정식으로 추가합니다.
     * @param {object} item - 드롭될 아이템 객체
     * @param {{x:number,y:number}} startPos - 시작 위치
     * @param {{x:number,y:number}} endPos - 최종 위치
     */
    addItemPopAnimation(item, startPos, endPos) {
        const effect = {
            type: 'item_pop',
            item,
            startPos,
            endPos,
            duration: 20,
            life: 20,
            popHeight: 48,
        };
        this.effects.push(effect);
    }

    /**
     * 아이템이 튕겨나가는 애니메이션을 추가합니다.
     * @param {Item} item - 튕겨나갈 아이템 객체
     * @param {{x, y}} startPos - 시작 위치
     * @param {number} angle - 튕겨나갈 각도 (라디안)
     * @param {number} distance - 튕겨나갈 거리
     */
    addEjectAnimation(item, startPos, angle, distance) {
        const effect = {
            type: 'eject_item',
            item,
            image: item.image,
            startPos: { ...startPos },
            duration: 20,
            life: 20,
            angle,
            distance,
            height: 48,
        };
        this.effects.push(effect);
    }

    /**
     * 소모품 사용 시 해당 아이콘이 머리 위에 나타났다 사라지는 효과를 추가합니다.
     * @param {object} entity - 아이템을 사용한 유닛
     * @param {HTMLImageElement} image - 아이템 이미지
     */
    addItemUseEffect(entity, image, options = {}) {
        if (!image || !entity) return;
        const scale = options.scale || 1;
        const startScale = (options.startScale ?? 0.5) * scale;
        const endScale = (options.endScale ?? 1.5) * scale;
        const effect = {
            type: 'item_use',
            image,
            x: entity.x + entity.width / 2,
            y: entity.y - entity.height * 0.5,
            duration: options.duration || 30,
            life: options.duration || 30,
            startScale,
            endScale,
            scale: startScale,
            alpha: 1.0,
        };
        this.effects.push(effect);
    }

    /**
     * 방어구가 깨지는 애니메이션을 추가합니다.
     * @param {Item} armor - 파괴될 방어구 객체
     * @param {{x, y, width, height}} targetRect - 효과가 표시될 위치와 크기
     */
    addArmorBreakAnimation(armor, targetRect) {
        if (!armor || !armor.image) return;
        const effect = {
            type: 'armor_break',
            image: armor.image,
            rect: targetRect,
            duration: 30,
            life: 30,
        };
        this.effects.push(effect);
    }

    /**
     * 간단한 텍스트 팝업 효과를 추가합니다.
     * 지정된 텍스트가 잠시 떠올랐다가 사라집니다.
     * @param {string} text
     * @param {object} target Entity or object with x,y,width,height
     * @param {object} [options]
     */
    addTextPopup(text, target, options = {}) {
        this.textPopupEngine.add(text, target, options);
    }

    /**
     * 시전 이펙트: 지정 유닛 주변에서 파티클이 모여드는 애니메이션을 생성합니다.
     * 시전 속도가 빠를수록 파티클이 더 빠르게 모여듭니다.
     * 색상은 스킬 태그에 따라 달라집니다.
     * @param {object} caster Entity casting the skill
     * @param {object} skill Skill data object
     */
    castEffect(caster, skill) {
        const centerX = caster.x + caster.width / 2;
        const centerY = caster.y + caster.height / 2;
        let color = 'white';
        if (skill && Array.isArray(skill.tags)) {
            if (skill.tags.includes('fire')) color = 'orange';
            else if (skill.tags.includes('ice')) color = 'cyan';
            else if (skill.tags.includes('holy')) color = 'yellow';
        }
        const radius = Math.max(caster.width, caster.height);
        const strength = 0.03 * (caster.stats.get('castingSpeed') || 1);
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const sx = centerX + Math.cos(angle) * radius;
            const sy = centerY + Math.sin(angle) * radius;
            this.addHomingBurst(sx, sy, caster, {
                count: 6,
                color,
                particleOptions: { homingStrength: strength, gravity: 0 }
            });
        }
    }

    /**
     * 몬스터가 죽는 애니메이션을 추가한다.
     * 애니메이션이 끝나면 entity_removed 이벤트를 발행한다.
     * @param {object} entity - 사망한 엔티티
     * @param {string} [type] - explode 또는 fade
     */
    addDeathAnimation(entity, type = 'explode') {
        const effect = {
            type: 'death_animation',
            entity,
            animationType: type,
            duration: 30,
            life: 30,
        };

        if (type === 'explode') {
            this.addParticleBurst(
                entity.x + entity.width / 2,
                entity.y + entity.height / 2,
                { color: 'white', count: 30, speed: 5 }
            );
        }

        this.effects.push(effect);
    }

    /**
     * 지정한 이미터를 제거합니다.
     * @param {object} emitter
     */
    removeEmitter(emitter) {
        this.particleEngine.removeEmitter(emitter);
    }

    /**
     * 이미지 스프라이트 이펙트를 추가합니다.
     * 대상 위치에 밝게 표시되며 일정 시간 후 사라집니다.
     * @param {HTMLImageElement} image
     * @param {number} x
     * @param {number} y
     * @param {object} [options]
     */
    addSpriteEffect(image, x, y, options = {}) {
        const effect = {
            type: 'sprite',
            image,
            x,
            y,
            width: options.width || image.width,
            height: options.height || image.height,
            duration: options.duration || 20,
            alpha: options.alpha || 1.0,
            fade: options.fade || 0.05,
            blendMode: options.blendMode || 'lighter',
        };
        this.effects.push(effect);
    }

    /**
     * 대상 엔티티 이미지를 잠깐 색상으로 덮어씌워 번쩍이는 효과를 줍니다.
     * @param {object} entity - Entity instance (player, monster 등)
     * @param {object} [options]
     */
    flashEntity(entity, options = {}) {
        const effect = {
            type: 'flash',
            entity,
            duration: options.duration || 6,
            color: options.color || 'rgba(255,0,0,0.5)'
        };
        this.effects.push(effect);
    }

    /**
     * Knockback visual effect triggered directly by the engine.
     * @param {number} x
     * @param {number} y
     */
    addKnockbackVisual(x, y) {
        this.addParticleBurst(x, y, {
            count: 5,
            color: 'rgba(255, 255, 255, 0.7)',
            speed: 3,
            lifespan: 20
        });
    }

    addKnockbackEffect(attacker, weapon) {
        if (!attacker || !weapon || !weapon.image) return;
        const effect = {
            type: 'knockback_shine',
            entity: attacker,
            image: weapon.image,
            duration: this.knockbackEffectDuration,
            life: this.knockbackEffectDuration
        };
        this.effects.push(effect);
    }

    update() {
        this.particleEngine.update();
        this.textPopupEngine.update();

        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];

            if (effect.type === 'shockwave') {
                effect.life--;
                const progress = 1 - effect.life / effect.duration;
                effect.radius = effect.maxRadius * progress;
                if (effect.life <= 0) {
                    this.effects.splice(i, 1);
                }
                continue;
            }

            if (effect.type === 'death_animation') {
                effect.life--;
                if (effect.life <= 0) {
                    if (this.eventManager) {
                        this.eventManager.publish('entity_removed', { victimId: effect.entity.id });
                    }
                    this.effects.splice(i, 1);
                }
                continue;
            }

            if (effect.type === 'item_pop') {
                effect.life--;
                if (effect.life <= 0) {
                    if (this.itemManager && effect.item) {
                        effect.item.x = effect.endPos.x;
                        effect.item.y = effect.endPos.y;
                        this.itemManager.addItem(effect.item);
                    }
                    this.effects.splice(i, 1);
                }
                continue;
            }

            if (effect.type === 'eject_item') {
                effect.life--;
                if (effect.life <= 0) {
                    if (this.itemManager && effect.item) {
                        const endX = effect.startPos.x + Math.cos(effect.angle) * effect.distance;
                        const endY = effect.startPos.y + Math.sin(effect.angle) * effect.distance;
                        effect.item.x = endX;
                        effect.item.y = endY;
                        this.itemManager.addItem(effect.item);
                    }
                    this.effects.splice(i, 1);
                }
                continue;
            }

            // 끌어당기기 애니메이션 처리
            if (effect.type === 'pull_animation') {
                effect.life--;
                const progress = 1 - effect.life / effect.duration;
                const newX = effect.fromPos.x + (effect.toPos.x - effect.fromPos.x) * progress;
                const newY = effect.fromPos.y + (effect.toPos.y - effect.fromPos.y) * progress;
                effect.targetEntity.x = newX;
                effect.targetEntity.y = newY;

                if (effect.life % 2 === 0 && effect.targetEntity.image) {
                    const afterimage = {
                        type: 'sprite',
                        image: effect.targetEntity.image,
                        x: newX + effect.targetEntity.width / 2,
                        y: newY + effect.targetEntity.height / 2,
                        width: effect.targetEntity.width,
                        height: effect.targetEntity.height,
                        duration: 10,
                        alpha: 0.5,
                        fade: 0.05,
                        blendMode: 'lighter',
                    };
                    this.effects.push(afterimage);
                }

                if (effect.life <= 0) {
                    effect.targetEntity.x = effect.toPos.x;
                    effect.targetEntity.y = effect.toPos.y;
                    this.effects.splice(i, 1);
                }
                continue;
            }

            if (effect.type === 'knockback_animation') {
                effect.life--;
                const progress = 1 - (effect.life / effect.duration);

                const newX = effect.fromPos.x + (effect.toPos.x - effect.fromPos.x) * progress;
                const newY = effect.fromPos.y + (effect.toPos.y - effect.fromPos.y) * progress;
                effect.targetEntity.x = newX;
                effect.targetEntity.y = newY;

                if (effect.life <= 0) {
                    effect.targetEntity.x = effect.toPos.x;
                    effect.targetEntity.y = effect.toPos.y;
                    this.effects.splice(i, 1);
                }
                continue;
            }

        if (effect.type === 'item_use') {
            effect.life--;
            const progress = 1 - effect.life / effect.duration;
            effect.scale = effect.startScale + (effect.endScale - effect.startScale) * progress;
            effect.alpha = 1 - progress;
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
            continue;
        }

        if (effect.type === 'armor_break') {
            effect.life--;
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
            continue;
        }


            if (effect.type === 'glow') {
                effect.alpha -= effect.decay;
                if (effect.alpha <= 0) {
                    this.effects.splice(i, 1);
                }
            } else if (effect.type === 'sprite') {
                effect.duration--;
                effect.alpha -= effect.fade;
                if (effect.duration <= 0 || effect.alpha <= 0) {
                    this.effects.splice(i, 1);
                }
            } else if (effect.type === 'flash') {
                effect.duration--;
                if (effect.duration <= 0) {
                    this.effects.splice(i, 1);
                }
            } else if (effect.type === 'arrow_trail') {
                effect.life--;
                if (effect.life <= 0 || effect.projectile.isDead) {
                    this.effects.splice(i, 1);
                }
            } else if (effect.type === 'knockback_shine') {
                effect.life--;
                if (effect.life <= 0) {
                    this.effects.splice(i, 1);
                }
            }
        }

    }

    render(ctx) {
        for (const effect of this.effects) {
            if (effect.type === 'death_animation') {
                const { entity, animationType, life, duration } = effect;
                const progress = life / duration;

                ctx.save();
                if (animationType === 'explode') {
                    if (progress > 0.66) {
                        ctx.globalAlpha = (1 - progress) * 3;
                        ctx.drawImage(entity.image, entity.x, entity.y, entity.width, entity.height);
                        ctx.globalCompositeOperation = 'source-atop';
                        ctx.fillStyle = 'white';
                        ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
                    }
                } else if (animationType === 'fade') {
                    ctx.globalAlpha = progress;
                    ctx.drawImage(entity.image, entity.x, entity.y, entity.width, entity.height);
                }
                ctx.restore();
            } else if (effect.type === 'shockwave') {
                ctx.save();
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = effect.lineWidth * (effect.life / effect.duration);
                ctx.globalAlpha = effect.life / effect.duration;
                ctx.stroke();
                ctx.restore();
            } else if (effect.type === 'item_pop') {
                const { item, startPos, endPos, life, duration, popHeight } = effect;
                const progress = 1 - (life / duration);
                const currentX = startPos.x + (endPos.x - startPos.x) * progress;
                const currentY = startPos.y + (endPos.y - startPos.y) * progress;
                const arc = Math.sin(progress * Math.PI) * popHeight;
                if (item.image && item.image.width) {
                    ctx.drawImage(item.image, currentX, currentY - arc, item.width, item.height);
                }
            } else if (effect.type === 'eject_item') {
                const progress = 1 - (effect.life / effect.duration);
                const currentDist = effect.distance * progress;
                const currentX = effect.startPos.x + Math.cos(effect.angle) * currentDist;
                const currentY = effect.startPos.y + Math.sin(effect.angle) * currentDist;
                const arc = Math.sin(progress * Math.PI) * effect.height;
                if (effect.image && effect.image.width) {
                    ctx.drawImage(effect.image, currentX, currentY - arc, effect.item.width, effect.item.height);
                }
            } else if (effect.type === 'item_use') {
                const w = effect.image.width * effect.scale;
                const h = effect.image.height * effect.scale;
                ctx.save();
                ctx.globalAlpha = effect.alpha;
                ctx.drawImage(effect.image, effect.x - w / 2, effect.y - h / 2, w, h);
                ctx.restore();
            } else if (effect.type === 'glow') {
                const { x, y, radius } = effect;
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, effect.colorInner.replace('ALPHA', effect.alpha.toFixed(2)));
                gradient.addColorStop(1, effect.colorOuter);

                ctx.save();
                ctx.globalCompositeOperation = effect.blendMode;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.restore();
            } else if (effect.type === 'sprite') {
                ctx.save();
                ctx.globalCompositeOperation = effect.blendMode;
                ctx.globalAlpha = effect.alpha;
                ctx.drawImage(
                    effect.image,
                    effect.x - effect.width / 2,
                    effect.y - effect.height / 2,
                    effect.width,
                    effect.height
                );
                ctx.restore();
            } else if (effect.type === 'flash') {
                const { entity } = effect;
                ctx.save();
                ctx.drawImage(entity.image, entity.x, entity.y, entity.width, entity.height);
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = effect.color;
                ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
                ctx.restore();
            } else if (effect.type === 'armor_break') {
                const { rect } = effect;
                const progress = 1 - effect.life / effect.duration;
                ctx.save();
                ctx.globalAlpha = 1 - progress;

                const centerX = rect.x + rect.width / 2;
                const centerY = rect.y + rect.height / 2;
                const moveAmount = progress * 20;

                ctx.drawImage(
                    effect.image,
                    0,
                    0,
                    effect.image.width / 2,
                    effect.image.height,
                    centerX - rect.width / 2 - moveAmount,
                    centerY - rect.height / 2,
                    rect.width / 2,
                    rect.height
                );
                ctx.drawImage(
                    effect.image,
                    effect.image.width / 2,
                    0,
                    effect.image.width / 2,
                    effect.image.height,
                    centerX + moveAmount,
                    centerY - rect.height / 2,
                    rect.width / 2,
                    rect.height
                );
                ctx.restore();
            } else if (effect.type === 'arrow_trail') {
                const p = effect.projectile;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(p.startX, p.startY);
                ctx.lineTo(p.x + p.width / 2, p.y + p.height / 2);
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = effect.life / effect.duration;
                ctx.stroke();
                ctx.restore();
            } else if (effect.type === 'knockback_shine') {
                const progress = 1 - effect.life / effect.duration;
                const shine = 1 - progress;
                const shake = Math.sin(progress * Math.PI * 4) * 2;
                const { entity } = effect;
                const centerX = entity.x + entity.width / 2 + shake;
                const centerY = entity.y + entity.height / 2;
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.globalCompositeOperation = 'lighter';
                ctx.globalAlpha = shine;
                ctx.drawImage(effect.image, -effect.image.width / 2, -effect.image.height / 2);
                ctx.restore();
            }
        }

        this.particleEngine.render(ctx);
        this.textPopupEngine.render(ctx);
    }
}

