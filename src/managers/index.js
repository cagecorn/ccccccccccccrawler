// src/managers/index.js
// 이 파일은 프로젝트의 모든 매니저를 한 곳에서 불러오고, 다시 내보내는 역할을 합니다.

import { MonsterManager } from './monsterManager.js';
import { MercenaryManager } from './mercenaryManager.js';
import { ItemManager } from './itemManager.js';
import { EquipmentManager } from './equipmentManager.js';
import { UIManager } from './uiManager.js';
import { VFXManager } from './vfxManager.js';
import { SkillManager } from './skillManager.js';
import { SoundManager } from './soundManager.js';
import { EffectManager } from './effectManager.js';
import { ProjectileManager } from './projectileManager.js';
import { ItemAIManager } from './item-ai-manager.js';
import { MotionManager } from './motionManager.js';
import { MovementManager } from './movementManager.js';
import { EquipmentRenderManager } from './equipmentRenderManager.js';
import { ParticleDecoratorManager } from './particleDecoratorManager.js';
import { TraitManager } from './traitManager.js';
import { ParasiteManager } from './parasiteManager.js';
import { MicroItemAIManager } from './microItemAIManager.js';
import { EffectIconManager } from './effectIconManager.js';
import { PetManager } from './petManager.js';
import { MetaAIManager } from './metaAIManager.js';
import { SynergyManager } from '../micro/SynergyManager.js';
import { SpeechBubbleManager } from './speechBubbleManager.js';
import { AuraManager } from './AuraManager.js';
import { PossessionAIManager } from './possessionAIManager.js';
// 파일 기반 로거는 Node 환경 전용이라 기본 묶음에서 제외한다
// import { FileLogManager } from './fileLogManager.js';
// ... (나중에 다른 매니저가 생기면 여기에 추가)

export {
    MonsterManager,
    MercenaryManager,
    ItemManager,
    EquipmentManager,
    UIManager,
    VFXManager,
    SkillManager,
    SoundManager,
    EffectManager,
    ProjectileManager,
    ItemAIManager,
    MotionManager,
    MovementManager,
    EquipmentRenderManager,
    ParticleDecoratorManager,
    TraitManager,
    ParasiteManager,
    MicroItemAIManager,
    PetManager,
    EffectIconManager,
    MetaAIManager,
    PossessionAIManager,
    AuraManager,
    SynergyManager,
    SpeechBubbleManager,
};
