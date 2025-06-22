import { SKILLS } from '../data/skills.js';
import { MBTI_INFO } from '../data/mbti.js';
import { FAITHS } from '../data/faiths.js';
import { TRAITS } from '../data/traits.js';
import { SYNERGIES } from '../data/synergies.js';
import { ARTIFACTS } from '../data/artifacts.js';

export class UIManager {
    constructor() {
        this.levelElement = document.getElementById('ui-player-level');
        this.statPointsElement = document.getElementById('ui-player-statPoints');
        this.movementSpeedElement = document.getElementById('ui-player-movementSpeed');
        this.hpElement = document.getElementById('ui-player-hp');
        this.maxHpElement = document.getElementById('ui-player-maxHp');
        this.attackPowerElement = document.getElementById('ui-player-attackPower');
        this.goldElement = document.getElementById('ui-player-gold');
        this.hpBarFillElement = document.getElementById('ui-hp-bar-fill');
        this.mpElement = document.getElementById('ui-player-mp');
        this.maxMpElement = document.getElementById('ui-player-maxMp');
        this.mpBarFillElement = document.getElementById('ui-mp-bar-fill');
        this.expBarFillElement = document.getElementById('ui-exp-bar-fill');
        this.expTextElement = document.getElementById('ui-exp-text');
        this.inventorySlotsElement = document.getElementById('inventory-slots');
        this.statUpButtonsContainer = document.getElementById('player-stats-container');
        this.skillSlots = Array.from(document.querySelectorAll('#skill-bar .skill-slot'));
        // --- 용병 정보창 요소 추가 ---
        this.mercDetailPanel = document.getElementById('mercenary-detail-panel');
        this.mercDetailName = document.getElementById('merc-detail-name');
        this.mercStatsContainer = document.getElementById('merc-stats-container');
        this.mercInventory = document.getElementById('merc-inventory');
        this.mercEquipment = document.getElementById('merc-equipment');
        this.mercSkills = document.getElementById('merc-skills');
        this.closeMercDetailBtn = document.getElementById('close-merc-detail-btn');
        this.mercenaryPanel = document.getElementById('mercenary-panel');
        this.mercenaryList = document.getElementById('mercenary-list');
        // 장착 대상 선택 패널 요소
        this.equipTargetPanel = document.getElementById('equipment-target-panel');
        this.equipTargetList = document.getElementById('equipment-target-list');
        // 인벤토리 패널 요소
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.equippedItemsContainer = document.getElementById('equipped-items');
        this.inventoryListContainer = document.getElementById('inventory-list');
        this.tooltip = document.getElementById('tooltip');
        this.characterSheetPanel = document.getElementById('character-sheet-panel');
        this.sheetCharacterName = document.getElementById('sheet-character-name');
        this.sheetEquipment = document.getElementById('sheet-equipment');
        this.sheetInventory = document.getElementById('sheet-inventory');
        this.callbacks = {};
        this._lastInventory = [];
        this._lastConsumables = [];
        this._statUpCallback = null;
        this._isInitialized = false;
        this.particleDecoratorManager = null;
        this.vfxManager = null;

        // 스탯 표시용 이름 매핑
        this.statDisplayNames = {
            strength: '💪 힘',
            agility: '🏃 민첩',
            endurance: '🛡 체력',
            focus: '🔮 집중',
            intelligence: '📖 지능',
            movement: '👣 이동',
            maxHp: '❤️ 최대 HP',
            maxMp: '💧 최대 MP',
            attackPower: '⚔️ 공격력',
            movementSpeed: '🚶 이동 속도',
            hpRegen: '❤️+ HP 재생',
            mpRegen: '💧+ MP 재생',
            visionRange: '👁️ 시야',
            poisonResist: '독 저항',
            freezeResist: '빙결 저항',
            sleepResist: '수면 저항',
            paralysisResist: '마비 저항',
            burnResist: '화상 저항',
            bleedResist: '출혈 저항',
            petrifyResist: '석화 저항',
            silenceResist: '침묵 저항',
            blindResist: '실명 저항',
            fearResist: '공포 저항',
            confusionResist: '혼란 저항',
            charmResist: '매혹 저항',
            movementResist: '이동 방해 저항',
        };
    }

