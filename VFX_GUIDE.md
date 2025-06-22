# VFX 시스템 가이드

이 문서는 게임 내 시각 효과(VFX)를 어떻게 다루는지 간략하게 설명합니다.

## VFXManager 역할
- `VFXManager`는 파티클과 스프라이트 효과를 관리합니다.
- 내부적으로는 `ParticleEngine`과 `TextPopupEngine` 두 엔진을 사용해 파티클과 팝업
  처리를 전담합니다.
- `addGlow(x, y, options)` : 이동하는 투사체의 잔광 등을 만듭니다.
- `addSpriteEffect(image, x, y, options)` : 특정 위치에 잠깐 표시되는 이미지 효과를 추가합니다.
- `flashEntity(entity, options)` : 대상 스프라이트를 잠깐 특정 색으로 덮어써 반짝이는 효과를 만듭니다.

## 파티클 애니메이션 기법

- **폭발형(`addParticleBurst`)** : 한 지점에서 여러 파티클이 퍼져나갑니다.
- **분출형(`addEmitter`)** : 일정 시간 동안 파티클을 계속 뿜어내는 이미터를 생성합니다.
- **궤적형(`createTrail`)** : 움직이는 객체의 위치를 따라 짧게 남는 잔상을 만듭니다.
- **유도형(`addHomingBurst`)** : 목표 지점을 향해 모여드는 파티클을 생성합니다.

## 기본 공격 스트라이크 이펙트
- 파일: `assets/images/strike-effect.png`
- `entity_attack` 이벤트가 발생할 때 스킬에 투사체가 없다면 해당 이펙트를 대상 위에 덮어씌웁니다.
- 이미지는 `screen` 블렌드 모드로 표시되고, 동시에 작은 **붉은 파티클**이 퍼져나갑니다.

## 아이스볼 투사체
- 파일: `assets/images/ice-ball-effect.png`
- `iceball` 스킬의 투사체 이미지로 사용됩니다.
- 파이어볼과 동일하게 이동 중 파티클 잔광이 생성됩니다.
- 두 투사체 모두 이미지 레이어는 `screen` 블렌드 모드로 그려집니다.

## 피격 시 빨간 플래시
- `entity_damaged` 이벤트가 발생하면 `flashEntity`가 호출되어 피해를 받은 유닛의 스프라이트를 잠깐 빨갛게 덮어씁니다.
- 기본 지속 시간은 약 6프레임이며, 필요하면 옵션으로 조절할 수 있습니다.

각 기법의 세부 동작은 다음과 같습니다.

1. **폭발형** : `count`, `color` 등의 옵션을 지정해 순간적으로 다수의 파티클을 생성합니다.
2. **분출형** : `spawnRate`와 `duration` 값을 설정해 원하는 시간 동안 파티클이 계속 나오도록 합니다.
3. **궤적형** : `createTrail`에 대상 객체를 전달하면 프레임마다 새로운 파티클을 조금씩 생성해 잔상 효과를 만듭니다.
4. **유도형** : `addHomingBurst`는 `target`을 지정하여 파티클들이 해당 지점을 향해 서서히 모입니다.

위 기능들은 모두 `vfxManager` 인스턴스를 통해 호출할 수 있습니다.

## 신규 효과: Bubble Emitter
- `AquariumManager`의 `bubble` 피처가 호출되면 맵의 임의 위치에 거품 파티클 이미터가 생성됩니다.
- 해당 이미터는 `spawnRate`를 조절해 지속적으로 파티클을 분출하며, `gravity` 값을 음수로 주어 위로 떠오르는 움직임을 연출합니다.

## MBTI 텍스트 팝업 처리
AI가 성격(MBTI) 특성을 발동하면 `ai_mbti_trait_triggered` 이벤트가 발생합니다.
`Game` 클래스는 이를 구독해 `VFXManager.addTextPopup()`을 호출하며, 실제
시각 효과는 이곳에서 생성됩니다. AI 로직에서는 이벤트만 발행하므로 팝업 표시
동작을 손쉽게 조정할 수 있습니다.
