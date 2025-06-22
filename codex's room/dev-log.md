# 개발 일지

## 세션 1
- `codex's room` 디렉터리 생성.
- `README.md`, `plans.md`, `dev-log.md` 초기화.
- 앞으로 이곳에 매 세션 작업 내용을 기록할 것.

## 세션 2
- 힐러 직업과 `HealerAI` 구현.
- 고유 스킬 `heal`을 사용해 아군을 회복하도록 테스트 추가.
- `CharacterFactory`가 `jobId: 'healer'`를 처리하도록 수정.

## 세션 3
- MBTI 데이터 테이블 추가.
- `CharacterFactory`가 무작위 MBTI를 부여하도록 수정.
- 해당 기능을 검증하는 테스트 `mbti.test.js` 작성.

## 세션 4
- 파일 전투 로그 매니저(`FileLogManager`) 구현.
- 'log' 이벤트를 파일로 기록하도록 추가.
- `fileLogManager.test.js` 테스트로 동작 확인.

## 세션 5
- 맵 매니저에 `LAVA` 타일 타입을 추가하고 랜덤 풀 생성 기능 구현.
- 새 지형이 렌더링되도록 이미지 로직 보강.
- `countTiles` 헬퍼와 연결성 테스트 업데이트, 용암 생성 테스트 추가.

## 세션 6
- `HealerAI`가 MBTI 성향에 따라 치유 시점을 다르게 판단하도록 개선.
- `ai.test.js`에 감각형/직관형 행동 테스트 두 가지를 추가.

## 세션 7
- `PathfindingManager.findPath`가 시작과 끝이 같을 때 바로 빈 배열을 반환하도록 수정.
- `pathfindingManager.test.js`에 해당 케이스 테스트 추가.

## 세션 8
- 수족관 맵에서 환경 효과를 테스트하기 위해 `bubble` 피처 타입을 추가.
- `AquariumManager`가 `bubble` 타입을 처리하여 VFX 이미터를 배치하도록 수정.
- `aquarium.test.js`에 거품 이미터 생성 여부 테스트 추가.

## 세션 9
- ParasiteManager에 중복 기생체 결합 기능 구현.
- Item 클래스에 rank 속성 추가 및 저장 상태 갱신.
- 기생체 결합 로직 테스트 추가.

## 세션 10
- SummonerAI 클래스 추가로 소환사 행동 로직 구현.
- `summon_skeleton` 스킬 데이터를 정의하여 소환 행동이 가능하도록 함.
- 기본 테스트 `summonerAI.test.js`로 스킬 사용 여부 검증.

## 세션 11
- SummonerAI가 `maxMinions` 값을 고려하여 소환수를 제한하도록 수정.
- 테스트에 최대 소환수 로직을 검증하는 케이스 추가.

## 세션 12
- 아티팩트 아이템 시스템 초안 구현. `healing_talisman` 샘플을 추가하고 쿨다운이 돌아가도록 엔티티와 ItemAIManager를 수정.
- 새 테스트 `artifact.test.js`에서 아티팩트 사용 및 쿨다운 갱신을 검증.

## 세션 13
- 알파벳 상태 효과 8종을 `effects.js`에 추가.
- `StatManager`가 상태 효과를 감지해 스탯 보너스를 적용하도록 수정.
- 새 테스트 `alphabetState.test.js`로 이동 속도 증가를 확인.
