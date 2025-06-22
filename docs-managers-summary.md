# 문서 및 매니저 개요

이 파일은 프로젝트에서 작성된 주요 문서들과 `src/managers` 디렉터리에 존재하는 매니저 모듈을 한눈에 정리합니다.

## 1. 문서 목록

| 파일 | 설명 |
| --- | --- |
| `README.md` | 프로젝트 전반의 개요와 개발 원칙을 설명합니다. |
| `AGENTS.md` | 계층형 AI 아키텍처와 그룹 전략, AI 유형 등을 정의한 설계 문서입니다. |
| `GAMEPLAY_GUIDE.md` | 게임을 실행하고 플레이하는 방법, 던전 생성과 몬스터 배치 등 기본 시스템을 안내합니다. |
| `VFX_GUIDE.md` | `VFXManager`의 역할과 기본 파티클 효과 구현 방법을 서술합니다. |
| `PARASITE_SYSTEM.md` | 몬스터가 지니는 기생 아이템 시스템의 개념을 간략히 소개합니다. |
| `FAULT_INJECTION_GUIDE.md` | MBTI AI와 힐러 AI 등을 대상으로 한 결함 주입 테스트 운영 지침을 기록합니다. |
| `config-summary.md` | 밸런스 수치와 스탯 계산식을 요약 정리한 표입니다. 실제 값은 코드와 데이터 모듈을 참조합니다. |
| `skills.md` | 용병 스킬 목록과 주요 태그를 정리합니다. |
| `state-machine.md` | 게임 상태와 AI 상태 전환 흐름을 도식화한 문서입니다. |
| `unit-features-plan.md` | MBTI 시스템, 신앙, 속도/턴 시스템 등 향후 유닛 관련 확장 계획을 모아둔 초안입니다. |
| `legacy-blueprint.md` | 과거 단일 파일 버전 구조를 분석하고 모듈화 방향성을 제시합니다. |
| `legacy-data-summary.md` | 이전 버전에서 사용된 아이템/몬스터 데이터 테이블을 보존용으로 요약합니다. |
| `src/data/artifacts.js` | 쿨다운을 가진 아티팩트 아이템 정의 모음입니다. |
| `WORKFLOWS_GUIDE.md` | `workflows.js` 모듈을 이용한 로직 묶기 지침을 설명합니다. |
| `test-log/embargo-review.md` | 엠바고 테스트 수행 결과와 특이사항을 기록합니다. |
| `codex's room/*` | Codex가 남긴 개발 계획(`plans.md`)과 세션별 작업 일지(`dev-log.md`) 등을 보관하는 디렉터리입니다. |
| `gemini's_room/*` | 외부 자문원인 Gemini의 피드백(`review-log.md`)과 장기 제안(`recommendations.md`)을 정리한 공간입니다. |

## 2. 매니저 모듈

아래 목록은 `src/managers` 폴더에 있는 주요 매니저 클래스들의 역할을 간략히 요약한 것입니다.

| 파일 | 간단한 역할 |
| --- | --- |
| `ai-managers.js` | 여러 유닛을 그룹으로 묶어 전략을 적용하는 `MetaAIManager`와 관련 클래스 정의. |
| `aquariumManager.js` | 수족관 맵에서 거품 효과 등 환경 연출을 담당합니다. |
| `effectManager.js` | 버프/디버프 및 지속 효과 처리를 담당합니다. |
| `equipmentManager.js` | 장비 장착과 해제 로직을 제공하며 태그 시스템과 연동됩니다. |
| `equipmentRenderManager.js` | 장비 외형을 엔티티 위에 그려 주는 렌더링 전담 모듈. |
| `eventManager.js` | 게임 전반의 이벤트 발행/구독을 담당하는 간단한 Pub/Sub 시스템. |
| `fileLogManager.js` | 노드 환경에서 전투 로그를 파일로 저장합니다. |
| `fogManager.js` | 맵 타일의 탐색 여부를 추적해 안개(Fog of War)를 구현합니다. |
| `item-ai-manager.js` | 아이템 사용 AI 로직을 묶어 관리합니다. |
| `itemManager.js` | 맵 위에 존재하는 아이템의 생성과 삭제, 렌더링을 담당합니다. |
| `layerManager.js` | 캔버스 레이어의 생성과 정렬을 통합 관리합니다. |
| `logManager.js` | 콘솔 또는 UI에 표시되는 로그 기록을 관리합니다. |
| `mercenaryManager.js` | 용병 생성, 고용, 상태 업데이트를 담당합니다. |
| `monsterManager.js` | 몬스터 스폰과 제거, 업데이트 루프를 관리합니다. |
| `motionManager.js` | 물리적 이동 애니메이션과 간단한 트위닝을 처리합니다. |
| `movementManager.js` | 유닛의 좌표 이동과 충돌 판정을 계산합니다. |
| `narrativeManager.js` | 스토리 플래그와 몬스터 도감 등 서사 관련 데이터를 저장합니다. |
| `parasiteManager.js` | 기생 아이템 획득과 효과 적용을 전담합니다. |
| `petManager.js` | 펫 소환과 성장, 중복 합성을 관리합니다. |
| `particleDecoratorManager.js` | 파티클 효과에 장식용 이미지를 추가하는 유틸리티 매니저. |
| `possessionAIManager.js` | 유령이 몬스터를 찾아 빙의시키고 빙의 상태를 관리합니다. |
| `pathfindingManager.js` | BFS 기반 길찾기 알고리즘을 제공합니다. |
| `projectileManager.js` | 투사체 생성과 업데이트, 충돌 처리를 담당합니다. |
| `saveLoadManager.js` | 게임 상태 저장과 불러오기를 처리합니다. |
| `skillManager.js` | 스킬 사용 쿨다운과 적용 로직을 관리합니다. |
| `soundManager.js` | 효과음 및 배경 음악 재생을 초기화합니다. |
| `speechBubbleManager.js` | 엔티티 머리 위에 대사나 스킬명을 표시하는 말풍선을 관리합니다. |
| `tagManager.js` | 아이템과 스킬에 부여된 태그를 조회해 AI나 다른 시스템에 전달합니다. |
| `traitManager.js` | 유닛의 특성 부여와 스탯 변화를 관리합니다. |
| `turnManager.js` | 턴 기반 전투 모드에서 행동 순서를 결정하도록 설계되었습니다. |
| `uiManager.js` | 인벤토리와 용병 패널 등 DOM 기반 UI 요소를 관리합니다. |
| `vfxManager.js` | 파티클 및 스프라이트 효과를 생성하여 시각 연출을 담당합니다. |
| `vfx/ParticleEngine.js` | 파티클과 이미터 생성을 전담하는 내부 엔진입니다. |
| `vfx/TextPopupEngine.js` | 데미지 수치 등 부유하는 텍스트 팝업을 관리합니다. |
| `../systems/KnockbackEngine.js` | 공격 피격 시 대상에게 밀쳐내기 효과와 시각 연출을 적용합니다. |
| `../micro/MicroEngine.js` | 미시 세계 전투와 아이템 상태 갱신을 담당하는 엔진입니다. |
| `../micro/MicroTurnManager.js` | 모든 아이템의 쿨타임 감소를 전담합니다. |

추가 매니저가 도입되면 이 목록을 계속 확장해 주세요.
