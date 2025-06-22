# 용병 스킬 목록

이 문서에는 현재 게임에서 사용되는 용병 스킬 풀을 정리합니다. 각 스킬에는 간단한 설명과 태그가 붙어 있으며, 태그는 AI나 아이템 효과가 스킬을 분류하는 데 사용됩니다.

| ID | 이름 | 주요 태그 |
| --- | --- | --- |
| fireball | 파이어볼 | attack, magic, ranged, fire |
| heal | 치유 | support, healing, magic |
| purify | 정화 | support, cleanse, magic |
| charge_attack | 돌진 공격 | attack, melee, dash |
| double_strike | 이중 타격 | attack, melee, multi-hit |
| double_thrust | 연속 찌르기 | attack, ranged, multi-hit |
| iceball | 아이스볼 | attack, magic, ranged, ice |
| guardian_hymn | 수호의 찬가 | buff, shield, song |
| courage_hymn | 용기의 찬가 | buff, attack_up, song |
| hawk_eye | 호크 아이 | attack, ranged |
| might_aura | 힘의 오라 | buff, aura, passive |
| protect_aura | 수호 오라 | buff, aura, passive |
| regeneration_aura | 재생 오라 | buff, aura, passive |
| meditation_aura | 명상 오라 | buff, aura, passive |
| haste_aura | 가속 오라 | buff, aura, passive |
| concentration_aura | 집중 오라 | buff, aura, passive |
| condemn_aura | 단죄 오라 | buff, aura, passive |
| natural_aura | 자연 오라 | buff, aura, passive |
| berserk | 광전사 | buff, attack_up |
| fortress | 요새 | buff, defense_up |
| arcane_burst | 비전 폭발 | buff, magic_up |
| barrier | 결계 | buff, magic_resist_up |
| divinity | 신격화 | buff, stat_up |
| weaken | 약화 | debuff, attack_down |
| sunder | 분쇄 | debuff, defense_down |
| regression | 퇴행 | debuff, magic_down |
| spell_weakness | 마법 취약 | debuff, magic_resist_down |
| elemental_weakness | 원소 취약 | debuff, resist_down |

### 스킬 비고

- **이중 타격**: 한 번의 명령으로 두 차례 공격합니다.
- **돌진 공격**: 지정된 거리만큼 적에게 돌진한 뒤 공격을 가합니다.
- 스킬 효과는 문자열(`"poison"`)뿐 아니라 객체 형태도 허용됩니다. 예)
  `{ type: 'knockback', strength: 5 }`와 같이 지정하면 `SkillManager`가
  `KnockbackEngine`을 이용해 적을 밀쳐냅니다.

