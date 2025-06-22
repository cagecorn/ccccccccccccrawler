# 미시세계 시스템 개요

## 미시세계란?
GAMEPLAY_GUIDE.md에서 미시세계는 아이템과 장비가 독자적인 생태계를 이루는 공간으로 정의됩니다. 거시세계가 플레이어와 몬스터 같은 유닛을 주체로 삼는다면 미시세계는 장비 아이템과 소모품이 주체가 됩니다. 무기 숙련도나 아이템 쿨타임처럼 유닛의 행동 뒤에서 별도로 진행되는 메커니즘을 다룹니다.

## 주요 구성 요소

### MicroEngine
- 전투 이벤트를 구독해 무기 경험치와 사용자의 숙련도를 증가시킵니다.
- 매 프레임 모든 아이템을 `MicroTurnManager`에 전달하여 쿨타임을 갱신합니다.

### MicroTurnManager
- 각 아이템의 스킬 쿨다운과 범용 쿨타임을 한 턴씩 감소시킵니다.

### WeaponStatManager
- 무기 레벨과 경험치를 관리하며, 레벨에 따라 스킬을 해금합니다.
- 무기 종류에 맞는 전용 AI 객체를 생성해 돌려줍니다.

### MicroItemAIManager
- 주어진 무기에서 해당 무기 AI를 조회합니다.

### MicroCombatManager
- 공격자의 무기와 수비자의 방어구를 비교하여 내구도를 감소시킵니다.
- 내구도가 0이 되면 `weapon_disarmed` 또는 `armor_broken` 이벤트를 발행합니다.
- 장비 등급에 따라 파괴 여부를 제한하는 위계 규칙을 갖습니다.

### Weapon AI와 스킬 데이터
- `WeaponAI.js`에는 검, 단검, 활, 창 등 무기별 AI 클래스가 정의돼 있습니다.
- `weapon-skills.js`에는 각 무기 레벨별 스킬과 쿨타임이 목록화되어 있습니다.

## 이벤트 흐름
1. `entity_attack` 이벤트 발생 시 `MicroCombatManager`가 먼저 무기 대 방어구 전투를 처리합니다.
2. `attack_landed` 이벤트가 발행되면 `MicroEngine`이 무기 경험치와 숙련도를 갱신합니다.
3. 게임 루프에서 `MicroEngine.update()`가 호출되어 모든 아이템의 쿨타임이 감소합니다.

## 테스트
- `tests/microCombat.test.js`에서 무장해제, 방어구 파괴, 등급 제한 규칙을 검증합니다.
- `tests/microCooldown.test.js`는 아이템 쿨타임 감소 로직을 확인합니다.
- `tests/microWorld.integration.test.js`는 공격 성공 시 무기 경험치와 숙련도 상승을 통합 테스트합니다.