    init(callbacks) {
        if (this._isInitialized) return;
        this.callbacks = callbacks || {};
        this._statUpCallback = this.callbacks.onStatUp;
        this.onEquipItem = this.callbacks.onEquipItem;
        this.onConsumableUse = this.callbacks.onConsumableUse;
        if (this.statUpButtonsContainer) {
            this.statUpButtonsContainer.addEventListener('click', (event) => {
                if (event.target.classList.contains('stat-up-btn') ||
                    event.target.classList.contains('stat-plus')) {
                    let stat = event.target.dataset.stat;
                    if (!stat && event.target.id && event.target.id.startsWith('btn-plus-')) {
                        stat = event.target.id.replace('btn-plus-', '');
                    }
                    if (stat && this._statUpCallback) {
                        this._statUpCallback(stat);
                    }
                }
            });
        }
        // 닫기 버튼 이벤트
        if (this.closeMercDetailBtn) {
            this.closeMercDetailBtn.onclick = () => this.hideMercenaryDetail();
        }

        document.querySelectorAll('.close-btn[data-panel-id]').forEach(btn => {
            btn.onclick = () => this.hidePanel(btn.dataset.panelId);
        });

        const closeEquipBtn = document.getElementById('close-equip-target-btn');
        if (closeEquipBtn) closeEquipBtn.onclick = () => this.hideEquipTargetPanel();

        if (this.characterSheetPanel) {
            this.characterSheetPanel.querySelectorAll('.stat-tab-btn').forEach(btn => {
                btn.onclick = () => {
                    this.characterSheetPanel.querySelectorAll('.stat-tab-btn').forEach(b => b.classList.remove('active'));
                    this.characterSheetPanel.querySelectorAll('.stat-page').forEach(p => {
                        p.classList.remove('active');
                        p.classList.add('hidden');
                    });
                    btn.classList.add('active');
                    const page = this.characterSheetPanel.querySelector(`#stat-page-${btn.dataset.tab}`);
                    if (page) {
                        page.classList.add('active');
                        page.classList.remove('hidden');
                    }
                };
            });
        }
        this._isInitialized = true;
    }

    setStatUpCallback(cb) {
        this.init(cb);
    }

