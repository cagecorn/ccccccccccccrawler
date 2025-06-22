# 에이전트 (Agents) 행동 설계

이 문서는 게임에 등장하는 모든 자율적 행동 주체(플레이어, 용병, 몬스터 등)의 인공지능(AI) 시스템 구조를 정의합니다.

## 1. AI 아키텍처 개요

본 게임의 AI는 **계층형 구조**를 가집니다. 이는 각 유닛이 단순히 주변 상황에만 반응하는 것을 넘어, 소속된 '그룹'의 '전략'과 자신에게 주어진 '역할', 그리고 고유의 '성격'에 따라 입체적으로 행동하게 만들기 위함입니다.

## 2. 핵심 개념

### 2.1. 그룹 (Group)
모든 유닛은 특정 '그룹'에 소속됩니다.
* **`player_party`**: 플레이어와 모든 아군 용병이 속한 그룹입니다.
* **`dungeon_monsters`**: 해당 층의 모든 몬스터가 속한 그룹입니다.
* **기타**: '보스와 부하들'처럼 특정 이벤트에 따라 새로운 그룹이 생성될 수 있습니다.

### 2.2. 메타 AI 매니저 (`MetaAIManager`)의 역할
`MetaAIManager`는 모든 그룹을 통제하는 최상위 사령부입니다.
* **주요 역할:** 매 프레임(`update` 루프)마다, 각 그룹의 '전략'과 '주변 상황 정보(`context`)'를 그룹에 속한 모든 멤버에게 전달하여, 각 멤버가 행동을 결정하도록 지시합니다.
* **의존 관계:** `MetaAIManager`는 직접 행동을 실행하지 않습니다. 대신, 각 유닛이 가진 `ai.decideAction()` 메서드를 호출하여 행동을 결정하게 하고, 결정된 행동(`action` 객체)을 `executeAction` 함수를 통해 실행합니다.

### 2.3. 전략 (Strategy)
각 그룹은 `MetaAIManager`에 의해 상위 '전략'을 할당받습니다. 이 전략은 그룹 전체의 행동 방향을 결정합니다.
* **`AGGRESSIVE` (공격적):** 시야 내의 적을 적극적으로 찾아 공격합니다.
* **`DEFENSIVE` (방어적):** 특정 지점이나 대상을 호위하며, 자신의 영역에 들어온 적에게만 반응합니다. (미래 구현)

### 2.4. AI 유형 (AI Archetype)
각 유닛은 자신의 '직업'이나 '종족'에 맞는 기본 행동 패턴, 즉 'AI 유형'을 가집니다. (`src/ai.js`에 정의)
* **`MeleeAI` (전사형):** 적에게 근접하여 싸웁니다.
* **`RangedAI` (원거리형):** 적과 거리를 유지하며 싸웁니다. (카이팅)
* **`HealerAI` (힐러형):** 아군의 생존을 최우선으로 생각하며, 회복 스킬을 우선적으로 사용합니다.

---

## 3. 최종 행동 결정 흐름

한 유닛이 최종 행동을 결정하기까지의 과정은 다음과 같습니다.

1.  **`MetaAIManager.update()` 호출:** `main.js`의 메인 루프가 `MetaAIManager`에게 업데이트를 명령합니다.
2.  **`context` 생성:** `MetaAIManager`는 각 유닛에게 필요한 주변 정보(적군 목록, 아군 목록 등)를 담은 `context` 객체를 생성합니다.
3.  **`decideAction()` 호출:** `MetaAIManager`는 각 유닛의 `ai` 속성에 할당된 AI 유형(예: `MeleeAI`)의 `decideAction(self, context)` 메서드를 호출합니다.
4.  **행동 결정:** `decideAction` 메서드는 전달받은 `context`와 자신의 상태(`self`)를 분석하여, `{ type: 'move', ... }` 또는 `{ type: 'attack', ... }` 같은 `action` 객체를 반환합니다.
5.  **상태 머신 연동:** `MetaAIManager`의 `executeAction` 함수는 반환된 `action` 객체에 따라 유닛의 실제 행동(이동, 공격)을 실행합니다. 이 과정은 **`state-machine.md`**에 정의된 `IdleState`, `ChasingState`, `AttackingState` 등의 상태로 전환되는 것과 같습니다. 예를 들어 `move` 액션은 `ChasingState`의 핵심 로직을, `attack` 액션은 `AttackingState`의 핵심 로직을 수행합니다.

### AI `context` 객체 예시
`decideAction`에 전달되는 `context` 객체는 다음과 같은 정보를 포함합니다.

```javascript
const context = {
    player: playerObject,         // 플레이어 객체
    allies: [ally1, ally2, ...],  // 자신을 포함한 모든 아군 목록
    enemies: [enemy1, enemy2, ...],// 모든 적군 목록
    mapManager: mapManagerObject,       // 맵 정보 및 벽 충돌 확인용
    eventManager: eventManagerObject    // 이벤트 발행용
};
4. 확장 계획: 태그와 성격(MBTI) 시스템
4.1. 태그 기반 AI 전환
목표: 장착한 무기의 '태그'에 따라 AI 유형이 동적으로 변경됩니다.
적용 방안: 유닛의 equip() 메서드가 호출될 때, 새로 장착한 무기의 tags 배열을 확인합니다. 만약 'ranged' 태그가 있다면, 해당 유닛의 ai 속성을 new RangedAI()로 교체합니다. 'melee' 태그가 있다면 new MeleeAI()로 교체합니다. 이를 통해 '검을 든 궁수'는 근접 AI를 갖게 됩니다.
4.2. 성격(MBTI) 기반 행동 미세 조정
목표: 같은 AI 유형이라도, '성격'에 따라 다른 행동 우선순위를 갖게 합니다.
적용 방안 (예시):
HealerAI의 decideAction 메서드는 회복 대상을 찾을 때, 힐러 자신의 mbti 속성을 확인합니다.
if (self.properties.mbti.includes('I')): 자신을 먼저 치유 대상으로 고려합니다.
else if (self.properties.mbti.includes('E')): 자신을 포함한 모든 아군 중 가장 위급한 대상을 먼저 고려합니다.

### 4.3. MBTI 팝업 이벤트 분리
AI 로직은 더 이상 직접 MBTI 텍스트 팝업을 생성하지 않습니다. 대신
`ai_mbti_trait_triggered` 이벤트를 발행하여 게임(`game.js`)이 이를 받아
`VFXManager.addTextPopup`으로 시각 효과를 표시합니다. 이 방식은 VFX 처리와
AI 판단 과정을 분리해 테스트와 유지 보수를 용이하게 합니다.
5. 테스트 및 디버깅
AI 로직은 두 가지 방식으로 테스트하고 확인할 수 있습니다.

단위/통합 테스트:
tests/ai.test.js와 tests/eventManager.integration.test.js 파일에서 AI의 특정 행동 규칙이 올바르게 작동하는지 자동으로 검증합니다.
실행: 프로젝트 폴더에서 npm test 명령어를 실행하거나, test.html 파일을 브라우저에서 열어 콘솔을 확인합니다.
시각적 디버거:
debug.html 페이지를 사용하여, 특정 조건 없이 맵과 유닛의 행동을 시각적으로 빠르게 확인할 수 있습니다.
실행: debug.html 파일을 브라우저에서 엽니다.