    showMercenaryDetail(mercenary) {
        if (!this.mercDetailPanel) return;

        this.mercDetailName.textContent = `${mercenary.constructor.name} (Lv.${mercenary.stats.get('level')})`;

        const statsToShow = ['attackPower', 'strength', 'agility', 'endurance', 'visionRange', 'movementSpeed', 'hpRegen', 'mpRegen'];
        this.mercStatsContainer.innerHTML = '';

        // 레벨 및 경험치 표시
        const levelDiv = document.createElement('div');
        levelDiv.className = 'stat-line';
        levelDiv.textContent = `레벨: ${mercenary.stats.get('level')}`;
        this.mercStatsContainer.appendChild(levelDiv);

        const expDiv = document.createElement('div');
        expDiv.className = 'stat-line';
        expDiv.textContent = `EXP: ${mercenary.stats.get('exp')} / ${mercenary.stats.get('expNeeded')}`;
        this.mercStatsContainer.appendChild(expDiv);

        const hpDiv = document.createElement('div');
        hpDiv.className = 'stat-line';
        const shieldText = mercenary.shield > 0 ? ` <span style="color: blue">+${mercenary.shield.toFixed(1)}</span>` : '';
        hpDiv.innerHTML = `HP: ${mercenary.hp.toFixed(1)} / ${mercenary.maxHp}${shieldText}`;
        this.mercStatsContainer.appendChild(hpDiv);

        const mpDiv = document.createElement('div');
        mpDiv.className = 'stat-line';
        mpDiv.textContent = `MP: ${mercenary.mp.toFixed(1)} / ${mercenary.maxMp}`;
        this.mercStatsContainer.appendChild(mpDiv);

        const fullDiv = document.createElement('div');
        fullDiv.className = 'stat-line';
        fullDiv.textContent = `🍗 배부름: ${mercenary.fullness.toFixed(1)} / ${mercenary.maxFullness}`;
        this.mercStatsContainer.appendChild(fullDiv);

        const affinityDiv = document.createElement('div');
        affinityDiv.className = 'stat-line';
        affinityDiv.textContent = `💕 호감도: ${mercenary.affinity.toFixed(1)} / ${mercenary.maxAffinity}`;
        this.mercStatsContainer.appendChild(affinityDiv);

        const mbtiDiv = document.createElement('div');
        mbtiDiv.className = 'stat-line';
        const mbtiSpan = document.createElement('span');
        mbtiSpan.textContent = mercenary.properties.mbti;
        this._attachTooltip(mbtiSpan, this._getMBTITooltip(mercenary.properties.mbti));
        mbtiDiv.innerHTML = 'MBTI: ';
        mbtiDiv.appendChild(mbtiSpan);
        this.mercStatsContainer.appendChild(mbtiDiv);

        const faithDiv = document.createElement('div');
        faithDiv.className = 'stat-line';
        const faithSpan = document.createElement('span');
        const fId = mercenary.properties.faith;
        faithSpan.textContent = fId ? FAITHS[fId].name : FAITHS.NONE.name;
        this._attachTooltip(faithSpan, this._getFaithTooltip(fId));
        faithDiv.innerHTML = '신앙: ';
        faithDiv.appendChild(faithSpan);
        this.mercStatsContainer.appendChild(faithDiv);

        if (mercenary.properties.traits && mercenary.properties.traits.length) {
            const traitDiv = document.createElement('div');
            traitDiv.className = 'stat-line';
            traitDiv.innerHTML = '특성: ';
            mercenary.properties.traits.forEach(id => {
                const span = document.createElement('span');
                span.textContent = TRAITS[id]?.name || id;
                this._attachTooltip(span, this._getTraitTooltip(id));
                traitDiv.appendChild(span);
                traitDiv.appendChild(document.createTextNode(' '));
            });
            this.mercStatsContainer.appendChild(traitDiv);
        }

        statsToShow.forEach(stat => {
            const statDiv = document.createElement('div');
            statDiv.className = 'stat-line';
            const displayName = this.statDisplayNames[stat] || stat;
            const statValue = mercenary.stats.get(stat);
            if (stat === 'attackPower') {
                const bonus = mercenary.damageBonus || 0;
                const bonusText = bonus > 0 ? ` <span style="color:red">+${bonus}</span>` : '';
                statDiv.innerHTML = `${displayName}: ${statValue}${bonusText}`;
            } else {
                statDiv.textContent = `${displayName}: ${statValue}`;
            }
            this.mercStatsContainer.appendChild(statDiv);
        });

        if (mercenary.effects && mercenary.effects.length > 0) {
            const effDiv = document.createElement('div');
            effDiv.className = 'stat-line';
            const list = mercenary.effects.map(e => `${e.name}(${Math.ceil(e.remaining / 100)}턴)`);
            effDiv.textContent = `효과: ${list.join(', ')}`;
            this.mercStatsContainer.appendChild(effDiv);
        }

        if (this.mercEquipment) {
            this.mercEquipment.innerHTML = '';
            for (const slot in mercenary.equipment) {
                const item = mercenary.equipment[slot];
                const slotDiv = document.createElement('div');
                slotDiv.className = 'equip-slot';
                if (item && item.image) {
                    const img = document.createElement('img');
                    img.src = item.image.src;
                    slotDiv.appendChild(img);
                    this._attachTooltip(slotDiv, this._getItemTooltip(item));
                } else {
                    slotDiv.textContent = slot;
                }
                this.mercEquipment.appendChild(slotDiv);
            }
        }

        if (this.mercInventory) {
            this.mercInventory.innerHTML = '';
            const inventory = mercenary.consumables || mercenary.inventory || [];
            inventory.forEach(item => {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'inventory-item-slot';
                if (item.image) {
                    const img = document.createElement('img');
                    img.src = item.image.src;
                    slotDiv.appendChild(img);
                } else {
                    slotDiv.textContent = item.name;
                }
                this._attachTooltip(slotDiv, this._getItemTooltip(item));
                this.mercInventory.appendChild(slotDiv);
            });
        }

        if (this.mercSkills) {
            this.mercSkills.innerHTML = '';
            (mercenary.skills || []).forEach(skillId => {
                const skill = SKILLS[skillId];
                if (!skill) return;
                const div = document.createElement('div');
                div.className = 'skill-slot';
                div.style.backgroundImage = `url(${skill.icon})`;
                div.style.backgroundSize = 'cover';
                this._attachTooltip(div, `<strong>${skill.name}</strong><br>${skill.description}`);
                this.mercSkills.appendChild(div);
            });
        }

        this.mercDetailPanel.classList.remove('hidden');
        if (this.gameState) this.gameState.isPaused = true;
    }

    hideMercenaryDetail() {
        if (this.mercDetailPanel) {
            this.mercDetailPanel.classList.add('hidden');
        }
        if (this.gameState) this.gameState.isPaused = false;
    }

    showCharacterSheet(entity) {
        if (!this.characterSheetPanel) return;
        this.renderCharacterSheet(entity);
        this.showPanel('character-sheet-panel');
    }

    renderCharacterSheet(entity) {
        if (!this.characterSheetPanel) return;
        if (this.sheetCharacterName)
            this.sheetCharacterName.textContent = `${entity.constructor.name} (Lv.${entity.stats.get('level')})`;

        if (this.sheetEquipment) {
            this.sheetEquipment.innerHTML = '';
            const slots = ['main_hand', 'off_hand', 'armor', 'helmet', 'gloves', 'boots', 'accessory1', 'accessory2'];
            slots.forEach(slot => {
                const item = entity.equipment ? entity.equipment[slot] : null;
                const slotDiv = document.createElement('div');
                slotDiv.className = 'equip-slot';
                slotDiv.dataset.slot = slot;
                
                const nameSpan = document.createElement('span');
                nameSpan.textContent = slot;
                slotDiv.appendChild(nameSpan);

                const itemSpan = document.createElement('span');
                itemSpan.textContent = item ? item.name : '없음';
                slotDiv.appendChild(itemSpan);
                
                if(item) {
                    this._attachTooltip(slotDiv, this._getItemTooltip(item));
                } else {
                    this._attachTooltip(slotDiv, `<strong>${slot}</strong><br>비어있음`);
                }

                this.sheetEquipment.appendChild(slotDiv);
            });
        }

        if (this.sheetInventory) {
            this.sheetInventory.innerHTML = '';
            const inventory = entity.consumables || entity.inventory || [];
            inventory.forEach(item => {
                const slotDiv = document.createElement('div');
                slotDiv.className = 'inventory-item-slot';
                if (item.image) {
                    const img = document.createElement('img');
                    img.src = item.image.src;
                    slotDiv.appendChild(img);
                } else {
                    slotDiv.textContent = item.name;
                }
                this._attachTooltip(slotDiv, this._getItemTooltip(item));
                this.sheetInventory.appendChild(slotDiv);
            });
        }

        const page1 = this.characterSheetPanel.querySelector('#stat-page-1');
        if (page1) {
            page1.innerHTML = '';
            const statsToShow = ['strength','agility','endurance','focus','intelligence','movement','maxHp','maxMp','attackPower','movementSpeed','visionRange','hpRegen','mpRegen'];
            statsToShow.forEach(stat => {
                const line = document.createElement('div');
                line.className = 'stat-line';
                const displayName = this.statDisplayNames[stat] || stat;
                if (stat === 'attackPower') {
                    const base = entity.stats.get(stat);
                    const bonus = entity.damageBonus || 0;
                    const bonusText = bonus > 0 ? ` <span style="color:red">+${bonus}</span>` : '';
                    line.innerHTML = `<span>${displayName}:</span> <span>${base}${bonusText}</span>`;
                } else {
                    line.innerHTML = `<span>${displayName}:</span> <span>${entity.stats.get(stat)}</span>`;
                }
                page1.appendChild(line);
            });

            if (entity.effects && entity.effects.length > 0) {
                const effLine = document.createElement('div');
                effLine.className = 'stat-line';
                const list = entity.effects.map(e => `${e.name}(${Math.ceil(e.remaining / 100)}턴)`);
                effLine.textContent = `effects: ${list.join(', ')}`;
                page1.appendChild(effLine);
            }

            if (entity.fullness !== undefined) {
                const fLine = document.createElement('div');
                fLine.className = 'stat-line';
                fLine.innerHTML = `<span>fullness:</span> <span>${entity.fullness.toFixed(1)} / ${entity.maxFullness}</span>`;
                page1.appendChild(fLine);
            }
            if (entity.affinity !== undefined) {
                const aLine = document.createElement('div');
                aLine.className = 'stat-line';
                aLine.innerHTML = `<span>affinity:</span> <span>${entity.affinity.toFixed(1)} / ${entity.maxAffinity}</span>`;
                page1.appendChild(aLine);
            }

        if (entity.properties && entity.properties.mbti) {
            const mLine = document.createElement('div');
            mLine.className = 'stat-line';
            const span = document.createElement('span');
            span.textContent = entity.properties.mbti;
            this._attachTooltip(span, this._getMBTITooltip(entity.properties.mbti));
            mLine.innerHTML = 'MBTI: ';
            mLine.appendChild(span);
            page1.appendChild(mLine);
        }

            if (entity.properties && entity.properties.faith) {
                const fLine2 = document.createElement('div');
                fLine2.className = 'stat-line';
                const span2 = document.createElement('span');
                const fId2 = entity.properties.faith;
                span2.textContent = FAITHS[fId2].name;
                this._attachTooltip(span2, this._getFaithTooltip(fId2));
                fLine2.innerHTML = 'faith: ';
                fLine2.appendChild(span2);
                page1.appendChild(fLine2);
            }

            if (entity.properties && Array.isArray(entity.properties.traits)) {
                const tLine = document.createElement('div');
                tLine.className = 'stat-line';
                tLine.innerHTML = 'traits: ';
                entity.properties.traits.forEach(id => {
                    const span = document.createElement('span');
                    span.textContent = TRAITS[id]?.name || id;
                    this._attachTooltip(span, this._getTraitTooltip(id));
                    tLine.appendChild(span);
                    tLine.appendChild(document.createTextNode(' '));
                });
                page1.appendChild(tLine);
            }
        }

        const page2 = this.characterSheetPanel.querySelector('#stat-page-2');
        if (page2) {
            page2.innerHTML = '<h3>무기 숙련도</h3>';
            const proficiencyList = document.createElement('div');
            proficiencyList.className = 'proficiency-list';

            for (const weaponType in entity.proficiency) {
                const prof = entity.proficiency[weaponType];
                const line = document.createElement('div');
                line.className = 'proficiency-line';
                const expRatio = (prof.exp / prof.expNeeded) * 100;
                line.innerHTML = `
                    <span class="prof-name">${weaponType}</span>
                    <span class="prof-level">Lv.${prof.level}</span>
                    <div class="prof-exp-bar-container">
                        <div class="prof-exp-bar-fill" style="width: ${expRatio}%"></div>
                        <span class="prof-exp-text">${prof.exp}/${prof.expNeeded}</span>
                    </div>
                `;
                proficiencyList.appendChild(line);
            }
            page2.appendChild(proficiencyList);

            // 상태이상 저항 스탯 표시
            const resistHeader = document.createElement('h3');
            resistHeader.style.marginTop = '15px';
            resistHeader.textContent = '상태이상 저항';
            page2.appendChild(resistHeader);

            const resistList = document.createElement('div');
            resistList.className = 'proficiency-list';

            const resistStats = [
                'poisonResist', 'freezeResist', 'sleepResist', 'paralysisResist',
                'burnResist', 'bleedResist', 'petrifyResist', 'silenceResist',
                'blindResist', 'fearResist', 'confusionResist', 'charmResist', 'movementResist'
            ];

            resistStats.forEach(stat => {
                const value = entity.stats.get(stat) * 100;
                if (value === 0) return;
                const line = document.createElement('div');
                line.className = 'stat-line';
                const name = this.statDisplayNames[stat] || stat.replace('Resist', '');
                line.innerHTML = `<span>${name}:</span> <span>${value.toFixed(0)}%</span>`;
                resistList.appendChild(line);
            });
            page2.appendChild(resistList);
        }
    }

    showPanel(panelId) {
        if (panelId === 'inventory' && this.inventoryPanel) {
            this.inventoryPanel.classList.remove('hidden');
            if (this.gameState) this.renderInventory(this.gameState);
        } else if (panelId === 'mercenary-panel' && this.mercenaryPanel) {
            this.mercenaryPanel.classList.remove('hidden');
            if (this.mercenaryManager) this.renderMercenaryList();
        } else if (panelId === 'character-sheet-panel' && this.characterSheetPanel) {
            this.characterSheetPanel.classList.remove('hidden');
        }
    }

    hidePanel(panelId) {
        if (panelId === 'inventory' && this.inventoryPanel) {
            this.inventoryPanel.classList.add('hidden');
        } else if (panelId === 'mercenary-panel' && this.mercenaryPanel) {
            this.mercenaryPanel.classList.add('hidden');
        } else if (panelId === 'character-sheet-panel' && this.characterSheetPanel) {
            this.characterSheetPanel.classList.add('hidden');
        }
        if (this.gameState) this.gameState.isPaused = false;
    }

    renderInventory(gameState) {
        const player = gameState.player;
        this.equippedItemsContainer.innerHTML = '';
        for (const slot in player.equipment) {
            const item = player.equipment[slot];
            const slotDiv = document.createElement('div');
            slotDiv.className = 'equip-slot';
            slotDiv.dataset.slot = slot;
            if (item && item.image) {
                const img = document.createElement('img');
                img.src = item.image.src;
                slotDiv.appendChild(img);
                this._attachTooltip(slotDiv, this._getItemTooltip(item));
            } else {
                slotDiv.textContent = slot;
            }
            this.equippedItemsContainer.appendChild(slotDiv);
        }

        this.inventoryListContainer.innerHTML = '';
        gameState.inventory.forEach((item, index) => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'inventory-item-slot';
            if (item.image) {
                const img = document.createElement('img');
                img.src = item.image.src;
                img.alt = item.name;
                slotDiv.appendChild(img);
            } else {
                slotDiv.textContent = item.name;
            }
            if (item.quantity > 1) {
                const qty = document.createElement('span');
                qty.className = 'item-qty';
                qty.textContent = item.quantity;
                slotDiv.appendChild(qty);
            }
            this._attachTooltip(slotDiv, this._getItemTooltip(item));
            slotDiv.onclick = () => {
                if (this.callbacks.onItemUse) this.callbacks.onItemUse(index);
            };
            this.inventoryListContainer.appendChild(slotDiv);
        });
    }

    updateUI(gameState) {
        this.gameState = gameState;
        const player = gameState.player;
        const stats = player.stats;
        if (this.levelElement) this.levelElement.textContent = stats.get('level');
        if (this.statPointsElement) this.statPointsElement.textContent = gameState.statPoints;
        const primaryStats = ['strength', 'agility', 'endurance', 'focus', 'intelligence', 'movement'];
        primaryStats.forEach(stat => {
            const valueElement = document.getElementById(`ui-player-${stat}`);
            const buttonElement = valueElement ? valueElement.nextElementSibling : null;
            if (valueElement) valueElement.textContent = stats.get(stat);
            if (buttonElement) {
                buttonElement.style.display = gameState.statPoints > 0 ? 'inline-block' : 'none';
            }
        });
        if (this.maxHpElement) this.maxHpElement.textContent = stats.get('maxHp');
        const shieldInfo = player.shield > 0 ? `+${player.shield.toFixed(1)}` : '';
        if (this.hpElement) this.hpElement.innerHTML = `${Math.ceil(player.hp)}${shieldInfo ? ` <span style="color:blue">${shieldInfo}</span>` : ''}`;
        if (this.mpElement) this.mpElement.textContent = Math.ceil(player.mp);
        if (this.maxMpElement) this.maxMpElement.textContent = stats.get('maxMp');
        const atkBonus = player.damageBonus || 0;
        if (this.attackPowerElement) {
            const bonusText = atkBonus > 0 ? ` <span style="color:red">+${atkBonus}</span>` : '';
            this.attackPowerElement.innerHTML = `${stats.get('attackPower')}${bonusText}`;
        }
        if (this.movementSpeedElement) this.movementSpeedElement.textContent = stats.get('movementSpeed').toFixed(2);
        if (this.goldElement) this.goldElement.textContent = gameState.gold;
        const hpRatio = player.hp / player.maxHp;
        if (this.hpBarFillElement) this.hpBarFillElement.style.width = `${hpRatio * 100}%`;
        if (this.mpBarFillElement) {
            const mpRatio = player.mp / player.maxMp;
            this.mpBarFillElement.style.width = `${mpRatio * 100}%`;
        }
        const expRatio = stats.get('exp') / stats.get('expNeeded');
        if (this.expBarFillElement) this.expBarFillElement.style.width = `${expRatio * 100}%`;
        if (this.expTextElement) this.expTextElement.textContent = `${stats.get('exp')} / ${stats.get('expNeeded')}`;
        if (this.inventorySlotsElement && this._hasConsumablesChanged(player.consumables)) {
            this.inventorySlotsElement.innerHTML = '';
            (player.consumables || []).forEach((item, index) => {
                const slot = document.createElement('div');
                slot.className = 'inventory-slot';
                if (item.image) {
                    const img = document.createElement('img');
                    img.src = item.image.src;
                    img.alt = item.name;
                    slot.appendChild(img);
                } else {
                    slot.textContent = item.name;
                }
                if (item.quantity > 1) {
                    const qty = document.createElement('span');
                    qty.className = 'item-qty';
                    qty.textContent = item.quantity;
                    slot.appendChild(qty);
                }
                this._attachTooltip(slot, this._getItemTooltip(item));
                slot.onclick = () => {
                    if (this.onConsumableUse) this.onConsumableUse(index);
                };
                this.inventorySlotsElement.appendChild(slot);
            });
            this._lastConsumables = [...(player.consumables || [])];
        }

        if (this.skillSlots) {
            this.skillSlots.forEach((slot, idx) => {
                const skillId = player.skills[idx];
                let overlay = slot.querySelector('.skill-cooldown');
                if (skillId) {
                    const skill = SKILLS[skillId];
                    if (skill && skill.icon) {
                        slot.style.backgroundImage = `url(${skill.icon})`;
                        slot.style.backgroundSize = 'cover';
                        slot.style.backgroundPosition = 'center';
                        slot.title = skill.name;
                    }
                    const cd = player.skillCooldowns[skillId] || 0;
                    if (cd > 0) {
                        if (!overlay) {
                            overlay = document.createElement('div');
                            overlay.className = 'skill-cooldown';
                            slot.appendChild(overlay);
                        }
                        overlay.textContent = Math.ceil(cd / 60);
                    } else if (overlay) {
                        overlay.remove();
                    }
                } else {
                    slot.style.backgroundImage = '';
                    slot.title = '';
                    if (overlay) overlay.remove();
                }
            });
        }
    }

    _hasInventoryChanged(current) {
        if (current.length !== this._lastInventory.length) return true;
        for (let i = 0; i < current.length; i++) {
            if (current[i] !== this._lastInventory[i]) return true;
            if (current[i].quantity !== this._lastInventory[i].quantity) return true;
        }
        return false;
    }

    _hasConsumablesChanged(current) {
        if (current.length !== this._lastConsumables.length) return true;
        for (let i = 0; i < current.length; i++) {
            if (current[i] !== this._lastConsumables[i]) return true;
            if (current[i].quantity !== this._lastConsumables[i].quantity) return true;
        }
        return false;
    }

    useItem(itemIndex, gameState) {
        const item = gameState.inventory[itemIndex];
        if (!item) return;

        if (item.tags.includes('weapon') || item.tags.includes('armor') ||
            item.type === 'weapon' || item.type === 'armor') {
            this._showEquipTargetPanel(item, gameState);
        } else if (item.baseId === 'potion' || item.name === 'potion') {
            const player = gameState.player;
            player.hp = Math.min(player.maxHp, player.hp + 5);
            console.log(`포션을 사용했습니다! HP +5`);
            if (this.particleDecoratorManager) {
                this.particleDecoratorManager.playHealingEffect(player);
            }
            if (this.vfxManager) {
                this.vfxManager.addItemUseEffect(player, item.image);
            }
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                gameState.inventory.splice(itemIndex, 1);
            }
            this.updateUI(gameState);
        }
    }

    _showEquipTargetPanel(item, gameState) {
        if (!this.equipTargetPanel) return;

        this.equipTargetList.innerHTML = '';
        const targets = [gameState.player, ...(this.mercenaryManager ? this.mercenaryManager.mercenaries : [])];

        targets.forEach((target, idx) => {
            const button = document.createElement('button');
            if (target.isPlayer) {
                button.textContent = '플레이어';
            } else {
                button.textContent = `용병 ${idx}`;
            }
            button.onclick = () => {
                if (this.onEquipItem) this.onEquipItem(target, item);
                this.hideEquipTargetPanel();
            };
            this.equipTargetList.appendChild(button);
        });

        this.equipTargetPanel.classList.remove('hidden');
    }

    hideEquipTargetPanel() {
        if (this.equipTargetPanel) {
            this.equipTargetPanel.classList.add('hidden');
        }
    }

    renderMercenaryList() {
        if (!this.mercenaryList) return;
        this.mercenaryList.innerHTML = '';
        const mercs = this.mercenaryManager ? this.mercenaryManager.mercenaries : [];
        if (mercs.length === 0) {
            this.mercenaryList.textContent = '고용한 용병이 없습니다.';
            return;
        }
        mercs.forEach((merc, idx) => {
            const div = document.createElement('div');
            div.className = 'merc-entry';
            div.textContent = `${idx + 1}. ${merc.constructor.name} (Lv.${merc.stats.get('level')})`;
            div.onclick = () => this.showMercenaryDetail(merc);
            this.mercenaryList.appendChild(div);
        });
    }

    renderHpBars(ctx, player, monsters, mercenaries) {
        for (const monster of monsters) {
            this._drawHpBar(ctx, monster);
        }
        for (const merc of mercenaries) {
            this._drawHpBar(ctx, merc);
        }
    }

    _drawHpBar(ctx, entity) {
        if (Math.abs(entity.hp - entity.maxHp) < 0.01 || entity.hp <= 0) return;
        const barWidth = entity.width;
        const barHeight = 8;
        const x = entity.x;
        const y = entity.y - barHeight - 5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);
        const hpRatio = entity.hp / entity.maxHp;
        ctx.fillStyle = hpRatio > 0.5 ? '#00ff00' : hpRatio > 0.2 ? '#ffff00' : '#ff0000';
        ctx.fillRect(x, y, barWidth * hpRatio, barHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(x, y, barWidth, barHeight);
    }

    // 아이템 툴팁 생성 로직 강화
    _getItemTooltip(item) {
        const artifactData = ARTIFACTS[item.baseId];
        let html = `<strong>${item.name}</strong>`;
        
        // 타입과 등급
        html += `<div style="color: #aaa; font-size: 11px;">${item.tier || 'normal'} ${item.type}</div>`;

        // 설명
        if (artifactData && artifactData.description) {
            html += `<div style="margin: 4px 0; color: #b0e0e6;">${artifactData.description}</div>`;
        }

        // 핵심 스탯
        if (item.damageDice) html += `<div>피해: ${item.damageDice}</div>`;
        if (item.healAmount) html += `<div>회복량: ${item.healAmount}</div>`;

        // 추가 스탯
        if (item.stats) {
            const entries = item.stats instanceof Map ? Array.from(item.stats.entries()) : Object.entries(item.stats);
            if(entries.length > 0) {
                html += `<div style="margin-top: 4px; border-top: 1px solid #555; padding-top: 4px;">`;
                for (const [k, v] of entries) {
                    html += `<div>${k}: ${v > 0 ? '+' : ''}${v}</div>`;
                }
                html += `</div>`;
            }
        }
        
        // 미시세계 스탯
        if(item.durability || item.weight || item.toughness) {
             html += `<div style="margin-top: 4px; border-top: 1px solid #555; padding-top: 4px; color: #ccc;">`;
             if(item.durability) html += `<div>내구도: ${item.durability}</div>`;
             if(item.weight) html += `<div>무게: ${item.weight}</div>`;
             if(item.toughness) html += `<div>강인함: ${item.toughness}</div>`;
             html += `</div>`;
        }
        
        // 쿨다운
        if (item.cooldown) {
            html += `<div style="color: #ffcc00;">재사용 대기시간: ${item.cooldown / 60}초</div>`;
        }

        // 시너지
        if (Array.isArray(item.synergies) && item.synergies.length > 0) {
            html += `<div style="margin-top: 4px; border-top: 1px solid #555; padding-top: 4px;"><strong>시너지</strong>`;
            for (const key of item.synergies) {
                const data = SYNERGIES[key];
                if (!data) continue;
                const icon = data.icon ? `${data.icon} ` : '';
                html += `<div style="color: #90ee90;">${icon}${data.name}</div>`;
                if (data.description) {
                    html += `<div style="font-size:11px; color:#ccc;">${data.description}</div>`;
                }
                if (Array.isArray(data.bonuses)) {
                    data.bonuses.forEach(b => {
                        html += `<div style="font-size:11px;">${b.count}개: ${b.description}</div>`;
                    });
                }
            }
            html += `</div>`;
        }

        return html;
    }

    _getMBTITooltip(mbti) {
        const info = MBTI_INFO[mbti] || '';
        const map = {
            E: '버프/회복을 아군에게 집중',
            I: '버프/회복을 자신에게 사용',
            S: '도구와 스킬을 즉시 사용',
            N: '도구와 스킬 사용을 아껴 둠',
            T: '약한 적을 우선 공격',
            F: '아군과 같은 적을 공격',
            P: '적을 보면 돌격',
            J: '거리를 유지하며 전투'
        };
        const behavior = mbti
            .split('')
            .map(l => map[l])
            .filter(Boolean)
            .join(', ');
        return `<strong>${mbti}</strong><br>${info}` +
               (behavior ? `<br><em>AI 경향: ${behavior}</em>` : '');
    }

    _getFaithTooltip(faithId) {
        const data = FAITHS[faithId] || FAITHS.NONE;
        let html = `<strong>${data.name}</strong><br>${data.description}`;
        if (data.statBonuses) {
            const bonusText = Object.entries(data.statBonuses)
                .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
                .join(', ');
            if (bonusText) html += `<br><em>보너스: ${bonusText}</em>`;
        }
        return html;
    }

    _getTraitTooltip(traitId) {
        const data = TRAITS[traitId];
        if (!data) return traitId;
        let html = `<strong>${data.name}</strong>`;
        if (data.description) html += `<br>${data.description}`;
        if (data.stats) {
            const stats = Object.entries(data.stats)
                .map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`)
                .join(', ');
            if (stats) html += `<br><em>${stats}</em>`;
        }
        return html;
    }

    _attachTooltip(element, html) {
        if (!this.tooltip) return;
        element.onmouseenter = (e) => {
            this.tooltip.innerHTML = html;
            this.tooltip.style.left = `${e.pageX + 10}px`;
            this.tooltip.style.top = `${e.pageY + 10}px`;
            this.tooltip.classList.remove('hidden');
        };
        element.onmouseleave = () => this.tooltip.classList.add('hidden');
        element.onmousemove = (e) => {
             this.tooltip.style.left = `${e.pageX + 10}px`;
             this.tooltip.style.top = `${e.pageY + 10}px`;
        }
    }
}
